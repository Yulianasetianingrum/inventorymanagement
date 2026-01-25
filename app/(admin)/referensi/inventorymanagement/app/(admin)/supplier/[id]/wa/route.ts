// WA

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeToWaDigits(input: string | null | undefined) {
  const raw = (input || "").trim();
  if (!raw) return null;

  // keep digits only
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  // convert leading 0 -> 62 (Indonesia), handle already 62
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  // If user already typed 8xxxxxxxx (without 0/62), assume 62
  if (digits.startsWith("8")) digits = "62" + digits;

  // must be at least country code + some digits
  if (digits.length < 8) return null;

  return digits;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const p: any = await (params as any);
  const id = Number(p?.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const s = await prisma.supplier.findUnique({
    where: { id },
    select: { noTelp: true },
  });

  const digits = normalizeToWaDigits(s?.noTelp ?? null);
  if (!digits) {
    return NextResponse.json({ error: "No Telp/WA not set" }, { status: 404 });
  }

  const url = `https://wa.me/${digits}`;
  return NextResponse.redirect(url, 302);
}
