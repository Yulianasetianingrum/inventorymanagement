import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PicklistStatus, ReceiverDept } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const dept = body.receiverDept as ReceiverDept;
  const receiverName = body.receiverName ? String(body.receiverName).trim() : "";
  const notes = body.notes ? String(body.notes) : null;
  if (!dept || !receiverName) return NextResponse.json({ error: "Dept dan nama penerima wajib diisi" }, { status: 400 });

  const picklist = await prisma.picklist.findUnique({
    where: { id: params.id },
    include: { assignee: true },
  });
  if (!picklist || picklist.assignee?.id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (picklist.status !== PicklistStatus.PICKED) {
    return NextResponse.json({ error: "Selesaikan picking dulu" }, { status: 400 });
  }

  await prisma.picklist.update({
    where: { id: params.id },
    data: {
      status: PicklistStatus.DELIVERED,
      deliveredAt: new Date(),
      handover: {
        create: {
          receiverDept: dept,
          receiverName,
          confirmedByUserId: user.id,
          confirmedAt: new Date(),
          notes,
        },
      },
      events: { create: { eventType: "HANDOVER", actorUserId: user.id } },
    },
  });

  return NextResponse.json({ ok: true });
}
