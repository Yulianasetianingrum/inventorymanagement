import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJsonOrForm } from "@/lib/validators";
import { getSession } from "@/lib/auth/session";
import { Role } from "@prisma/client";

const ensureAdmin = async () => {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  const actor = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
  return (
    actor ?? {
      id: undefined as unknown as string | undefined,
      employeeId: session.employeeId,
      role: "ADMIN" as Role,
    }
  );
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await readJsonOrForm(req);
    const name = body.name ? String(body.name) : undefined;
    const role = body.role as Role | undefined;
    const phone = body.phone ? String(body.phone) : undefined;
    const notes = body.notes ? String(body.notes) : undefined;
    const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const before = await prisma.user.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_USER",
        userId: actor.id,
        targetUserId: user.id,
        metaJson: JSON.stringify({ before, after: user }),
      },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    console.error("Failed to update user", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.employeeId === "SYSTEM" || user.employeeId === "ADM-001") {
      return NextResponse.json({ error: "User ini tidak boleh dihapus" }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        action: "DELETE_USER",
        userId: actor.id,
        targetUserId: user.id,
        metaJson: JSON.stringify({ employeeId: user.employeeId, role: user.role }),
      },
    });

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    console.error("Failed to delete user", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
