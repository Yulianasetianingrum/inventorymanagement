"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./supplier.module.css";
import { Button } from "@/components/ui/button";

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
  } catch { }
  return String(raw || "").split(",").map((x) => x.trim()).filter(Boolean);
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

  return (
    <div className="flex flex-col gap-8">
      {/* Search Input */}
      <div className="relative">
        <input
          className="w-full h-14 bg-white border border-navy/5 rounded-2xl px-12 font-bold text-navy shadow-sm focus:border-gold outline-none transition-all"
          placeholder="Cari supplier atau kategori barang..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center font-black opacity-20 text-2xl uppercase">No Suppliers Found</div>
      ) : (
        <div className={styles.supplierGrid}>
          {filtered.map((s) => {
            const items = normalizeKeperluan(s.keperluanItems);
            return (
              <div key={s.id} className={styles.supplierCard}>
                <h3 className={styles.supplierName}>{s.namaToko}</h3>

                <div className={styles.itemKeywords}>
                  {items.map((item, idx) => (
                    <span key={idx} className={styles.keywordPill}>{item}</span>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-navy/30 uppercase tracking-widest">Alamat</span>
                    <span className="text-xs font-bold text-navy/60 leading-relaxed">{s.alamat || "Alamat tidak tersedia"}</span>
                  </div>
                </div>

                <div className={styles.contactRow}>
                  <a className={`${styles.actionBtn} ${styles.btnMaps}`}
                    href={s.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.namaToko)}`}
                    target="_blank">
                    Buka Maps
                  </a>
                  <a className={`${styles.actionBtn} ${styles.btnWA}`}
                    href={s.noTelp ? `https://wa.me/${s.noTelp.replace(/\D/g, '')}` : "#"}
                    target="_blank">
                    WhatsApp
                  </a>
                  <Link href={{ pathname: "/supplier", query: { edit: String(s.id) } }} className={`${styles.actionBtn} !bg-navy !text-white !flex-[0.5]`}>
                    Edit
                  </Link>
                  <form action={deleteSupplier} className="flex-[0.5]">
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className={`${styles.actionBtn} !bg-error/10 !text-error w-full`}>
                      🗑️
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
