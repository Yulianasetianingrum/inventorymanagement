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
    include: { assignee: true },
  });
  if (!picklist || picklist.assignee?.id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (picklist.status !== PicklistStatus.READY) {
    return NextResponse.json({ error: "Picklist bukan READY" }, { status: 400 });
  }

  await prisma.picklist.update({
    where: { id: params.id },
    data: {
      status: PicklistStatus.PICKING,
      startedAt: new Date(),
      startedById: user.id,
      events: { create: { eventType: "START_PICKING", actorUserId: user.id } },
    },
  });

  return NextResponse.json({ ok: true });
}
