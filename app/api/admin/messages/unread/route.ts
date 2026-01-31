import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const unread = await prisma.message.findMany({
      where: { receiverId: user.id, isRead: false },
      select: {
        senderId: true,
        sender: { select: { id: true, name: true, employeeId: true, role: true } }
      }
    });

    const map = new Map<string, any>();
    for (const m of unread) {
      if (!m.senderId || !m.sender) continue;
      const existing = map.get(m.senderId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(m.senderId, {
          id: m.sender.id,
          name: m.sender.name,
          employeeId: m.sender.employeeId,
          role: m.sender.role,
          count: 1
        });
      }
    }

    return NextResponse.json({ data: Array.from(map.values()) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
