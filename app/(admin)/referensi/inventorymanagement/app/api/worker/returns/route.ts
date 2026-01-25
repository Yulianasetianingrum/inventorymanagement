import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ItemCondition } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const picklistId = body.picklistId ? String(body.picklistId) : "";
  const lines: Array<{ itemId: string; qty: number; condition: ItemCondition; notes?: string }> = Array.isArray(body.lines)
    ? body.lines
    : [];
  if (!picklistId || !lines.length) return NextResponse.json({ error: "picklistId dan lines wajib" }, { status: 400 });

  const picklist = await prisma.picklist.findUnique({
    where: { id: picklistId },
    include: { assignee: true },
  });
  if (!picklist || picklist.assignee?.id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ret = await prisma.return.create({
    data: {
      picklistId,
      createdByUserId: user.id,
      notes: body.notes ? String(body.notes) : null,
      lines: {
        create: lines.map((l) => ({
          itemId: String(l.itemId),
          qty: Number(l.qty ?? 0),
          condition: l.condition,
          notes: l.notes ? String(l.notes) : null,
        })),
      },
    },
  });

  await prisma.picklistEvent.create({
    data: {
      picklistId,
      actorUserId: user.id,
      eventType: "RETURN_CREATED",
    },
  });

  return NextResponse.json({ data: ret });
}
