// D:\inventorymanagement\app\api\admin\users\[id]\reset-credential\route.ts

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { readJsonOrForm } from "@/lib/validators";
import { hashSecret } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { AuthType } from "@prisma/client";

export const runtime = "nodejs";

const ensureAdmin = async () => {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  const actor = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
  return (
    actor ?? {
      id: undefined as unknown as string | undefined,
      employeeId: session.employeeId,
      role: "ADMIN",
    }
  );
};

// Password alphanumeric 10 chars (huruf+angka)
const randomPassword = () =>
  randomBytes(12)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10);

const isStrongAlnum = (s: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,32}$/.test(s);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await readJsonOrForm(req);
    const reason = body.reason ? String(body.reason).slice(0, 200) : "reset by admin";
    const requested = body.newCredential != null ? String(body.newCredential).trim() : "";

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (target.employeeId === "SYSTEM") return NextResponse.json({ error: "Cannot reset SYSTEM user" }, { status: 400 });

    const isSuperAdmin = actor.employeeId === "ADM-001";
    const isTargetSuper = target.employeeId === "ADM-001";
    const isTargetAdmin = target.role === "ADMIN";

    // Rule:
    // - ADM-001: boleh reset siapa saja.
    // - Admin lain: boleh reset dirinya sendiri; boleh reset worker; tidak boleh reset admin lain.
    if (!isSuperAdmin && isTargetSuper) {
      return NextResponse.json({ error: "Hanya ADM-001 yang boleh direset oleh ADM-001." }, { status: 403 });
    }
    if (!isSuperAdmin && isTargetAdmin && actor.employeeId !== target.employeeId) {
      return NextResponse.json({ error: "Anda tidak bisa mereset admin lain." }, { status: 403 });
    }

    // Password-only: "PIN" sudah tidak dipakai. Semua reset dianggap password campuran huruf+angka.
    const previousAuthType = (target as any).authType ?? null;

    let credential: string;
    if (requested) {
      if (!isStrongAlnum(requested)) {
        return NextResponse.json(
          { error: "Password harus 6-32 karakter, huruf+angka (minimal 1 huruf & 1 angka), tanpa simbol." },
          { status: 400 }
        );
      }
      credential = requested;
    } else {
      credential = randomPassword();
    }

    const hashed = await hashSecret(credential);

    // IMPORTANT: pinHash sudah dihapus dari DB. Jadi update hanya passwordHash.
    const user = await prisma.user.update({
      where: { id: target.id },
      data: {
        passwordHash: hashed,
        // bikin konsisten di UI (kalau kolom authType masih ada)
        authType: AuthType.PASSWORD,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "RESET_USER_CREDENTIAL",
        userId: actor.id,
        targetUserId: user.id,
        metaJson: JSON.stringify({ reason, previousAuthType, forcedAuthType: "PASSWORD" }),
      },
    });

    return NextResponse.json({
      data: {
        user,
        credential, // tampil sekali ke admin
      },
    });
  } catch (error) {
    console.error("Failed to reset credential", error);
    return NextResponse.json({ error: "Failed to reset credential" }, { status: 500 });
  }
}
