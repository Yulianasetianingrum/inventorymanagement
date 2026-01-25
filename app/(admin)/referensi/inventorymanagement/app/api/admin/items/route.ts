import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJsonOrForm } from "@/lib/validators";
import { getSession } from "@/lib/auth/session";

const parseModeNote = (note: string | null) => {
  const raw = note ?? "";
  const match = /^mode:(baru|bekas)\|\|(.*)$/s.exec(raw);
  if (match) return match[1] as "baru" | "bekas";
  return "baru" as const;
};

async function ensureAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return prisma.user.findUnique({ where: { employeeId: session.employeeId } });
}

type RefillStatus = "Aman" | "Wajib Refill" | "Habis";

const computeStatus = (total: number, minStock: number): RefillStatus => {
  if (total === 0) return "Habis";
  if (total <= minStock) return "Wajib Refill";
  return "Aman";
};

export async function GET(req: Request) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const filter = searchParams.get("filter") ?? "all";

  const items = await prisma.item.findMany({
    where: {
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { brand: { contains: search } },
              { category: { contains: search } },
              { location: { contains: search } },
              { size: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  const itemIds = items.map((it) => it.id);
  const batches = itemIds.length
    ? await prisma.stockInBatch.findMany({
        where: { itemId: { in: itemIds } },
        select: { itemId: true, qtyRemaining: true, unitCost: true, qtyInBase: true, note: true },
      })
    : [];

  const aggregate = batches.reduce<
    Record<
      number,
      {
        val: number;
        sumBaru: number;
        sumBekas: number;
      }
    >
  >((acc, batch) => {
    const entry = (acc[batch.itemId] = acc[batch.itemId] ?? { val: 0, sumBaru: 0, sumBekas: 0 });
    const qtyBase = Number(batch.qtyInBase);
    const cost = Number(batch.unitCost);
    const mode = parseModeNote(batch.note);
    if (mode === "bekas") {
      entry.sumBekas += qtyBase;
    } else {
      entry.sumBaru += qtyBase;
      entry.val += qtyBase * cost;
    }
    return acc;
  }, {});

  const enriched = items
    .map((it) => {
      const agg = aggregate[it.id] ?? { val: 0, sumBaru: 0, sumBekas: 0 };
      const computedStockNew = Math.max(0, agg.sumBaru - agg.sumBekas);
      const computedStockUsed = Math.max(0, agg.sumBekas);
      const stockTotal = computedStockNew + computedStockUsed;
      const statusRefill = computeStatus(stockTotal, it.minStock ?? 0);
      return {
        ...it,
        stockNew: computedStockNew,
        stockUsed: computedStockUsed,
        stockTotal,
        statusRefill,
        nilaiStok: agg.val ?? 0,
      };
    })
    .filter((it) => {
      if (filter === "low") return it.statusRefill === "Wajib Refill";
      if (filter === "empty") return it.stockTotal === 0;
      return true;
    });

  return NextResponse.json({ data: enriched });
}

export async function POST(req: Request) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await readJsonOrForm(req);
    const name = String(body.name ?? "").trim();
    const brand = body.brand ? String(body.brand).trim() : null;
    const category = body.category ? String(body.category).trim() : null;
    const location = body.location ? String(body.location).trim() : null;
    const size = body.size ? String(body.size).trim() : null;
    const unit = String(body.unit ?? "pcs").trim() || "pcs";
    const stockNew = Math.max(0, Number(body.stockNew ?? 0));
    const stockUsed = Math.max(0, Number(body.stockUsed ?? 0));
    const minStock = Math.max(0, Number(body.minStock ?? 0));

    if (!name) return NextResponse.json({ error: "Nama wajib" }, { status: 400 });
    if (Number.isNaN(stockNew) || Number.isNaN(stockUsed) || Number.isNaN(minStock)) {
      return NextResponse.json({ error: "Angka tidak valid" }, { status: 400 });
    }

    const item = await prisma.item.create({
      data: {
        name,
        brand,
        category,
        location,
        size,
        unit,
        stockNew,
        stockUsed,
        minStock,
      },
    });

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Failed to create item", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
