import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJsonOrForm } from "@/lib/validators";
import { getSession } from "@/lib/auth/session";

const composeNote = (mode: "baru" | "bekas", note?: string | null) => `mode:${mode}||${note ?? ""}`;

async function ensureAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return prisma.user.findUnique({ where: { employeeId: session.employeeId } });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await Promise.resolve(params);
  const idStr = resolved?.id ?? new URL(req.url).pathname.split("/").at(-2);
  const itemId = Number(idStr);
  if (!itemId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await readJsonOrForm(req);
    const qty = Number(body.qty ?? 0);
    const mode = body.mode === "bekas" ? "bekas" : "baru";
    const unitQty = body.unitQty === "pack" ? "pack" : "satuan";
    const isiPerPack = unitQty === "pack" ? Number(body.isiPerPack ?? 0) : 1;
    const harga = Number(body.harga ?? 0);
    const priceType = body.priceType === "per_pack" ? "per_pack" : "per_satuan";
    const supplierId = body.supplierId ? Number(body.supplierId) : null;
    const note = body.note ? String(body.note).trim() : null;
    const dateVal = body.date ? new Date(String(body.date)) : new Date();

    if (qty <= 0 || Number.isNaN(qty)) return NextResponse.json({ error: "Qty wajib lebih dari 0" }, { status: 400 });
    if (unitQty === "pack" && (isiPerPack <= 0 || Number.isNaN(isiPerPack)))
      return NextResponse.json({ error: "Isi per pack wajib lebih dari 0" }, { status: 400 });

    const qtyBase = unitQty === "pack" ? qty * isiPerPack : qty;
    const unitCost = mode === "bekas" ? 0 : priceType === "per_pack" ? Math.floor(harga / isiPerPack) : harga;
    if (qtyBase <= 0 || Number.isNaN(qtyBase)) return NextResponse.json({ error: "Qty base tidak valid" }, { status: 400 });
    if (mode === "baru" && (unitCost <= 0 || Number.isNaN(unitCost)))
      return NextResponse.json({ error: "Unit cost tidak valid" }, { status: 400 });

    const item = await prisma.item.findFirst({ where: { id: itemId, isActive: true } });
    if (!item) return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });

    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
      if (!supplier) return NextResponse.json({ error: "Supplier tidak ditemukan" }, { status: 400 });
    }

    if (mode === "bekas" && (item.stockNew ?? 0) < qtyBase) {
      return NextResponse.json({ error: "Stok baru tidak cukup untuk dipindah ke bekas" }, { status: 400 });
    }

    const noteStored = composeNote(mode, note);

    await prisma.$transaction([
      prisma.stockInBatch.create({
        data: {
          itemId,
          supplierId: supplierId || null,
          date: dateVal,
          qtyInBase: BigInt(qtyBase),
          unitCost: BigInt(unitCost),
          qtyRemaining: BigInt(qtyBase),
          note: noteStored,
        },
      }),
      prisma.item.update({
        where: { id: itemId },
        data:
          mode === "bekas"
            ? { stockUsed: { increment: qtyBase }, stockNew: { decrement: qtyBase } }
            : { stockNew: { increment: qtyBase } },
      }),
    ]);

    return NextResponse.json({
      data: {
        itemId,
        qtyBase,
        unitCost,
        mode,
      },
    });
  } catch (error) {
    console.error("Failed to add stock", error);
    return NextResponse.json({ error: "Failed to add stock" }, { status: 500 });
  }
}
