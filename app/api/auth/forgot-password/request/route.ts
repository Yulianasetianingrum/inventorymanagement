import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { employeeId } = await req.json();

        if (!employeeId) {
            return NextResponse.json({ error: "Employee ID wajib diisi" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { employeeId },
            select: { id: true, phone: true }
        });

        if (!user) {
            // Don't reveal if user exists or not for security, but in this context 404 is fine
            return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
        }

        // Generate 6-digit numeric code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetCode,
                resetCodeExpiresAt: expires
            }
        });

        // Simulated WA link for the admin phone
        const adminPhone = "081214239373";
        const waMessage = `Halo Admin, saya lupa sandi. Ini kode verifikasi saya: ${resetCode} (ID: ${employeeId}). Mohon bantuan reset.`;
        const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waMessage)}`;

        return NextResponse.json({
            ok: true,
            message: "Kode verifikasi telah dibuat.",
            waLink
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
