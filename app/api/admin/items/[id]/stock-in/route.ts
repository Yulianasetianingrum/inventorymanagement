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
    if (mode === "baru" && (unitCost < 0 || Number.isNaN(unitCost)))
      return NextResponse.json({ error: "Unit cost tidak valid (negatif)" }, { status: 400 });

    const item = await prisma.item.findFirst({ where: { id: itemId, isActive: true } });
    if (!item) return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });

    const supplierName = body.supplierName ? String(body.supplierName).trim() : null;
    let finalSupplierId = supplierId;

    if (!finalSupplierId && supplierName) {
      // Find existing by name equality
      const existing = await prisma.supplier.findFirst({
        where: { namaToko: { equals: supplierName } }
      });
      if (existing) {
        finalSupplierId = existing.id;
      } else {
        // Create new supplier
        const newSupplier = await prisma.supplier.create({
          data: {
            namaToko: supplierName.trim() || "Supplier Baru",
            keperluanItems: JSON.stringify(["General Supply"]), // Fix: Send valid JSON string
            alamat: "Alamat belum diisi"
          }
        });
        finalSupplierId = newSupplier.id;
      }
    } else if (finalSupplierId) {
      const supplier = await prisma.supplier.findUnique({ where: { id: finalSupplierId } });
      if (!supplier) return NextResponse.json({ error: "Supplier tidak ditemukan" }, { status: 400 });
    }

    // Logic to update Supplier's "keperluanItems" (Product History Tags)
    if (finalSupplierId && mode === 'baru') {
      try {
        const supp = await prisma.supplier.findUnique({ where: { id: finalSupplierId } });
        if (supp) {
          const newItemTag = item.category || item.name; // Use category preferably, else name
          let currentTags = (supp.keperluanItems || "").split(",").map(t => t.trim()).filter(t => t && t !== "-");

          // Setup semantic tag (e.g. "Lampu", "Kabel")
          // Avoid adding full long names if possible, but user asked for "barang yg udah dibeli"
          // We'll add the Item Name to be precise, or Brand + Category
          const tagToAdd = item.name.length < 20 ? item.name : (item.category || item.name);

          if (!currentTags.some(t => t.toLowerCase() === tagToAdd.toLowerCase())) {
            currentTags.push(tagToAdd);
            // Limit to last 10 tags to prevent overflow? User didn't specify, but good practice. 
            // Let's just keep it simple for now as per request.

            await prisma.supplier.update({
              where: { id: finalSupplierId },
              data: { keperluanItems: currentTags.join(", ") }
            });
          }
        }
      } catch (e) {
        console.error("Failed to update related items for supplier", e);
        // Don't fail the transaction just for this
      }
    }

    if (mode === "bekas" && (item.stockNew ?? 0) < qtyBase) {
      return NextResponse.json({ error: "Stok baru tidak cukup untuk dipindah ke bekas" }, { status: 400 });
    }

    const noteStored = composeNote(mode, note);

    await prisma.$transaction([
      prisma.stockInBatch.create({
        data: {
          itemId,
          supplierId: finalSupplierId || null,
          date: dateVal,
          qtyInBase: BigInt(qtyBase),
          unitCost: BigInt(unitCost),
          qtyRemaining: BigInt(qtyBase),
          note: noteStored
        },
      }),
      prisma.item.update({
        where: { id: itemId },
        data:
          mode === "bekas"
            ? { stockUsed: { increment: qtyBase }, stockNew: { decrement: qtyBase } }
            : { stockNew: { increment: qtyBase } },
      }),
      prisma.auditLog.create({
        data: {
          action: "STOCK_ADJUSTMENT",
          userId: actor.id,
          detail: `Adj Stock: ${item.name} (${qtyBase > 0 ? '+' : ''}${qtyBase} ${item.unit})`,
          metaJson: JSON.stringify({ itemId, mode, qtyBase, note: noteStored })
        }
      })
    ]);

    return NextResponse.json({
      data: {
        itemId,
        qtyBase,
        unitCost,
        mode,
      },
    });
  } catch (error: any) {
    console.error("Failed to add stock", error);
    return NextResponse.json({ error: "Failed to add stock: " + (error.message || String(error)) }, { status: 500 });
  }
}
