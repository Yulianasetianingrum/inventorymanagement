import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const parseModeNote = (note: string | null) => {
  const raw = note ?? "";
  const match = /^mode:(baru|bekas)\|\|(.*)$/s.exec(raw);
  if (match) {
    return { mode: match[1] as "baru" | "bekas", note: match[2] ? match[2] : null };
  }
  return { mode: "baru" as const, note: note ?? null };
};

async function ensureAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return prisma.user.findUnique({ where: { employeeId: session.employeeId } });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await Promise.resolve(params);
  const idStr = resolved?.id ?? new URL(req.url).pathname.split("/").at(-2);
  const itemId = Number(idStr);
  if (!itemId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const item = await prisma.item.findFirst({ where: { id: itemId, isActive: true } });
  if (!item) return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });

  const batches = await prisma.stockInBatch.findMany({
    where: { itemId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      date: true,
      qtyInBase: true,
      unitCost: true,
      qtyRemaining: true,
      note: true,
      createdAt: true,
      supplierId: true,
      supplier: { select: { id: true, namaToko: true, noTelp: true } },
    },
  });

  const enriched = batches.map((b) => {
    const parsed = parseModeNote(b.note);
    return {
      ...b,
      ...parsed,
      supplierName: b.supplier?.namaToko ?? null,
      supplierPhone: b.supplier?.noTelp ?? null,
      // BIGINT fields (MySQL BIGINT) from Prisma must be converted before math/JSON.
      qtyInBase: Number(b.qtyInBase),
      unitCost: parsed.mode === "bekas" ? 0 : Number(b.unitCost),
      qtyRemaining: Number(b.qtyRemaining),
      total: parsed.mode === "bekas" ? 0 : Number(b.qtyInBase) * Number(b.unitCost),
    };
  });
  const supplierHistory = enriched
    .filter((b) => b.supplierId)
    .reduce<Record<number, { id: number; name: string | null; phone: string | null; lastDate: number }>>((acc, b) => {
      const id = Number(b.supplierId);
      const lastDate = new Date(b.date).getTime();
      const existing = acc[id];
      if (!existing || lastDate > existing.lastDate) {
        acc[id] = { id, name: b.supplierName ?? null, phone: (b as any).supplierPhone ?? null, lastDate };
      }
      return acc;
    }, {});
  const supplierHistoryList = Object.values(supplierHistory)
    .sort((a, b) => b.lastDate - a.lastDate)
    .map((s) => ({ id: s.id, name: s.name, phone: s.phone }));

  return NextResponse.json({ data: enriched, item, supplierHistory: supplierHistoryList });
}
