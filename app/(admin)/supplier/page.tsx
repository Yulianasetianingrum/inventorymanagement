import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SupplierClient } from "./SupplierClient";
import { SupplierForm } from "./SupplierForm";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function normalizeItems(input: string) {
  return (input || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function coerceKeperluanItems(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return coerceKeperluanItems(parsed);
    } catch {
      return normalizeItems(v);
    }
  }
  return [];
}

async function upsertSupplier(formData: FormData) {
  "use server";
  const idRaw = String(formData.get("id") || "").trim();
  const id = idRaw ? Number(idRaw) : null;
  const namaToko = String(formData.get("namaToko") || "").trim();
  const itemsRaw = String(formData.get("keperluanItems") || "").trim();
  const alamat = String(formData.get("alamat") || "").trim();
  const mapsUrl = String(formData.get("mapsUrl") || "").trim() || null;
  const noTelp = String(formData.get("noTelp") || "").trim() || null;

  if (!namaToko || !itemsRaw) throw new Error("Data wajib diisi.");

  const keperluanItems = JSON.stringify(normalizeItems(itemsRaw));

  if (id) {
    await prisma.supplier.update({
      where: { id },
      data: { namaToko, keperluanItems, alamat, mapsUrl, noTelp },
    });
  } else {
    await prisma.supplier.create({
      data: { namaToko, keperluanItems, alamat, mapsUrl, noTelp },
    });
  }
  revalidatePath("/supplier");
}

async function deleteSupplier(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) await prisma.supplier.delete({ where: { id } });
  revalidatePath("/supplier");
}

export default async function SupplierPage({ searchParams }: any) {
  const sp = await searchParams;
  const editId = sp?.edit ? Number(sp.edit) : null;
  const suppliers = await prisma.supplier.findMany({ orderBy: { updatedAt: "desc" } });
  const editing = editId ? suppliers.find((s) => s.id === editId) || null : null;
  const editingItems = editing ? coerceKeperluanItems(editing.keperluanItems).join(", ") : "";

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Navbar - Sticky on Mobile */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-navy text-white rounded-lg flex items-center justify-center shadow-lg shadow-navy/20">
            <img src="/logo/apix.png" alt="Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="text-xs md:text-sm font-black text-navy uppercase tracking-wider leading-none">Apix Interior</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Supplier Directory</div>
          </div>
        </div>
        <Link href="/dashboard">
          <Button className="bg-navy text-white hover:bg-navy/90 text-[10px] md:text-xs font-bold uppercase tracking-wider h-8 md:h-9 px-3 md:px-4 shadow-lg shadow-navy/20 border border-transparent rounded-lg">
            ← Dashboard
          </Button>
        </Link>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header Section */}
        <div className="bg-navy p-6 md:p-10 rounded-[24px] md:rounded-[32px] mb-6 md:mb-10 relative overflow-hidden shadow-2xl shadow-navy/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-10 blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10">
            <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] mb-2">Procurement Module</p>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">Supplier Relationship</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] lg:grid-cols-[350px_1fr] gap-6 md:gap-10 items-start">
          {/* Form Side Panel */}
          <aside className="order-2 lg:order-1">
            <SupplierForm
              upsertSupplier={upsertSupplier}
              editing={editing}
              editingItems={editingItems}
            />
          </aside>

          {/* Directory Client Component */}
          <section className="order-1 lg:order-2">
            <SupplierClient suppliers={suppliers} deleteSupplier={deleteSupplier} />
          </section>
        </div>
      </div>
    </div>
  );
}

