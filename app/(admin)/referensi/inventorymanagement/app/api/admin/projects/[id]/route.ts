import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // Next 15/16 App Router params can be async
) {
  try {
    const { id } = await context.params;

    const body = await req.json();
    const namaProjek = String(body?.namaProjek || "").trim();
    const namaKlien = String(body?.namaKlien || "").trim();
    const noHpWa = String(body?.noHpWa || "").trim();
    const keperluan = String(body?.keperluan || "").trim();

    if (!id) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }
    if (!namaProjek || !namaKlien || !noHpWa) {
      return NextResponse.json({ error: "Field wajib belum lengkap." }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        namaProjek,
        namaKlien,
        noHpWa,
        keperluan: keperluan || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (e: any) {
    // Prisma not found error: P2025
    const msg = String(e?.message || "");
    if (msg.includes("P2025") || msg.toLowerCase().includes("record to update not found")) {
      return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ error: e?.message || "Gagal update project." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("P2025") || msg.toLowerCase().includes("record to delete does not exist")) {
      return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ error: e?.message || "Gagal hapus project." }, { status: 500 });
  }
}
