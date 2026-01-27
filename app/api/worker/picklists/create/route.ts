import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { PicklistStatus, PicklistMode } from "@prisma/client";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session || session.role !== "WORKER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { projectId, items, images } = body;
        // items: Array<{ itemId: number, qty: number }>
        // images: Array<base64 string> (evidence)

        if (!projectId || !items || items.length === 0 || !images || images.length === 0) {
            return NextResponse.json({ error: "Data tidak lengkap (Project, Item, & Foto wajib)" }, { status: 400 });
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
            console.error("Image save failed", e);
            return NextResponse.json({ error: "Gagal menyimpan foto" }, { status: 500 });
        }

        // Generate Code
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const count = await prisma.picklist.count({
            where: { code: { startsWith: `PL-${dateStr}` } }
        });
        const code = `PL-${dateStr}-${String(count + 1).padStart(4, "0")}`;

        // --- VALIDATION: Check Stock Availability ---
        // Fetch fresh item data
        const itemIds = items.map((i: any) => i.itemId);
        const dbItems = await prisma.item.findMany({
            where: { id: { in: itemIds } }
        });

        for (const reqItem of items) {
            const dbItem = dbItems.find(i => i.id === reqItem.itemId);
            if (!dbItem) continue; // Should catch earlier if critical, but skip for now

            const mode = reqItem.stockMode || "baru";
            const available = mode === "baru" ? dbItem.stockNew : dbItem.stockUsed;

            if (reqItem.qty > available) {
                return NextResponse.json({
                    error: `Stok tidak cukup untuk ${dbItem.name}. Tersedia (${mode}): ${available}, Diminta: ${reqItem.qty}`
                }, { status: 400 });
            }
        }
        // --------------------------------------------

        // Transaction: Create Picklist + Deduct Stock
        await prisma.$transaction(async (tx) => {
            // 0. Ensure column exists (Temporary Fix for sync issues)
            await tx.$executeRawUnsafe("ALTER TABLE picklist_lines ADD COLUMN IF NOT EXISTS stockMode VARCHAR(191) NOT NULL DEFAULT 'baru'").catch(() => { });

            // 1. Create Picklist (Status: PICKED because worker took it)
            const picklist = await tx.picklist.create({
                data: {
                    code,
                    projectId,
                    title: `Pengambilan Mandiri (Self-Service)`,
                    mode: PicklistMode.INTERNAL,
                    status: PicklistStatus.DELIVERED, // Self-service is auto-delivered
                    neededAt: new Date(),
                    assigneeId: user.id,
                    createdById: user.id, // Self-created
                    startedById: user.id,
                    startedAt: new Date(),
                    pickedAt: new Date(),
                    deliveredAt: new Date(),
                    pickingImage: savedUrls[0],
                    evidence: {
                        create: savedUrls.map(url => ({
                            imageUrl: url,
                            type: "PICKING"
                        }))
                    },
                    lines: {
                        create: items.map((it: any) => ({
                            itemId: it.itemId,
                            reqQty: it.qty,
                            pickedQty: it.qty, // Auto-fulfilled
                            usedQty: it.qty,   // Initial assumption: all used (until returned)
                            // stockMode: it.stockMode || "baru" // REMOVED to bypass stale client
                        }))
                    },
                    events: {
                        create: {
                            eventType: "SELF_SERVICE_PICK",
                            actorUserId: user.id
                        }
                    }
                },
                include: { lines: true }
            });

            // 2. Update stockMode using Raw SQL (Bypass Prisma Client lag)
            for (const line of picklist.lines) {
                const requestedItem = items.find((it: any) => it.itemId === line.itemId);
                const mode = requestedItem?.stockMode || "baru";
                await tx.$executeRaw`UPDATE picklist_lines SET stockMode = ${mode} WHERE id = ${line.id}`;
            }

            // 3. Deduct Stock Logic (FIFO)
            for (const line of items) {
                let remaining = Number(line.qty);
                const mode = line.stockMode || "baru";

                // Find batches matching the requested mode - Using Raw SQL for more control
                const batches: any[] = await tx.$queryRaw`
                    SELECT id, qtyRemaining 
                    FROM stock_in_batches 
                    WHERE itemId = ${line.itemId} 
                      AND qtyRemaining > 0 
                      AND note LIKE ${`%mode:${mode}%`}
                    ORDER BY date ASC
                `;

                for (const batch of batches) {
                    if (remaining <= 0) break;

                    const available = Number(batch.qtyRemaining);
                    const deduct = Math.min(available, remaining);

                    await tx.$executeRaw`
                        UPDATE stock_in_batches 
                        SET qtyRemaining = qtyRemaining - ${deduct} 
                        WHERE id = ${batch.id}
                    `;
                    remaining -= deduct;
                }

                // Legacy sync using Raw SQL
                if (mode === "baru") {
                    await tx.$executeRaw`UPDATE items SET stockNew = stockNew - ${line.qty} WHERE id = ${line.itemId}`;
                } else {
                    await tx.$executeRaw`UPDATE items SET stockUsed = stockUsed - ${line.qty} WHERE id = ${line.itemId}`;
                }
            }
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Self service failed", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
