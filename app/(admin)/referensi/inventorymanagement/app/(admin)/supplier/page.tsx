import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import styles from "./supplier.module.css";
import { SupplierClient } from "./SupplierClient";

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
    const raw = v.trim();
    if (!raw) return [];
    // Bisa berupa JSON string atau list dipisahkan koma
    try {
      const parsed = JSON.parse(raw);
      return coerceKeperluanItems(parsed);
    } catch {
      return normalizeItems(raw);
    }
  }

  if (typeof v === "object") {
    const obj: any = v as any;
    if (Array.isArray(obj.items)) return coerceKeperluanItems(obj.items);
    // fallback: ambil value-value string
    return Object.values(obj)
      .map((x) => String(x).trim())
      .filter(Boolean);
  }

  return [String(v).trim()].filter(Boolean);
}

function maskGeneric(v: string) {
  const s = (v || "").trim();
  if (!s) return "-";
  const n = Math.max(10, Math.min(18, Math.floor(s.length * 0.65)));
  return "•".repeat(n);
}

function maskAddr(addr: string) {
  const s = (addr || "").trim();
  if (!s) return "-";
  // tampil seperti password (bullet) — panjang diset agar tidak terlalu membocorkan panjang asli
  const n = Math.max(10, Math.min(18, Math.floor(s.length * 0.65)));
  return "•".repeat(n);
}

function AddressPeek({ alamat }: { alamat?: string | null }) {
  const full = (alamat || "").trim();
  if (!full) return <span>-</span>;
  const masked = maskAddr(full);

  // Tanpa JS: klik summary untuk buka/tutup preview
  return (
    <details className={styles.peekDetails}>
      <summary className={styles.peekSummary}>
        <span className={styles.peekLabel}>Lihat</span>
        <span className={styles.peekMasked}>{masked}</span>
      </summary>
      <div className={styles.peekFull}>{full}</div>
    </details>
  );
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

  if (!namaToko) throw new Error("Nama Toko wajib.");
  if (!itemsRaw) throw new Error("Keperluan Items wajib.");
  if (!alamat) throw new Error("Alamat wajib.");

  // simpan sebagai JSON string agar lolos constraint JSON di DB
  const keperluanItems = JSON.stringify(normalizeItems(itemsRaw));

  if (id && Number.isFinite(id)) {
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
  if (!Number.isFinite(id)) throw new Error("Invalid id");

  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/supplier");
}

export default async function SupplierPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string | string[]; q?: string | string[] }> | { edit?: string | string[]; q?: string | string[] };
}) {
  const sp: any = await (searchParams as any);
  const editRaw = Array.isArray(sp?.edit) ? sp.edit[0] : sp?.edit;
  const editId = editRaw ? Number(editRaw) : null;
  const qRaw = Array.isArray(sp?.q) ? sp.q[0] : sp?.q;
  const q = (qRaw || "").trim();
  const qLower = q.toLowerCase();

  const suppliers = await prisma.supplier.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const filtered =
    q.length === 0
      ? suppliers
      : suppliers.filter((s) => {
          const keperluanArr = coerceKeperluanItems(s.keperluanItems);
          const hay = `${s.namaToko || ""} ${s.alamat || ""} ${keperluanArr.join(" ")}`.toLowerCase();
          return hay.includes(qLower);
        });

  const editing = editId ? filtered.find((s) => s.id === editId) || null : null;

  const editingItems = editing ? coerceKeperluanItems(editing.keperluanItems).join(", ") : "";

  return (
    <div className={styles.page}>
      {/* NAVBAR (samain dengan Items) */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <img src="/logo/apix.png" alt="Apix Interior" />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Apix Interior</div>
            <div className={styles.brandSubtitle}>Supplier</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <Link className={styles.secondaryBtn} href="/dashboard">
            Kembali
          </Link>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Supplier</h1>
          <div className={styles.muted}>Cari dan filter ada di bawah, realtime tanpa reload.</div>
        </div>

        {/* FORM TAMBAH / EDIT */}
        <div className={styles.card}>
          <form action={upsertSupplier} className={styles.form}>
            <input type="hidden" name="id" value={editing?.id ?? ""} />

            <div className={styles.field}>
              <label className={styles.label}>Nama Toko</label>
              <input className={styles.input} name="namaToko" defaultValue={editing?.namaToko ?? ""} required />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Keperluan Items (pisahkan dengan koma)</label>
              <input
                className={styles.input}
                name="keperluanItems"
                defaultValue={editingItems}
                placeholder="HPL, Plywood, Kaca"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Alamat</label>

              <div className={styles.secretWrap}>
                <input id="alamat-eye" type="checkbox" className={styles.secretToggle} />
                <div className={`${styles.secretControl} ${styles.secretControlTextarea}`}>
                  <textarea
                    className={`${styles.textarea} ${styles.secretField}`}
                    name="alamat"
                    defaultValue={editing?.alamat ?? ""}
                    rows={3}
                    required
                  />
                  <label
                    htmlFor="alamat-eye"
                    className={styles.eyeBtn}
                    aria-label="Tampilkan atau sembunyikan alamat"
                    title="Tampilkan / Sembunyikan"
                  >
                    <svg className={`${styles.eyeIcon} ${styles.eyeOpen}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className={`${styles.eyeIcon} ${styles.eyeClosed}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </label>
                </div>
              </div>

</div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Link Lokasi (Google Maps) (opsional)</label>

                <div className={styles.secretWrap}>
                  <input id="maps-eye" type="checkbox" className={styles.secretToggle} />
                  <div className={styles.secretControl}>
                    <input
                      className={`${styles.input} ${styles.secretField}`}
                      name="mapsUrl"
                      defaultValue={editing?.mapsUrl ?? ""}
                      placeholder="Tempel link Google Maps"
                      type="text"
                      inputMode="url"
                    />
                    <label
                      htmlFor="maps-eye"
                      className={styles.eyeBtn}
                      aria-label="Tampilkan atau sembunyikan link maps"
                      title="Tampilkan / Sembunyikan"
                    >
                      <svg className={`${styles.eyeIcon} ${styles.eyeOpen}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                      <svg className={`${styles.eyeIcon} ${styles.eyeClosed}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    </label>
                  </div>
                </div>

</div>

              <div className={styles.field}>
                <label className={styles.label}>No Telp/WA (opsional)</label>

                <div className={styles.secretWrap}>
                  <input id="tel-eye" type="checkbox" className={styles.secretToggle} />
                  <div className={styles.secretControl}>
                    <input
                      className={`${styles.input} ${styles.secretField}`}
                      name="noTelp"
                      defaultValue={editing?.noTelp ?? ""}
                      placeholder="0812xxxx / +62812xxxx"
                      type="text"
                      inputMode="tel"
                    />
                    <label
                      htmlFor="tel-eye"
                      className={styles.eyeBtn}
                      aria-label="Tampilkan atau sembunyikan nomor"
                      title="Tampilkan / Sembunyikan"
                    >
                      <svg className={`${styles.eyeIcon} ${styles.eyeOpen}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                      <svg className={`${styles.eyeIcon} ${styles.eyeClosed}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    </label>
                  </div>
                </div>

</div>
            </div>

            <div className={styles.formActions}>
              <button className={styles.primaryBtn} type="submit">
                {editing ? "Update" : "Tambah"}
              </button>

              {editing ? (
                <Link className={styles.secondaryBtn} href="/supplier">
                  Batal
                </Link>
              ) : null}
            </div>
          </form>
        </div>

        <SupplierClient suppliers={suppliers} deleteSupplier={deleteSupplier} />
      </div>
    </div>
  );
}
