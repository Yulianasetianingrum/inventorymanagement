import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

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
        }
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
