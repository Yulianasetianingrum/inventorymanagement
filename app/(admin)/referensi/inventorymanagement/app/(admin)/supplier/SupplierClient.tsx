"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./supplier.module.css";

type SupplierEntry = {
  id: number;
  namaToko: string;
  keperluanItems: string;
  alamat: string;
  mapsUrl?: string | null;
  noTelp?: string | null;
};

type Props = {
  suppliers: SupplierEntry[];
  deleteSupplier: (formData: FormData) => Promise<void>;
};

const normalizeKeperluan = (raw: string) => {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
  } catch {
    // fall through
  }
  return String(raw || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
};

export function SupplierClient({ suppliers, deleteSupplier }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) => {
      const keperluan = normalizeKeperluan(s.keperluanItems);
      const hay = `${s.namaToko || ""} ${s.alamat || ""} ${keperluan.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [suppliers, query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const renderItems = (s: SupplierEntry) => normalizeKeperluan(s.keperluanItems);

  return (
    <div className={styles.card} style={{ marginTop: 14 }}>
      <form className={styles.searchRow} onSubmit={onSubmit}>
        <div className={styles.searchInputWrap}>
          <span className={styles.searchIcon} aria-hidden="true">{"🔍"}</span>
          <input
            className={styles.searchInput}
            placeholder="Cari supplier, keperluan, atau alamat"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query ? (
          <button type="button" className={styles.clearLink} onClick={() => setQuery("")}>
            Reset
          </button>
        ) : null}
      </form>

      {filtered.length === 0 ? (
        <p className={styles.empty}>Tidak ada supplier dengan kata kunci tersebut.</p>
      ) : (
        <>
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
                  {filtered.map((s) => {
                    const items = renderItems(s);
                    const itemsText = items.slice(0, 4).join(", ") + (items.length > 4 ? ` (+${items.length - 4})` : "");
                    return (
                      <tr key={s.id}>
                        <td className={styles.nameCell}>{s.namaToko}</td>
                        <td className={styles.itemsCell}>{itemsText || "-"}</td>
                        <td className={styles.addrCell}>{s.alamat || "-"}</td>
                        <td className={styles.actionsCell}>
                          <a className={styles.actionBtn} href={`/supplier/${s.id}/maps`} target="_blank" rel="noopener noreferrer">
                            Lokasi
                          </a>
                          <a className={styles.actionBtn} href={`/supplier/${s.id}/wa`} target="_blank" rel="noopener noreferrer">
                            Hubungi
                          </a>
                          <Link className={styles.actionBtn} href={{ pathname: "/supplier", query: { edit: String(s.id) } }}>
                            Edit
                          </Link>
                          <form action={deleteSupplier}>
                            <input type="hidden" name="id" value={s.id} />
                            <button type="submit" className={styles.dangerBtn}>
                              Hapus
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

          <div className={styles.touchOnly}>
            <div className={styles.cardList}>
              {filtered.map((s) => {
                const items = renderItems(s);
                const itemsText = items.slice(0, 6).join(", ") + (items.length > 6 ? ` (+${items.length - 6})` : "");
                return (
                  <div key={s.id} className={styles.supplierCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardTitle}>{s.namaToko}</div>
                      <div className={styles.cardSub}>{itemsText || "-"}</div>
                      <div className={styles.cardMeta}>Alamat: {s.alamat || "-"}</div>
                    </div>
                    <div className={styles.cardActions}>
                      <a className={styles.actionBtn} href={`/supplier/${s.id}/maps`} target="_blank" rel="noopener noreferrer">
                        Lokasi
                      </a>
                      <a className={styles.actionBtn} href={`/supplier/${s.id}/wa`} target="_blank" rel="noopener noreferrer">
                        Hubungi
                      </a>
                      <Link className={styles.actionBtn} href={{ pathname: "/supplier", query: { edit: String(s.id) } }}>
                        Edit
                      </Link>
                      <form action={deleteSupplier} className={styles.cardDeleteForm}>
                        <input type="hidden" name="id" value={s.id} />
                        <button type="submit" className={styles.dangerBtn}>
                          Hapus
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
  );
}


