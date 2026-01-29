import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const ensureAdmin = async () => {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return prisma.user.findUnique({ where: { employeeId: session.employeeId } });
};

const parseKeperluan = (raw: unknown): string[] => {
  if (!raw) return [];
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
    } catch {
      // fallback split comma
    }
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  if (typeof raw === "object") {
    return Object.values(raw as Record<string, unknown>)
      .map((x) => String(x ?? "").trim())
      .filter(Boolean);
  }
  return [String(raw).trim()].filter(Boolean);
};

const sanitizePhone = (v?: string | null) => (v || "").replace(/[^\d]/g, "");

export async function GET(req: Request) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");
  const q = url.searchParams.get("q")?.trim() || "";

  if (!itemId) return NextResponse.json({ error: "itemId wajib" }, { status: 400 });

  const item = await prisma.item.findUnique({
    where: { id: Number(itemId) || 0 },
    select: { id: true, name: true },
  });

  const suppliers = await prisma.supplier.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, namaToko: true, keperluanItems: true, noTelp: true, mapsUrl: true, alamat: true },
  });

  const priceBySupplier = new Map<number, { price: number; date: Date }>();
  if (itemId) {
    const batches = await prisma.stockInBatch.findMany({
      where: {
        itemId: Number(itemId) || 0,
        supplierId: { not: null },
        unitCost: { gt: 0 },
        note: { startsWith: "mode:baru" }
      },
      select: { supplierId: true, unitCost: true, date: true }
    });

    for (const b of batches) {
      if (!b.supplierId) continue;
      const price = Number(b.unitCost);
      if (!Number.isFinite(price) || price <= 0) continue;
      const existing = priceBySupplier.get(b.supplierId);
      if (!existing || price < existing.price) {
        priceBySupplier.set(b.supplierId, { price, date: b.date });
      }
    }
  }

  const enriched = suppliers.map((s) => ({
    id: s.id,
    name: s.namaToko,
    waNumber: sanitizePhone(s.noTelp),
    keywords: parseKeperluan(s.keperluanItems),
    mapsUrl: s.mapsUrl,
    address: s.alamat,
    lastPrice: priceBySupplier.get(s.id)?.price ?? null,
    lastPriceAt: priceBySupplier.get(s.id)?.date ?? null
  }));

  const tokens = (q || item?.name || "")
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const recommended =
    tokens.length === 0
      ? enriched
      : enriched.filter((s) => {
          const hay = `${s.name} ${s.keywords.join(" ")} ${s.address || ""}`.toLowerCase();
          return tokens.some((t) => hay.includes(t));
        });

  return NextResponse.json({
    item,
    recommended,
    all: enriched,
  });
}
