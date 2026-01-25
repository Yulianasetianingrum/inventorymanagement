import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "WORKER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const picklists = await prisma.picklist.findMany({
      where: {
        assigneeId: user.id,
        status: { not: "CANCELED" }
      },
      orderBy: { createdAt: "desc" },
      include: {
        project: true,
        _count: { select: { lines: true } }
      }
    });

    return NextResponse.json({ data: picklists });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
