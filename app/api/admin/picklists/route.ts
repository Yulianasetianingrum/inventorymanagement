import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

async function ensureAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return prisma.user.findUnique({ where: { employeeId: session.employeeId } });
}

export async function GET() {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const picklists = await prisma.picklist.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        project: true,
        assignee: {
          select: { id: true, name: true, employeeId: true }
        },
        createdBy: {
          select: { id: true, name: true }
        },
        _count: {
          select: { lines: true }
        }
      }
    });

    return NextResponse.json({ data: picklists });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      projectId,
      newProject, // { namaProjek, namaKlien, noHpWa, keperluan }
      title,
      mode,
      neededAt,
      assigneeId,
      notes,
      items // Array<{ itemId, reqQty }>
    } = body;

    let finalProjectId = projectId;

    // Handle automated project creation if needed
    if (!projectId && newProject && newProject.namaProjek) {
      const createdProject = await prisma.project.create({
        data: {
          namaProjek: newProject.namaProjek,
          namaKlien: newProject.namaKlien || "Tanpa Nama",
          noHpWa: newProject.noHpWa || "-",
          keperluan: newProject.keperluan || "",
        }
      });
      finalProjectId = createdProject.id;
    }

    // Generate unique code for picklist (e.g. PKL-20240123-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.picklist.count({
      where: {
        code: { startsWith: `PKL-${dateStr}` }
      }
    });
    const code = `PKL-${dateStr}-${String(count + 1).padStart(4, "0")}`;

    const picklist = await prisma.picklist.create({
      data: {
        code,
        projectId: finalProjectId,
        title: title || `Picklist ${code}`,
        mode: mode || "INTERNAL",
        neededAt: neededAt ? new Date(neededAt) : null,
        assigneeId,
        createdById: actor.id,
        notes,
        lines: {
          create: items.map((it: any) => ({
            itemId: it.itemId,
            reqQty: it.reqQty,
          }))
        }
      },
      include: {
        lines: true
      }
    });

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE_PICKLIST",
          userId: actor.id,
          detail: `Created picklist ${code}`,
          metaJson: JSON.stringify({ mode, projectId: finalProjectId, itemCount: items.length })
        }
      });
    } catch { }

    return NextResponse.json({ ok: true, data: picklist });
  } catch (error: any) {
    console.error("Failed to create picklist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
