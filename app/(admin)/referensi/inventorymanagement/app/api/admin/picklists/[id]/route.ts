import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { readJsonOrForm } from "@/lib/validators";
import { PicklistStatus } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await readJsonOrForm(req);
  const action = String(body.action || "");

  const picklist = await prisma.picklist.findUnique({ where: { id } });
  if (!picklist) return NextResponse.json({ error: "Picklist not found" }, { status: 404 });

  try {
    switch (action) {
      case "reassign": {
        const employeeId = body.assigneeId ? String(body.assigneeId) : "";
        if (!employeeId) return NextResponse.json({ error: "assigneeId required" }, { status: 400 });
        const worker = await prisma.user.findUnique({ where: { employeeId } });
        if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });
        await prisma.picklist.update({
          where: { id },
          data: { assigneeId: worker.id, events: { create: { eventType: "ASSIGNED", actorUserId: picklist.createdById } } },
        });
        return NextResponse.json({ ok: true });
      }
      case "cancel": {
        await prisma.picklist.update({
          where: { id },
          data: {
            status: PicklistStatus.CANCELED,
            canceledAt: new Date(),
            events: { create: { eventType: "CANCELED", actorUserId: picklist.createdById } },
          },
        });
        return NextResponse.json({ ok: true });
      }
      case "markDelivered": {
        await prisma.picklist.update({
          where: { id },
          data: {
            status: PicklistStatus.DELIVERED,
            deliveredAt: new Date(),
            events: { create: { eventType: "DELIVERED", actorUserId: picklist.createdById } },
          },
        });
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Failed to update picklist", err);
    return NextResponse.json({ error: "Failed to update picklist" }, { status: 500 });
  }
}
