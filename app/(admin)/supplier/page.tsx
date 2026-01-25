import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import styles from "./supplier.module.css";
import { SupplierClient } from "./SupplierClient";
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
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <img src="/logo/apix.png" alt="Apix Interior" className="w-full h-full object-contain" />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Apix Interior</div>
            <div className={styles.brandSubtitle}>Supplier Directory</div>
          </div>
        </div>
        <Link href="/dashboard">
          <Button className="border-gold text-white hover:bg-gold hover:text-navy">← Dashboard</Button>
        </Link>
      </header>

      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.headerCard}>
          <p className={styles.headerSubtitle}>Procurement Module</p>
          <h1 className={styles.headerTitle}>Supplier Relationship</h1>
        </div>

        <div className={styles.mainGrid}>
          {/* Form Side Panel */}
          <aside className={styles.formCard}>
            <h2 className="text-xl font-black text-navy mb-6">{editing ? "Update Info Supplier" : "Rekam Supplier Baru"}</h2>
            <form action={upsertSupplier}>
              <input type="hidden" name="id" value={editing?.id ?? ""} />

              <label className={styles.formLabel}>Nama Toko / Supplier</label>
              <input name="namaToko" className={styles.formInput} defaultValue={editing?.namaToko ?? ""} required />

              <label className={styles.formLabel}>Kategori Barang (Koma)</label>
              <input name="keperluanItems" className={styles.formInput} defaultValue={editingItems} placeholder="HPL, Plywood, Fitting..." required />

              <label className={styles.formLabel}>Alamat Lengkap</label>
              <textarea name="alamat" className={styles.formInput + " !h-24 py-3"} defaultValue={editing?.alamat ?? ""} />

              <label className={styles.formLabel}>Link Google Maps</label>
              <input name="mapsUrl" className={styles.formInput} defaultValue={editing?.mapsUrl ?? ""} />

              <label className={styles.formLabel}>No. Telp / WhatsApp</label>
              <input name="noTelp" className={styles.formInput} defaultValue={editing?.noTelp ?? ""} />

              <Button type="submit" className="btn-gold w-full !h-14 font-black uppercase tracking-widest mt-4 shadow-xl">
                {editing ? "SIMPAN PERUBAHAN" : "AMANKAN DATA SUPPLIER"}
              </Button>
              {editing && (
                <Link href="/supplier" className="block text-center mt-4 text-xs font-bold text-navy/40 uppercase tracking-widest">Batalkan Edit</Link>
              )}
            </form>
          </aside>

          {/* Directory Client Component */}
          <section>
            <SupplierClient suppliers={suppliers} deleteSupplier={deleteSupplier} />
          </section>
        </div>
      </div>
    </div>
  );
}
