import { NextResponse } from "next/server";
import { getPicklistById, listPicklists } from "@/modules/picklists";
import { readJsonOrForm } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { PicklistPriority, PicklistStatus, ItemCondition, Role } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const range = searchParams.get("range") || "all";
  let dateFilter: Date | undefined;
  const now = new Date();
  if (range === "1m") {
    dateFilter = new Date(now);
    dateFilter.setMonth(now.getMonth() - 1);
  } else if (range === "1y") {
    dateFilter = new Date(now);
    dateFilter.setFullYear(now.getFullYear() - 1);
  } else if (range === "5y") {
    dateFilter = new Date(now);
    dateFilter.setFullYear(now.getFullYear() - 5);
  }
  if (id) {
    const picklist = await getPicklistById(id);
    return NextResponse.json({ data: picklist });
  }
  const picklists = await listPicklists(dateFilter);
  const data = picklists.map((p) => {
    const progressDone = p.lines.filter((l) => l.pickedQty >= l.reqQty).length;
    const progressTotal = p.lines.length || 1;
    const shortage = p.lines.filter((l) => l.pickedQty < l.reqQty).length;
    return {
      id: p.id,
      code: p.code,
      title: p.title ?? p.project?.name ?? "",
      project: p.project?.name ?? undefined,
      status: p.status,
      assigned: p.assignee?.employeeId ?? undefined,
      neededAt: p.neededAt ? p.neededAt.toISOString().slice(0, 10) : undefined,
      progressDone,
      progressTotal,
      shortage,
      createdAt: p.createdAt.toISOString().slice(0, 10),
    };
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const body = await readJsonOrForm(req);
    type LineInput = {
      itemId: string;
      reqQty: number;
      pickedQty?: number;
      uomSnapshot?: string;
      areaSnapshot?: string;
      shortageReason?: string;
      condition?: ItemCondition | null;
      notes?: string;
      sortOrder?: number;
    };
    const lines = Array.isArray(body.lines) ? (body.lines as LineInput[]) : [];

    if (!body.title && !body.projectId) {
      return NextResponse.json({ error: "title atau projectId wajib diisi" }, { status: 400 });
    }
    if (!lines.length) {
      return NextResponse.json({ error: "Lines wajib diisi" }, { status: 400 });
    }

    // Pastikan ada user "SYSTEM" sebagai creator fallback
    const systemUser = await prisma.user.upsert({
      where: { employeeId: "SYSTEM" },
      update: {},
      create: {
        id: "system",
        employeeId: "SYSTEM",
        name: "System",
        role: Role.ADMIN,
      },
    });

    // Jika ada worker yang diisi, cari berdasarkan employeeId
    let assigneeId: string | null = null;
    if (body.workerId) {
      const worker = await prisma.user.findUnique({ where: { employeeId: String(body.workerId) } });
      assigneeId = worker?.id ?? null;
    }

    // Siapkan item lines dengan memastikan InventoryItem ada (upsert by sku)
    const preparedLines = await Promise.all(
      lines.map(async (l) => {
        const sku = String(l.itemId);
        const item = await prisma.inventoryItem.upsert({
          where: { sku },
          update: {},
          create: {
            sku,
            name: sku,
            quantity: 0,
          },
        });
        return {
          itemId: item.id,
          reqQty: Number(l.reqQty ?? 0),
          pickedQty: Number(l.pickedQty ?? 0),
          uomSnapshot: String(l.uomSnapshot ?? "pcs"),
          areaSnapshot: String(l.areaSnapshot ?? "AREA-GENERAL"),
          shortageReason: l.shortageReason ? String(l.shortageReason) : null,
          condition: l.condition ?? null,
          notes: l.notes ? String(l.notes) : null,
          sortOrder: Number(l.sortOrder ?? 0),
        };
      })
    );

    // Jika project diisi, gunakan/buat project berdasar nama
    let projectId: string | null = null;
    if (body.projectId) {
      const projectName = String(body.projectId);
      const existingProject = await prisma.project.findFirst({ where: { name: projectName } });
      const project = existingProject || (await prisma.project.create({ data: { name: projectName } }));
      projectId = project.id;
    }

    // generate code unik sederhana berbasis waktu + random
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(2, 12);
    const rand = Math.floor(Math.random() * 900 + 100);
    const code = `PL-${stamp}-${rand}`;

    const picklist = await prisma.picklist.create({
      data: {
        code,
        projectId,
        title: body.title ? String(body.title) : null,
        status: PicklistStatus.READY,
        priority: body.priority === "URGENT" ? PicklistPriority.URGENT : PicklistPriority.NORMAL,
        neededAt: body.neededAt ? new Date(String(body.neededAt)) : null,
        assigneeId,
        createdById: systemUser.id,
        notes: body.notes ? String(body.notes) : null,
        lines: {
          create: preparedLines,
        },
        events: {
          create: [
            { eventType: "CREATED", actorUserId: systemUser.id },
            ...(assigneeId ? [{ eventType: "ASSIGNED", actorUserId: systemUser.id }] : []),
          ],
        },
      },
      include: { lines: true },
    });

    return NextResponse.json({ data: picklist });
  } catch (error) {
    console.error("Failed to create picklist", error);
    return NextResponse.json({ error: "Failed to create picklist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await readJsonOrForm(req);
    const id = body.id ? String(body.id) : null;
    if (!id) {
      return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const returns = await tx.return.findMany({ where: { picklistId: id }, select: { id: true } });
      if (returns.length) {
        const returnIds = returns.map((r) => r.id);
        await tx.returnLine.deleteMany({ where: { returnId: { in: returnIds } } });
      }
      await tx.return.deleteMany({ where: { picklistId: id } });
      await tx.handover.deleteMany({ where: { picklistId: id } });
      await tx.picklistEvent.deleteMany({ where: { picklistId: id } });
      await tx.picklistLine.deleteMany({ where: { picklistId: id } });
      await tx.picklist.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete picklist", error);
    return NextResponse.json({ error: "Failed to delete picklist" }, { status: 500 });
  }
}
