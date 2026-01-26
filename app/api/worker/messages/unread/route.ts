import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const count = await prisma.message.count({
            where: {
                receiverId: user.id,
                isRead: false
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch unread count" }, { status: 500 });
    }
}
