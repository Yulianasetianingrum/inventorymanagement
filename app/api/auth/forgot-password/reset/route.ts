import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSecret } from "@/lib/auth/password";

export async function POST(req: Request) {
    try {
        const { employeeId, code, newPassword } = await req.json();

        if (!employeeId || !code || !newPassword) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { employeeId }
        });

        if (!user || user.resetCode !== code) {
            return NextResponse.json({ error: "ID atau Kode Verifikasi salah" }, { status: 400 });
        }

        if (!user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
            return NextResponse.json({ error: "Kode verifikasi sudah kadaluarsa" }, { status: 400 });
        }

        // Hash the new password
        const passwordHash = await hashSecret(newPassword);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetCode: null,
                resetCodeExpiresAt: null
            }
        });

        return NextResponse.json({ ok: true, message: "Kata sandi berhasil diatur ulang." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
