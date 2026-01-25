import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PicklistStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== "WORKER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const picklist = await prisma.picklist.findUnique({
        where: { id },
        include: { assignee: true, lines: true },
    });

    if (!picklist || picklist.assignee?.id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can only return if it was picked (PICKED or DELIVERED for idempotent)
    if (picklist.status !== PicklistStatus.PICKED) {
        return NextResponse.json({ error: "Status harus PICKED untuk melakukan return" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { image, lines } = body; // lines: Array<{ id: string, usedQty: number, returnedQty: number }>

        if (!image) {
            return NextResponse.json({ error: "Bukti foto pengembalian wajib diunggah" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Update status and return image
            await tx.picklist.update({
                where: { id },
                data: {
                    status: PicklistStatus.DELIVERED,
                    deliveredAt: new Date(),
                    returnImage: image,
                    events: { create: { eventType: "RETURN_AND_DELIVER", actorUserId: user.id } },
                }
            });

            // 2. Process each line and update stockUsed
            for (const inputLine of lines) {
                const dbLine = picklist.lines.find(l => l.id === inputLine.id);
                if (!dbLine) continue;

                // Update picklist line with results
                await tx.picklistLine.update({
                    where: { id: inputLine.id },
                    data: {
                        usedQty: inputLine.usedQty,
                        returnedQty: inputLine.returnedQty
                    }
                });

                // If something returned AND worker wants it back in stock
                if (inputLine.returnedQty > 0 && inputLine.addToStock !== false) {
                    // 1. Create a "bekas" batch in StockInBatch table
                    await tx.stockInBatch.create({
                        data: {
                            itemId: dbLine.itemId,
                            date: new Date(),
                            qtyInBase: inputLine.returnedQty,
                            qtyRemaining: inputLine.returnedQty,
                            unitCost: 0, // Returned items have 0 acquisition cost for valuation
                            note: `mode:bekas||Returned from Picklist ${picklist.code}`
                        }
                    });

                    // 2. Legacy sync: increment stockUsed on item
                    await tx.item.update({
                        where: { id: dbLine.itemId },
                        data: {
                            stockUsed: {
                                increment: inputLine.returnedQty
                            }
                        }
                    });
                }
            }
        });

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Return project failed", err);
        return NextResponse.json({ error: "Gagal memproses return: " + err.message }, { status: 500 });
    }
}
