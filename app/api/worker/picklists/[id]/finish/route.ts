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
  if (picklist.status !== PicklistStatus.PICKING) {
    return NextResponse.json({ error: "Harus status PICKING" }, { status: 400 });
  }
  if (picklist.startedById && picklist.startedById !== user.id) {
    return NextResponse.json({ error: "Picklist sedang dikerjakan oleh worker lain" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const image = body.image; // Base64 or URL

  if (!image) {
    return NextResponse.json({ error: "Bukti foto (scan) wajib diunggah" }, { status: 400 });
  }

  // Update Stock Logic: Reduce stockNew
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Picklist status and image
      await tx.picklist.update({
        where: { id },
        data: {
          status: PicklistStatus.PICKED,
          pickedAt: new Date(),
          pickingImage: image,
          startedById: picklist.startedById || user.id,
          events: { create: { eventType: "FINISH_PICKING", actorUserId: user.id } },
        },
      });

      // 2. Reduce stockNew for each picked item using FIFO
      for (const line of picklist.lines) {
        const actualPicked = line.pickedQty > 0 ? line.pickedQty : line.reqQty;
        if (actualPicked > 0) {
          // Update the line with the actual picked qty if it was 0
          if (line.pickedQty === 0) {
            await tx.picklistLine.update({
              where: { id: line.id },
              data: { pickedQty: line.reqQty }
            });
          }

          // FIFO DEDUCTION
          let remainingToDeduct = actualPicked;

          // Find all "baru" batches for this item, sorted by date (oldest first)
          const batches = await tx.stockInBatch.findMany({
            where: {
              itemId: line.itemId,
              qtyRemaining: { gt: 0 }
            },
            orderBy: { date: "asc" }
          });

          for (const batch of batches) {
            if (remainingToDeduct <= 0) break;

            const mode = /^mode:(baru|bekas)\|\|(.*)$/s.exec(batch.note || "")?.[1] || "baru";
            if (mode !== "baru") continue; // Only deduct from NEW stock batches

            const qtyInBatch = Number(batch.qtyRemaining);
            const deduct = Math.min(qtyInBatch, remainingToDeduct);

            await tx.stockInBatch.update({
              where: { id: batch.id },
              data: {
                qtyRemaining: {
                  decrement: deduct
                }
              }
            });

            remainingToDeduct -= deduct;
          }

          // Legacy sync: update item table
          await tx.item.update({
            where: { id: line.itemId },
            data: {
              stockNew: {
                decrement: actualPicked
              }
            }
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Finish picking failed", err);
    return NextResponse.json({ error: "Gagal menyelesaikan picking: " + err.message }, { status: 500 });
  }
}
