import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const picklist = await prisma.picklist.findUnique({
    where: { id: params.id },
    include: {
      assignee: true,
      lines: { include: { item: true } },
      project: true,
      handover: true,
      returns: { include: { lines: { include: { item: true } } } },
      events: { include: { actor: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!picklist || picklist.assignee?.employeeId !== session.employeeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: picklist });
}
