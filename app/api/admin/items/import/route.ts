import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

async function ensureAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return prisma.user.findUnique({ where: { employeeId: session.employeeId } });
}

type ImportItem = {
  name: string;
  size?: string | null;
  brand?: string | null;
  category?: string | null;
  unit?: string | null;
  location?: string | null;
  minStock?: number | null;
};

type ImportPayload =
  | { items: ImportItem[] }
  | { locations: Array<{ name: string; items: Omit<ImportItem, "location">[] }> };

/**
 * Endpoint import items.
 * NOTE: Database kamu (sesuai inventory_db.sql) TIDAK punya tabel `location`,
 * jadi endpoint ini tidak boleh query `prisma.location`.
 *
 * Format payload yang didukung:
 * 1) { items: [{ name, size?, brand?, category?, unit?, location?, minStock? }, ...] }
 * 2) { locations: [{ name: "Gudang A", items: [{ name, size?, ... }, ...] }, ...] }
 */
export async function POST(req: Request) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: ImportPayload | null = null;

  try {
    // try JSON first
    payload = (await req.json()) as ImportPayload;
  } catch {
    // fallback: text body containing JSON
    try {
      const text = await req.text();
      if (text?.trim()) payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!payload) {
    return NextResponse.json(
      { error: "Payload tidak valid. Kirim JSON {items:[...]} atau {locations:[...]}" },
      { status: 400 }
    );
  }

  let inserted = 0;

  // Helper to normalize row
  const normalize = (it: ImportItem): ImportItem => ({
    name: String(it.name ?? "").trim(),
    size: it.size ? String(it.size).trim() : null,
    brand: it.brand ? String(it.brand).trim() : null,
    category: it.category ? String(it.category).trim() : null,
    unit: it.unit ? String(it.unit).trim() : "pcs",
    location: it.location ? String(it.location).trim() : null,
    minStock: it.minStock == null ? 0 : Number(it.minStock),
  });

  try {
    if ("items" in payload) {
      const items = (payload.items ?? []).map(normalize).filter((x) => x.name);
      if (!items.length) return NextResponse.json({ ok: true, inserted: 0 });

      const result = await prisma.item.createMany({
        data: items.map((it) => ({
          name: it.name,
          size: it.size ?? null,
          brand: it.brand ?? null,
          category: it.category ?? null,
          unit: it.unit ?? "pcs",
          location: it.location ?? "",
          minStock: it.minStock ?? 0,
          stockNew: 0,
          stockUsed: 0,
          isActive: true,
        })),
        skipDuplicates: true, // respects UNIQUE(name,size) in DB
      });

      inserted += result.count;
      return NextResponse.json({ ok: true, inserted });
    }

    // locations mode
    for (const loc of payload.locations ?? []) {
      const locationName = String(loc?.name ?? "").trim();
      if (!locationName) continue;

      const items = (loc.items ?? [])
        .map((it) => normalize({ ...it, location: locationName }))
        .filter((x) => x.name);

      if (!items.length) continue;

      const result = await prisma.item.createMany({
        data: items.map((it) => ({
          name: it.name,
          size: it.size ?? null,
          brand: it.brand ?? null,
          category: it.category ?? null,
          unit: it.unit ?? "pcs",
          location: locationName,
          minStock: it.minStock ?? 0,
          stockNew: 0,
          stockUsed: 0,
          isActive: true,
        })),
        skipDuplicates: true,
      });

      inserted += result.count;
    }

    return NextResponse.json({ ok: true, inserted });
  } catch (e) {
    console.error("import items failed", e);
    return NextResponse.json({ error: "Import items gagal" }, { status: 500 });
  }
}
