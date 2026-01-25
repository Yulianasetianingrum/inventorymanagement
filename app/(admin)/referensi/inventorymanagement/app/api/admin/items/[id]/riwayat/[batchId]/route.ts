import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJsonOrForm } from "@/lib/validators";
import { getSession } from "@/lib/auth/session";

const parseModeNote = (note: string | null) => {
  const raw = note ?? "";
  const match = /^mode:(baru|bekas)\|\|(.*)$/s.exec(raw);
  if (match) return { mode: match[1] as "baru" | "bekas", note: match[2] ? match[2] : null };
  return { mode: "baru" as const, note: note ?? null };
};

const composeNote = (mode: "baru" | "bekas", note?: string | null) => `mode:${mode}||${note ?? ""}`;

async function ensureAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return prisma.user.findUnique({ where: { employeeId: session.employeeId } });
}

type Params = { id: string; batchId: string };

const resolveParams = async (params: Params | Promise<Params>) => {
  return await Promise.resolve(params);
};

export async function DELETE(_req: Request, { params }: { params: Params | Promise<Params> }) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await resolveParams(params);
  const itemId = Number(resolved.id);
  const batchId = Number(resolved.batchId);
  if (!itemId || !batchId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const batch = await prisma.stockInBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.itemId !== itemId) return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });

  const { mode } = parseModeNote(batch.note);
  const dec = Number(batch.qtyRemaining);
  if (!Number.isSafeInteger(dec)) return NextResponse.json({ error: "qtyRemaining terlalu besar" }, { status: 400 });

  if (mode === "baru") {
    const newStockNew = (item.stockNew ?? 0) - dec;
    const newStockUsed = item.stockUsed ?? 0;
    if (newStockNew < 0 || newStockNew < newStockUsed) {
      return NextResponse.json(
        { error: "Tidak bisa hapus batch karena stok baru tidak mencukupi dibanding stok bekas. Kurangi/hapus batch bekas dulu." },
        { status: 400 }
      );
    }
  }

  await prisma.$transaction([
    prisma.stockInBatch.delete({ where: { id: batchId } }),
    prisma.item.update({
      where: { id: itemId },
      data:
        mode === "bekas"
          ? { stockUsed: { decrement: dec }, stockNew: { increment: dec } }
          : { stockNew: { decrement: dec } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request, { params }: { params: Params | Promise<Params> }) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await resolveParams(params);
  const itemId = Number(resolved.id);
  const batchId = Number(resolved.batchId);
  if (!itemId || !batchId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const batch = await prisma.stockInBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.itemId !== itemId) return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });

  const body = await readJsonOrForm(req);
  const dateVal = body.date ? new Date(String(body.date)) : batch.date;
  const qtyInBase = Number(body.qtyInBase ?? batch.qtyInBase);
  const prevParsed = parseModeNote(batch.note);
  const mode = body.mode === "bekas" ? "bekas" : prevParsed.mode;
  const unitCostRaw = mode === "bekas" ? 0 : Number(body.unitCost ?? batch.unitCost);
  const qtyRemaining = Number(body.qtyRemaining ?? batch.qtyRemaining);
  const noteRaw = body.note !== undefined ? (body.note ? String(body.note) : null) : prevParsed.note;
  const note = composeNote(mode, noteRaw);

  if (qtyInBase < 0 || Number.isNaN(qtyInBase)) return NextResponse.json({ error: "qtyInBase tidak valid" }, { status: 400 });
  if (mode === "baru" && (unitCostRaw <= 0 || Number.isNaN(unitCostRaw)))
    return NextResponse.json({ error: "unitCost tidak valid" }, { status: 400 });
  if (qtyRemaining < 0 || Number.isNaN(qtyRemaining))
    return NextResponse.json({ error: "qtyRemaining tidak valid" }, { status: 400 });
  if (!Number.isSafeInteger(qtyInBase) || !Number.isSafeInteger(unitCostRaw) || !Number.isSafeInteger(qtyRemaining)) {
    return NextResponse.json({ error: "Nilai harus bilangan bulat" }, { status: 400 });
  }
  if (qtyRemaining > qtyInBase) return NextResponse.json({ error: "qtyRemaining tidak boleh melebihi qtyInBase" }, { status: 400 });

  const prevRemaining = Number(batch.qtyRemaining);
  if (!Number.isSafeInteger(prevRemaining)) return NextResponse.json({ error: "qtyRemaining terlalu besar" }, { status: 400 });

  // Hitung efek stok: cabut efek lama, terapkan efek baru (transfer baru->bekas).
  let deltaNew = 0;
  let deltaUsed = 0;
  if (prevParsed.mode === "baru") {
    deltaNew -= prevRemaining; // cabut tambahan stok baru sebelumnya
  } else {
    deltaNew += prevRemaining; // bekas sebelumnya menambah kembali stok baru
    deltaUsed -= prevRemaining;
  }
  if (mode === "baru") {
    deltaNew += qtyRemaining;
  } else {
    deltaNew -= qtyRemaining;
    deltaUsed += qtyRemaining;
  }

  const newStockNew = (item.stockNew ?? 0) + deltaNew;
  const newStockUsed = (item.stockUsed ?? 0) + deltaUsed;
  if (newStockNew < 0 || newStockUsed < 0 || newStockNew < newStockUsed) {
    return NextResponse.json(
      { error: "Perubahan ini membuat stok baru lebih kecil dari stok bekas. Sesuaikan batch bekas terlebih dahulu." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.stockInBatch.update({
      where: { id: batchId },
      data: {
        date: dateVal,
        qtyInBase: BigInt(qtyInBase),
        unitCost: BigInt(unitCostRaw),
        qtyRemaining: BigInt(qtyRemaining),
        note,
      },
    }),
    prisma.item.update({
      where: { id: itemId },
      data: {
        ...(deltaNew > 0 ? { stockNew: { increment: deltaNew } } : deltaNew < 0 ? { stockNew: { decrement: Math.abs(deltaNew) } } : {}),
        ...(deltaUsed > 0 ? { stockUsed: { increment: deltaUsed } } : deltaUsed < 0 ? { stockUsed: { decrement: Math.abs(deltaUsed) } } : {}),
        ...(deltaNew === 0 && deltaUsed === 0 ? { updatedAt: new Date() } : {}),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, { params }: { params: Params | Promise<Params> }) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await resolveParams(params);
  const itemId = Number(resolved.id);
  const batchId = Number(resolved.batchId);
  if (!itemId || !batchId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const batch = await prisma.stockInBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.itemId !== itemId) return NextResponse.json({ error: "Batch tidak ditemukan" }, { status: 404 });

  const parsed = parseModeNote(batch.note);

  return NextResponse.json({
  data: {
    ...batch,
    ...parsed,
    // BIGINT fields (MySQL BIGINT) from Prisma must be converted before math/JSON.
    qtyInBase: Number(batch.qtyInBase),
    unitCost: Number(parsed.mode === "bekas" ? 0 : batch.unitCost),
    qtyRemaining: Number(batch.qtyRemaining),
    total: parsed.mode === "bekas" ? 0 : Number(batch.qtyInBase) * Number(batch.unitCost),
    note: parsed.note,
  },
});
}
