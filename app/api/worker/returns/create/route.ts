import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session || session.role !== "WORKER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { items, images } = body;
        // items: Array<{ itemId: number, qty: number }>
        // images: Array<base64 string>

        if (!items || items.length === 0 || !images || images.length === 0) {
            return NextResponse.json({ error: "Data tidak lengkap (Item & Foto wajib)" }, { status: 400 });
        }

        // Save images
        const { saveBase64Image } = await import("@/lib/storage");
        const savedUrls: string[] = [];
        try {
            for (const img of images) {
                const url = await saveBase64Image(img);
                savedUrls.push(url);
            }
        } catch (e) {
            console.error("Image saving failed", e);
            return NextResponse.json({ error: "Gagal menyimpan foto" }, { status: 500 });
        }

        // Transaction: Increase Stock Used & Update Source Line
        await prisma.$transaction(async (tx) => {
            for (const line of items) {
                const qty = Number(line.qty);
                const sourceLineId = line.sourceLineId;
                if (qty <= 0 || !sourceLineId) continue;

                // 1. Validate Balance on Source Line
                const sourceLine = await tx.picklistLine.findUnique({
                    where: { id: sourceLineId },
                    select: {
                        pickedQty: true,
                        usedQty: true,
                        returnedQty: true,
                        picklist: { select: { neededAt: true, assigneeId: true, createdById: true } }
                    }
                });

                if (!sourceLine) throw new Error(`Source line ${sourceLineId} not found`);
                if (sourceLine.picklist?.assigneeId !== user.id) {
                    throw new Error("Picklist tidak sesuai dengan user");
                }
                if (sourceLine.picklist?.neededAt && sourceLine.picklist.neededAt < new Date()) {
                    const isSelfScan = sourceLine.picklist?.assigneeId === user.id && sourceLine.picklist?.createdById === user.id;
                    if (!isSelfScan) {
                        throw new Error("Deadline picklist sudah lewat. Tidak bisa return.");
                    }
                }

                // Allow returning any item that was picked and not yet returned (ignoring 'used' status)
                const holding = sourceLine.pickedQty - sourceLine.returnedQty;

                if (qty > holding) throw new Error(`Return quantity exceeds holding balance for item`);

                // 2. Create Batch "Bekas"
                await tx.stockInBatch.create({
                    data: {
                        itemId: line.itemId,
                        date: new Date(),
                        qtyInBase: qty,
                        qtyRemaining: qty,
                        unitCost: 0, // Used items have 0 cost for stock value
                        note: `mode:bekas||Ad-hoc Return from source line ${sourceLineId} by ${user.name}`
                    }
                });

                // 3. Update PicklistLine: increment returnedQty AND decrement usedQty (if applicable)
                // We blindly decrement usedQty. If it goes negative, it implies we returned "New" items as "Used".
                // This is acceptable as per user instruction to push to "Stok Bekas".
                await tx.picklistLine.update({
                    where: { id: sourceLineId },
                    data: {
                        returnedQty: { increment: qty },
                        usedQty: { decrement: qty }
                    }
                });

                // 4. Update Legacy Item stockUsed (Global counter for 'bekas')
                await tx.item.update({
                    where: { id: line.itemId },
                    data: {
                        stockUsed: { increment: qty }
                    }
                });
            }

            // Log mechanism? We don't have a "Return" object independent of Picklist in schema currently.
            // We only have `Picklist` or `StockInBatch`.
            // We created `StockInBatch`, that's the record.
            // We should also add an audit log.

            await tx.auditLog.create({
                data: {
                    action: "ADHOC_RETURN",
                    userId: user.id,
                    detail: `Returned ${items.length} items (Ad-hoc)`,
                    metaJson: JSON.stringify({ items, imageUrls: savedUrls })
                }
            });
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Ad-hoc return failed", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
