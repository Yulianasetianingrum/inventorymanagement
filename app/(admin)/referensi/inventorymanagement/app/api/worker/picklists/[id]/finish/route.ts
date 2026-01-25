import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PicklistStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const picklist = await prisma.picklist.findUnique({
    where: { id: params.id },
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

  const shortageLines = picklist.lines.filter((l) => l.pickedQty < l.reqQty && !l.shortageReason);
  if (shortageLines.length > 0) {
    return NextResponse.json({ error: "Lengkapi alasan shortage untuk semua item kurang" }, { status: 400 });
  }

  await prisma.picklist.update({
    where: { id: params.id },
    data: {
      status: PicklistStatus.PICKED,
      pickedAt: new Date(),
      startedById: picklist.startedById || user.id,
      events: { create: { eventType: "FINISH_PICKING", actorUserId: user.id } },
    },
  });

  return NextResponse.json({ ok: true });
}
