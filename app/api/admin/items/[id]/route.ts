import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJsonOrForm } from "@/lib/validators";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

async function ensureAdminOrOwner() {
  const session = await getSession();
  if (!session) return null;
  // Allow ADMIN and OWNER to manage master data
  if (session.role !== "ADMIN" && session.role !== "OWNER") return null;
  return prisma.user.findUnique({ where: { employeeId: session.employeeId } });
}

function toIntId(raw: string) {
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) return null;
  return Math.trunc(id);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const actor = await ensureAdminOrOwner();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await Promise.resolve(params);
  const itemId = toIntId(resolved.id);
  if (!itemId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: item });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const actor = await ensureAdminOrOwner();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await Promise.resolve(params);
  const itemId = toIntId(resolved.id);
  if (!itemId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const payload = (await readJsonOrForm(req)) as any;

  const data: any = {};
  const pickString = (k: string) => {
    const v = payload?.[k];
    if (typeof v === "string") data[k] = v.trim() || null;
  };
  const pickInt = (k: string) => {
    const v = payload?.[k];
    if (v === "" || v === null || v === undefined) return;
    const n = Number(v);
    if (Number.isFinite(n)) data[k] = Math.trunc(n);
  };
  const pickBool = (k: string) => {
    const v = payload?.[k];
    if (typeof v === "boolean") data[k] = v;
    if (typeof v === "string") data[k] = v === "true" || v === "1";
  };

  pickString("name");
  pickString("brand");
  pickString("category");
  // pickString("location"); // Map manually below
  pickString("barcode");
  pickString("size");
  pickString("unit");
  pickInt("stockNew");
  pickInt("stockUsed");
  pickInt("minStock");
  pickBool("isActive");

  // Map location -> locationLegacy
  if (typeof payload?.location === "string") {
    data.locationLegacy = payload.location.trim() || null;
  }

  try {
    // 1. Separate barcode from standard Prisma data to avoid "Unknown argument" errors
    // if the client is out of sync.
    const barcodeToUpdate = data.barcode;
    delete data.barcode;

    // 2. Perform standard update
    let updated = await prisma.item.update({
      where: { id: itemId },
      data: data as any,
    });

    // 3. Update barcode using raw SQL as a robust fallback
    if (barcodeToUpdate !== undefined) {
      await prisma.$executeRawUnsafe(
        `UPDATE items SET barcode = ? WHERE id = ?`,
        barcodeToUpdate,
        itemId
      );
      // Re-fetch to return complete object
      const refreshed = await prisma.item.findUnique({ where: { id: itemId } });
      if (refreshed) updated = refreshed;
    }

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Nama + size sudah ada" }, { status: 409 });
    }
    console.error("Failed to update item", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// IMPORTANT:
// UI calls this "softDelete" already. Requirement change: hapus item sekaligus
// riwayat stok di database.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const actor = await ensureAdminOrOwner();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await Promise.resolve(params);
  const itemId = toIntId(resolved.id);
  if (!itemId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const existing = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.stockInBatch.deleteMany({ where: { itemId } }),
      prisma.item.delete({ where: { id: itemId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete item", err);
    return NextResponse.json({ error: "Failed to delete item/riwayat" }, { status: 500 });
  }
}
