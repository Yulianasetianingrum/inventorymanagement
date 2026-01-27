import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PicklistStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || (session.role !== "WORKER" && session.role !== "ADMIN")) {
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
  if (picklist.status !== PicklistStatus.PICKING) {
    return NextResponse.json({ error: "Harus status PICKING" }, { status: 400 });
  }
  if (picklist.startedById && picklist.startedById !== user.id) {
    return NextResponse.json({ error: "Picklist sedang dikerjakan oleh worker lain" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const images = body.images || (body.image ? [body.image] : []);
  const lineModes = body.lineModes || {}; // { lineId: "baru" | "bekas" }

  if (images.length === 0) {
    return NextResponse.json({ error: "Bukti foto (scan) wajib diunggah" }, { status: 400 });
  }

  // Save all images
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

  // Validate Stock Availability for INTERNAL Picklists
  if (picklist.mode !== "EXTERNAL") {
    for (const line of picklist.lines) {
      const mode = lineModes[line.id] || "baru";
      const qtyNeeded = line.pickedQty > 0 ? line.pickedQty : line.reqQty;

      const freshItem = await prisma.item.findUnique({
        where: { id: line.itemId },
        select: { stockNew: true, stockUsed: true, name: true }
      });

      if (!freshItem) return NextResponse.json({ error: `Item ${line.itemId} not found` }, { status: 400 });

      if (mode === "baru" && freshItem.stockNew < qtyNeeded) {
        return NextResponse.json({
          error: `Stok BARU untuk item "${freshItem.name}" tidak mencukupi (Butuh: ${qtyNeeded}, Ada: ${freshItem.stockNew})`
        }, { status: 400 });
      }

      if (mode === "bekas" && freshItem.stockUsed < qtyNeeded) {
        return NextResponse.json({
          error: `Stok BEKAS untuk item "${freshItem.name}" tidak mencukupi (Butuh: ${qtyNeeded}, Ada: ${freshItem.stockUsed})`
        }, { status: 400 });
      }
    }
  }

  // Update Stock Logic: Reduce stockNew
  try {
    await prisma.$transaction(async (tx) => {
      // 0. Ensure column exists (Temporary Fix for sync issues)
      await tx.$executeRawUnsafe("ALTER TABLE picklist_lines ADD COLUMN IF NOT EXISTS stockMode VARCHAR(191) NOT NULL DEFAULT 'baru'").catch(() => { });

      // 1. Update Picklist status and image
      await tx.picklist.update({
        where: { id },
        data: {
          status: PicklistStatus.PICKED,
          pickedAt: new Date(),
          pickingImage: savedUrls[0], // Legacy support
          startedById: picklist.startedById || user.id,
          events: { create: { eventType: "FINISH_PICKING", actorUserId: user.id } },
          evidence: {
            create: savedUrls.map(url => ({
              imageUrl: url,
              type: "PICKING"
            }))
          }
        },
      });

      // 2. Handle Stock Updates based on Mode
      for (const line of picklist.lines) {
        const actualPicked = line.pickedQty > 0 ? line.pickedQty : line.reqQty;
        const selectedMode = lineModes[line.id] || "baru"; // "baru" | "bekas"

        if (actualPicked > 0) {
          // Update the line metadata first
          await tx.$executeRaw`
             UPDATE picklist_lines 
             SET pickedQty = ${actualPicked}, stockMode = ${selectedMode} 
             WHERE id = ${line.id}
           `;

          if (picklist.mode === "EXTERNAL") {
            // --- EXTERNAL MODE: ADD STOCK ---

            // A. Create a new Stock Batch
            // Note: We don't have supplier/price info here easily, so we set defaults.
            // Ideally we should prompt for unitCost, but for now 0 is safe.
            await tx.stockInBatch.create({
              data: {
                itemId: line.itemId,
                date: new Date(),
                qtyInBase: actualPicked,     // BigInt compatible if using Prisma types, but here simple number works for create
                unitCost: 0,
                qtyRemaining: actualPicked,
                note: `Restock via Picklist #${picklist.code} (Mode: ${selectedMode})`
              }
            });

            // B. Update Item Totals
            if (selectedMode === "baru") {
              await tx.$executeRaw`UPDATE items SET stockNew = stockNew + ${actualPicked} WHERE id = ${line.itemId}`;
            } else {
              await tx.$executeRaw`UPDATE items SET stockUsed = stockUsed + ${actualPicked} WHERE id = ${line.itemId}`;
            }

          } else {
            // --- INTERNAL MODE: DEDUCT STOCK (FIFO) ---

            // A. Find matches using Raw SQL
            const batches: any[] = await tx.$queryRaw`
               SELECT id, qtyRemaining 
               FROM stock_in_batches 
               WHERE itemId = ${line.itemId} 
                 AND qtyRemaining > 0 
                 AND note LIKE ${`%mode:${selectedMode}%`}
               ORDER BY date ASC
             `;

            let remainingToDeduct = actualPicked;

            for (const batch of batches) {
              if (remainingToDeduct <= 0) break;

              const qtyInBatch = Number(batch.qtyRemaining);
              const deduct = Math.min(qtyInBatch, remainingToDeduct);

              await tx.$executeRaw`
                 UPDATE stock_in_batches 
                 SET qtyRemaining = qtyRemaining - ${deduct} 
                 WHERE id = ${batch.id}
               `;

              remainingToDeduct -= deduct;
            }

            // B. Legacy sync: update item table
            if (selectedMode === "baru") {
              await tx.$executeRaw`UPDATE items SET stockNew = stockNew - ${actualPicked} WHERE id = ${line.itemId}`;
            } else {
              await tx.$executeRaw`UPDATE items SET stockUsed = stockUsed - ${actualPicked} WHERE id = ${line.itemId}`;
            }
          }
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Finish picking failed", err);
    return NextResponse.json({ error: "Gagal menyelesaikan picking: " + err.message }, { status: 500 });
  }
}
