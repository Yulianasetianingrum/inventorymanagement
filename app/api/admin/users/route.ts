// D:\inventorymanagement\app\api\admin\users\route.ts

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { readJsonOrForm } from "@/lib/validators";
import { hashSecret } from "@/lib/auth/password";
import { AuthType, Role } from "@prisma/client";

export const runtime = "nodejs";

const ensureAdmin = async () => {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;

  // IMPORTANT: select() to avoid querying removed columns (ex: pinHash)
  const actor = await prisma.user.findUnique({
    where: { employeeId: session.employeeId },
    select: { id: true, employeeId: true, name: true, role: true },
  });

  // Jika user tidak ditemukan (misal data terhapus tapi session masih ada), tetap izinkan dengan fallback session.
  return (
    actor ?? {
      id: undefined as unknown as string | undefined,
      employeeId: session.employeeId,
      name: session.name ?? "Admin",
      role: "ADMIN",
    }
  );
};

// Alphanumeric 10 chars
const randomPassword = () =>
  randomBytes(12)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10);

const prefixForRole = (role: Role) => (role === "ADMIN" ? "ADM" : "WKR");

async function generateEmployeeId(role: Role) {
  const prefix = prefixForRole(role);
  const existing = await prisma.user.findMany({
    where: { employeeId: { startsWith: `${prefix}-` } },
    select: { employeeId: true },
  });

  let max = 0;
  for (const row of existing) {
    const match = row.employeeId?.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (match) {
      const num = Number(match[1]);
      if (Number.isFinite(num)) max = Math.max(max, num);
    }
  }

  const next = String(max + 1).padStart(3, "0");
  return `${prefix}-${next}`;
}

const isStrongAlnum = (s: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,32}$/.test(s);

const normalizeRole = (raw: unknown): Role => {
  const v = String(raw ?? "").toUpperCase();
  if (v === "ADMIN") return "ADMIN";
  return "WORKER";
};

export async function GET(req: Request) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const roleParam = (url.searchParams.get("role") || "ALL").toUpperCase();

  const where =
    roleParam === "ALL"
      ? {}
      : {
          role: normalizeRole(roleParam),
        };

  const users = await prisma.user.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    // IMPORTANT: select() to avoid pinHash and avoid leaking passwordHash
    select: {
      id: true,
      employeeId: true,
      name: true,
      role: true,
      authType: true,
      isActive: true,
      lastLoginAt: true,
      notes: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ data: { users } });
}

export async function POST(req: Request) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await readJsonOrForm(req);

    let employeeId = String(body.employeeId ?? "").trim().toUpperCase();
    const name = String(body.name ?? "").trim();
    const role = normalizeRole(body.role ?? "WORKER");
    const phone = body.phone != null ? String(body.phone).trim() : null;
    const notes = body.notes != null ? String(body.notes).trim() : null;

    if (!name) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }
    if (!employeeId) {
      employeeId = await generateEmployeeId(role);
    }

    // Password-only: accept optional newCredential; if empty -> random
    const requested = body.newCredential != null ? String(body.newCredential).trim() : "";
    const credential = requested ? requested : randomPassword();

    if (requested && !isStrongAlnum(requested)) {
      return NextResponse.json(
        { error: "Password harus 6-32 karakter, huruf+angka (minimal 1 huruf & 1 angka), tanpa simbol." },
        { status: 400 }
      );
    }

    const passwordHash = await hashSecret(credential);

    const user = await prisma.user.create({
      data: {
        employeeId,
        name,
        role,
        authType: AuthType.PASSWORD,
        passwordHash,
        isActive: true,
        phone,
        notes,
      },
      // IMPORTANT: do not return passwordHash
      select: {
        id: true,
        employeeId: true,
        name: true,
        role: true,
        authType: true,
        isActive: true,
        lastLoginAt: true,
        notes: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // best-effort audit
    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE_USER",
          userId: actor.id,
          targetUserId: user.id,
          metaJson: JSON.stringify({ role: user.role, authType: user.authType }),
        },
      });
    } catch {}

    return NextResponse.json({ data: { user, credential } });
  } catch (error) {
    const code = (error as any)?.code;
    if (code === "P2002") {
      return NextResponse.json({ error: "Employee ID sudah dipakai" }, { status: 409 });
    }
    console.error("Failed to create user", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
