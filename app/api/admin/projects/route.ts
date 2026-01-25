import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        namaProjek: true,
        namaKlien: true,
        noHpWa: true,
        keperluan: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ projects });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal load projects." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const namaProjek = String(body?.namaProjek || "").trim();
    const namaKlien = String(body?.namaKlien || "").trim();
    const noHpWa = String(body?.noHpWa || "").trim();
    const keperluan = String(body?.keperluan || "").trim();

    if (!namaProjek || !namaKlien || !noHpWa) {
      return NextResponse.json(
        { error: "Field wajib belum lengkap." },
        { status: 400 }
      );
    }

    const created = await prisma.project.create({
      data: {
        namaProjek,
        namaKlien,
        noHpWa,
        keperluan: keperluan || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Gagal membuat project." },
      { status: 500 }
    );
  }
}
