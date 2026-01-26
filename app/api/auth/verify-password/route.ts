import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { verifySecret } from "@/lib/auth/password";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session || !session.employeeId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password) {
        return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { employeeId: session.employeeId },
        select: { passwordHash: true }
    });

    if (!user || !user.passwordHash) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await verifySecret(password, user.passwordHash);
    if (!isValid) {
        return NextResponse.json({ error: "Password salah" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
}
