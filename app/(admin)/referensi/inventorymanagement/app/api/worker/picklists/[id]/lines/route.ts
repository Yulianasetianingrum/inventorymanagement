import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PicklistStatus } from "@prisma/client";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const changes: Array<{ lineId: string; pickedQty: number; shortageReason?: string | null; condition?: any; notes?: string | null }> =
    Array.isArray(body.lines) ? body.lines : [];

  const picklist = await prisma.picklist.findUnique({
    where: { id: params.id },
    include: { assignee: true },
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

  for (const c of changes) {
    if (c.pickedQty < 0) return NextResponse.json({ error: "pickedQty tidak valid" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    for (const c of changes) {
      const line = await tx.picklistLine.findUnique({ where: { id: c.lineId } });
      if (!line || line.picklistId !== params.id) continue;
      if (c.pickedQty > line.reqQty) throw new Error("pickedQty tidak boleh lebih dari reqQty");
      const shortage = c.pickedQty < line.reqQty;
      if (shortage && !c.shortageReason) throw new Error("shortageReason wajib diisi");
      await tx.picklistLine.update({
        where: { id: c.lineId },
        data: {
          pickedQty: c.pickedQty,
          shortageReason: shortage ? c.shortageReason ?? "" : null,
          condition: c.condition ?? null,
          notes: c.notes ?? null,
        },
      });
    }
    await tx.picklist.update({
      where: { id: params.id },
      data: {
        startedById: picklist.startedById || user.id,
        events: { create: { eventType: "UPDATE_LINES", actorUserId: user.id } },
      },
    });
  });

  return NextResponse.json({ ok: true });
}
