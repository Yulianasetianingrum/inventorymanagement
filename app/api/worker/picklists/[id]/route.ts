import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    const authorizedRoles = ["WORKER", "ADMIN", "OWNER", "PURCHASING", "WAREHOUSE_LEAD"];
    if (!session || !authorizedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const picklist = await prisma.picklist.findUnique({
      where: { id },
      include: {
        assignee: true,
        lines: { include: { item: { include: { storageLocation: true } } } },
        project: true,
        events: { include: { actor: true }, orderBy: { createdAt: "desc" } },
        evidence: true
      },
    }) as any;

    if (!picklist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner = picklist.assignee?.employeeId === session.employeeId;
    const isAdmin = session.role === "ADMIN" || session.role === "OWNER";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: picklist });
  } catch (error: any) {
    console.error("[GET_WORKER_PICKLIST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
