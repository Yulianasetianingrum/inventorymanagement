import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "OWNER"] },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        employeeId: true
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ data: admins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
