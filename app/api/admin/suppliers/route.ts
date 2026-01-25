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
      // fall through to comma split
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

export async function GET(req: Request) {
  const actor = await ensureAdmin();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();

  const suppliers = await prisma.supplier.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      namaToko: true,
      keperluanItems: true,
      alamat: true,
      mapsUrl: true,
      noTelp: true,
    },
  });

  const enriched = suppliers.map((s) => {
    const keperluan = parseKeperluan(s.keperluanItems);
    return {
      ...s,
      keperluan,
    };
  });

  const filtered =
    q.length === 0
      ? enriched
      : enriched.filter((s) => {
          const hay = `${s.namaToko || ""} ${s.alamat || ""} ${s.keperluan.join(" ")}`.toLowerCase();
          return hay.includes(q.toLowerCase());
        });

  return NextResponse.json({ data: filtered });
}
