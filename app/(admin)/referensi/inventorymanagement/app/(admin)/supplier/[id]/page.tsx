import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import styles from "./supplier.module.css";

export const dynamic = "force-dynamic";

function normalizeItems(input: string) {
  return (input || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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

  // simpan items sebagai array (kalau model kamu Json)
  const keperluanItems = normalizeItems(itemsRaw);

  if (id && Number.isFinite(id)) {
    await prisma.supplier.update({
      where: { id },
      data: { namaToko, keperluanItems, alamatLengkap: alamat, mapsUrl, waNumber },
    });
  } else {
    await prisma.supplier.create({
      data: { namaToko, keperluanItems, alamatLengkap: alamat, mapsUrl, waNumber },
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
  searchParams?: { edit?: string };
}) {
  const editId = searchParams?.edit ? Number(searchParams.edit) : null;

  const suppliers = await prisma.supplier.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const editing = editId ? suppliers.find((s) => s.id === editId) || null : null;

  const editingItems = editing
    ? ((editing.keperluanItems as unknown as string[]) || []).join(", ")
    : "";

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Supplier</h1>
      </div>

      {/* FORM TAMBAH / EDIT */}
      <div className={styles.card}>
        <form action={upsertSupplier} className={styles.form}>
          <input type="hidden" name="id" value={editing?.id ?? ""} />

          <div className={styles.field}>
            <label className={styles.label}>Nama Toko</label>
            <input
              className={styles.input}
              name="namaToko"
              defaultValue={editing?.namaToko ?? ""}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Keperluan Items (pisahkan koma)</label>
            <input
              className={styles.input}
              name="keperluanItems"
              defaultValue={editingItems}
              placeholder="HPL, Plywood, Kaca"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Alamat </label>
            <textarea
              className={styles.textarea}
              name="alamat"
              defaultValue={editing?.alamatLengkap ?? ""}
              rows={3}
              required
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Link Lokasi (Google Maps) (opsional)</label>
              <input
                className={styles.input}
                name="mapsUrl"
                defaultValue={editing?.mapsUrl ?? ""}
                placeholder="Tempel link Google Maps"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>No WhatsApp (opsional)</label>
              <input
                className={styles.input}
                name="noTelp"
                defaultValue={editing?.waNumber ?? ""}
                placeholder="0812xxxx / +62812xxxx"
              />
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

{/* DAFTAR */}
<div className={styles.card} style={{ marginTop: 14 }}>
  {suppliers.length === 0 ? (
    <p className={styles.empty}>Belum ada supplier.</p>
  ) : (
    <>
      {/* DESKTOP: TABLE */}
      <div className={styles.desktopOnly}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama Toko</th>
                <th>Keperluan Items</th>
                <th>Alamat</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((s) => {
                const items = (s.keperluanItems as unknown as string[]) || [];
                const itemsText =
                  items.slice(0, 4).join(", ") +
                  (items.length > 4 ? ` (+${items.length - 4})` : "");

                return (
                  <tr key={s.id}>
                    <td className={styles.nameCell}>{s.namaToko}</td>
                    <td className={styles.itemsCell}>{itemsText || "-"}</td>
                    <td className={styles.addrCell}>Alamat (disensor)</td>

                    <td className={styles.actionsCell}>
                      <a
                        className={styles.actionBtn}
                        href={`/supplier/${s.id}/maps`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!s.mapsUrl}
                        onClick={(e) => {
                          if (!s.mapsUrl) e.preventDefault();
                        }}
                      >
                        📍 Lokasi
                      </a>

                      <a
                        className={styles.actionBtn}
                        href={`/supplier/${s.id}/wa`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!s.waNumber}
                        onClick={(e) => {
                          if (!s.waNumber) e.preventDefault();
                        }}
                      >
                        💬 Hubungi
                      </a>

                      <Link className={styles.actionBtn} href={`/supplier?edit=${s.id}`}>
                        ✏️ Edit
                      </Link>

                      <form action={deleteSupplier}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          className={styles.dangerBtn}
                          onClick={(e) => {
                            if (!confirm(`Hapus "${s.namaToko}"?`)) e.preventDefault();
                          }}
                        >
                          🗑️ Hapus
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLET + HP: CARD LIST */}
      <div className={styles.touchOnly}>
        <div className={styles.cardList}>
          {suppliers.map((s) => {
            const items = (s.keperluanItems as unknown as string[]) || [];
            const itemsText =
              items.slice(0, 6).join(", ") +
              (items.length > 6 ? ` (+${items.length - 6})` : "");

            return (
              <div key={s.id} className={styles.supplierCard}>
                <div className={styles.cardTop}>
                  <div className={styles.cardTitle}>{s.namaToko}</div>
                  <div className={styles.cardSub}>{itemsText || "-"}</div>
                  <div className={styles.cardMeta}>Alamat: (disensor)</div>
                </div>

                <div className={styles.cardActions}>
                  <a
                    className={styles.actionBtn}
                    href={`/supplier/${s.id}/maps`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!s.mapsUrl}
                    onClick={(e) => {
                      if (!s.mapsUrl) e.preventDefault();
                    }}
                  >
                    📍 Lokasi
                  </a>

                  <a
                    className={styles.actionBtn}
                    href={`/supplier/${s.id}/wa`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!s.waNumber}
                    onClick={(e) => {
                      if (!s.waNumber) e.preventDefault();
                    }}
                  >
                    💬 Hubungi
                  </a>

                  <Link className={styles.actionBtn} href={`/supplier?edit=${s.id}`}>
                    ✏️ Edit
                  </Link>

                  <form action={deleteSupplier} className={styles.cardDeleteForm}>
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className={styles.dangerBtn}
                      onClick={(e) => {
                        if (!confirm(`Hapus "${s.namaToko}"?`)) e.preventDefault();
                      }}
                    >
                      🗑️ Hapus
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  )}
</div>

    </div>
  );
}
