// MAPS

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // sesuaikan path prisma kamu

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const p: any = await (params as any);
  const id = Number(p?.id);
if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const s = await prisma.supplier.findUnique({
    where: { id },
    select: { mapsUrl: true },
  });

  if (!s?.mapsUrl) {
    return NextResponse.json({ error: "Maps URL not set" }, { status: 404 });
  }

  return NextResponse.redirect(s.mapsUrl, 302);
}
