import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

async function ensureAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return prisma.user.findUnique({ where: { employeeId: session.employeeId } });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const picklist = await prisma.picklist.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: { select: { id: true, name: true, employeeId: true } },
        createdBy: { select: { id: true, name: true } },
        lines: {
          include: {
            item: {
              include: {
                storageLocation: true
              }
            }
          }
        },
        events: {
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { name: true } } }
        },
        evidence: true
      }
    });

    if (!picklist) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: picklist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.picklist.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "Picklist not found" }, { status: 404 });
    }

    if (existing.status === "PICKED" || existing.status === "DELIVERED") {
      return NextResponse.json({
        error: "Tidak dapat menghapus picklist yang sudah diproses (Status: " + existing.status + ")"
      }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.picklistLine.deleteMany({ where: { picklistId: id } }),
      prisma.picklistEvent.deleteMany({ where: { picklistId: id } }),
      prisma.picklist.delete({ where: { id } })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Failed to delete picklist", error);
    return NextResponse.json({ error: "Gagal menghapus picklist" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      projectId,
      title,
      mode,
      neededAt,
      assigneeId,
      notes,
      items // Array<{ itemId, reqQty }>
    } = body;

    const existing = await prisma.picklist.findUnique({
      where: { id },
      include: { lines: true }
    });

    if (!existing) return NextResponse.json({ error: "Picklist not found" }, { status: 404 });
    if (existing.status === "DELIVERED") return NextResponse.json({ error: "Cannot edit delivered picklist" }, { status: 400 });

    const updatedPicklist = await prisma.$transaction(async (tx) => {
      // 1. Update Header
      const header = await tx.picklist.update({
        where: { id },
        data: {
          projectId,
          title,
          mode,
          neededAt: neededAt ? new Date(neededAt) : null,
          assigneeId,
          notes,
          updatedAt: new Date()
        }
      });

      // 2. Re-create lines (simplest way to handle adds/removes/edits)
      // Only allowed if not yet picking/delivered, or we assume admin override.
      // For now, full overwrite is safe as long as stock isn't "allocated" in a hard way yet (stock deduction happens at delivery).

      await tx.picklistLine.deleteMany({ where: { picklistId: id } });

      if (items && items.length > 0) {
        await tx.picklistLine.createMany({
          data: items.map((it: any) => ({
            picklistId: id,
            itemId: it.itemId,
            reqQty: it.reqQty,
            usedQty: 0,
            returnedQty: 0
          }))
        });
      }

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          action: "UPDATE_PICKLIST",
          userId: actor.id,
          detail: `Updated picklist ${existing.code}`,
          metaJson: JSON.stringify({ oldAssignee: existing.assigneeId, newAssignee: assigneeId, itemCount: items.length })
        }
      });

      return header;
    });

    return NextResponse.json({ ok: true, data: updatedPicklist });
  } catch (error: any) {
    console.error("Failed to update picklist", error);
    return NextResponse.json({ error: "Failed to update picklist" }, { status: 500 });
  }
}
