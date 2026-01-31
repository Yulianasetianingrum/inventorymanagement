"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import styles from "./page.module.css";

type Batch = {
  id: number;
  date: string;
  qtyInBase: number;
  unitCost: number;
  qtyRemaining: number;
  note: string | null;
  total: number;
  createdAt: string;
  mode: "baru" | "bekas";
  supplierName?: string | null;
  supplierId?: number | null;
};

type ItemInfo = {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  stockNew?: number;
  stockUsed?: number;
  stockTotal?: number;
  unit: string;
};
type SupplierHistory = { id: number; name: string | null }[];

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json" } });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login?error=unauthorized";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

export default function ItemRiwayatPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = Number(params?.id);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [item, setItem] = useState<ItemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Batch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    date: "",
    qtyInBase: "",
    unitCost: "",
    qtyRemaining: "",
    note: "",
    mode: "baru" as "baru" | "bekas",
  });
  const [supplierHistory, setSupplierHistory] = useState<SupplierHistory>([]);

  const unitLabel = item?.unit || "pcs";

  const load = async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson(`/api/admin/items/${itemId}/riwayat`);
      setBatches(data.data ?? []);
      setItem(data.item ?? null);
      setSupplierHistory(data.supplierHistory ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  };

  function toast(msg: string, errorToast?: boolean) {
    const el = document.createElement("div");
    el.className = `${styles.toast} ${errorToast ? styles.toastError : ""}`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add(styles.toastShow));
    setTimeout(() => {
      el.classList.remove(styles.toastShow);
      setTimeout(() => el.remove(), 200);
    }, 1600);
  }

  const totalNilai = useMemo(() => {
    return batches.reduce((acc, b) => {
      if (b.mode === "bekas") return acc;
      return acc + b.total;
    }, 0);
  }, [batches]);

  const stockSummary = useMemo(() => {
    let totalBaru = 0;
    let totalBekas = 0;
    for (const b of batches) {
      const qty = Number(b.qtyInBase || 0);
      if (b.mode === "bekas") totalBekas += qty;
      else totalBaru += qty;
    }
    return {
      totalBaru: Math.max(0, totalBaru),
      totalBekas: Math.max(0, totalBekas)
    };
  }, [batches]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const openEdit = (batch: Batch) => {
    setEditTarget(batch);
    setEditForm({
      date: batch.date.split("T")[0],
      qtyInBase: String(batch.qtyInBase),
      unitCost: String(batch.unitCost),
      qtyRemaining: String(batch.qtyRemaining),
      note: batch.note || "",
      mode: batch.mode || "baru",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editTarget || !itemId) return;
    const qtyInBase = Number(editForm.qtyInBase || 0);
    const isBekas = editForm.mode === "bekas";
    const unitCost = isBekas ? 0 : Number(editForm.unitCost || 0);
    const qtyRemaining = editForm.mode === "bekas" ? qtyInBase : Number(editForm.qtyRemaining || 0);
    if (qtyInBase < 0 || Number.isNaN(qtyInBase)) return toast("Qty tidak valid", true);
    if (!isBekas && (unitCost <= 0 || Number.isNaN(unitCost))) return toast("Unit cost tidak valid", true);
    if (qtyRemaining < 0 || Number.isNaN(qtyRemaining)) return toast("Qty remaining tidak valid", true);
    if (qtyRemaining > qtyInBase) return toast("Qty remaining tidak boleh melebihi qty masuk", true);
    try {
      setActionLoading(true);
      await fetchJson(`/api/admin/items/${itemId}/riwayat/${editTarget.id}`, {
        method: "PUT",
        body: JSON.stringify({
          date: editForm.date,
          qtyInBase,
          unitCost,
          qtyRemaining,
          note: editForm.note || null,
          mode: editForm.mode,
        }),
      });
      setEditOpen(false);
      await load();
    } catch (e: any) {
      toast(e?.message || "Gagal menyimpan", true);
    }
    setActionLoading(false);
  };

  const deleteBatch = async (batch: Batch) => {
    if (!itemId) return;
    setActionLoading(true);
    try {
      await fetchJson(`/api/admin/items/${itemId}/riwayat/${batch.id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      toast(e?.message || "Gagal menghapus", true);
    }
    setActionLoading(false);
    setDeleteTarget(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>AI</div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Apix Interior</div>
            <div className={styles.brandSubtitle}>Riwayat Pembelian</div>
          </div>
        </div>
        <div className={styles.topActions}>
          <Button
            style={{ background: "var(--white)", color: "var(--navy)", border: "1px solid var(--gold)" }}
            onClick={() => router.push("/items")}
          >
            ← Kembali
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>{item?.name ?? "Item"}</div>
              <div className={styles.sectionSubtitle}>
                {item?.brand || "-"} · {item?.category || "-"} · Satuan: {item?.unit || "-"}
              </div>
            </div>
            <div className={styles.summaryBox}>
              <div>Nilai stok tersisa</div>
              <div className={styles.summaryValue}>{formatCurrency(totalNilai)}</div>
            </div>
          </div>

          {error ? <Card className={styles.errorCard}>{error}</Card> : null}

          <Card className={styles.tableCard}>

            <div className="grid grid-cols-2 gap-4 p-4 md:p-6 border-b border-slate-100 bg-slate-50">
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1">Total Qty Baru (Riwayat)</div>
                <div className="text-2xl font-black text-navy">{stockSummary.totalBaru} {unitLabel}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1">Total Qty Bekas (Riwayat)</div>
                <div className="text-2xl font-black text-amber-600">{stockSummary.totalBekas} {unitLabel}</div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.listTable}>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Mode</th>
                    <th>Qty Baru ({unitLabel})</th>
                    <th>Qty Bekas ({unitLabel})</th>
                    <th>Unit Cost</th>
                    <th>Nilai</th>
                    <th>Supplier</th>
                    <th>Catatan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => {
                    const qtyBaru = b.mode === "baru" ? b.qtyInBase : null;
                    const qtyBekas = b.mode === "bekas" ? b.qtyInBase : 0;
                    const nilaiRow = b.mode === "bekas" ? 0 : b.total;
                    return (
                      <tr key={b.id}>
                        <td>{new Date(b.date).toLocaleDateString("id-ID")}</td>
                        <td>
                          <span className={`${styles.modeBadge} ${b.mode === "bekas" ? styles.modeBekas : styles.modeBaru}`}>
                            {b.mode === "bekas" ? "Bekas" : "Baru"}
                          </span>
                        </td>
                        <td>
                          {qtyBaru !== null ? `${qtyBaru} ${unitLabel}` : "-"}
                        </td>
                        <td>{qtyBekas} {unitLabel}</td>
                        <td>{b.mode === "bekas" ? "-" : formatCurrency(b.unitCost)}</td>
                        <td>{b.mode === "bekas" ? "-" : formatCurrency(nilaiRow)}</td>
                        <td>{b.supplierName || "-"}</td>
                        <td>
                          {b.mode === "bekas" ? <div className={styles.badgeTransfer}>Dipindah dari stok baru</div> : null}
                          {b.note ? <div>{b.note}</div> : b.mode === "bekas" ? null : "-"}
                        </td>
                        <td className={styles.actionCell}>
                          <button className={styles.actionBtn} onClick={() => openEdit(b)}>
                            Edit
                          </button>
                          <button className={styles.dangerBtn} onClick={() => setDeleteTarget(b)}>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && !batches.length ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", color: "var(--muted)" }}>
                        Tidak ada riwayat.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>

          <div className={styles.cardList}>
            {batches.map((b) => {
              const qtyBaru = b.mode === "baru" ? b.qtyInBase : null;
              const qtyBekas = b.mode === "bekas" ? b.qtyRemaining : 0;
              const nilaiRow = b.mode === "bekas" ? 0 : b.total;
              const isBekas = b.mode === "bekas";
              return (
                <Card key={b.id} className={styles.cardItem}>
                  <div className={styles.cardHeader}>
                    <div>
                      <div className={styles.cardTitle}>{new Date(b.date).toLocaleDateString("id-ID")}</div>
                      <div className={styles.cardMeta}>
                        <span className={`${styles.modeBadge} ${isBekas ? styles.modeBekas : styles.modeBaru}`}>
                          {isBekas ? "Bekas" : "Baru"}
                        </span>
                      </div>
                      <div className={styles.cardMeta}>
                        {isBekas ? `Qty bekas: ${qtyBekas} ${unitLabel}` : `Qty baru: ${qtyBaru ?? 0} ${unitLabel}`}
                      </div>
                      <div className={styles.cardMeta}>Supplier: {b.supplierName || "-"}</div>
                    </div>
                    <div className={styles.cardValue}>{isBekas ? "-" : formatCurrency(nilaiRow)}</div>
                  </div>
                  <div className={styles.cardStats}>
                    <div>
                      <div className={styles.statLabel}>Unit cost</div>
                      <div className={styles.statValue}>{isBekas ? "-" : formatCurrency(b.unitCost)}</div>
                    </div>
                    <div>
                      <div className={styles.statLabel}>{isBekas ? "Qty bekas" : "Qty baru"}</div>
                      <div className={styles.statValue}>{isBekas ? qtyBekas : (qtyBaru ?? 0)} {unitLabel}</div>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <Button onClick={() => openEdit(b)} style={{ background: "var(--navy)", color: "#fff" }}>
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteTarget(b)}
                      style={{ background: "#fff1f1", color: "var(--danger)", border: "1px solid #fecdd3" }}
                    >
                      Hapus
                    </Button>
                  </div>
                  <div className={styles.cardNote}>
                    {isBekas ? <div className={styles.badgeTransfer}>Dipindah dari stok baru</div> : null}
                    {b.note ? <div>{b.note}</div> : !isBekas ? "Tidak ada catatan" : null}
                  </div>
                </Card>
              );
            })}
            {!loading && !batches.length ? <Card className={styles.cardItem}>Tidak ada riwayat.</Card> : null}
          </div>

          <Modal open={editOpen} title="Edit Batch Pembelian" onClose={() => setEditOpen(false)}>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Tanggal</label>
                  <input
                    type="date"
                    className="w-full h-11 bg-white border border-navy/10 rounded-xl px-4 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/5"
                    value={editForm.date}
                    onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Mode</label>
                  <div className="w-full h-11 flex items-center bg-gray-50 border border-transparent rounded-xl px-4 text-sm font-bold text-gray-500">
                    {editForm.mode === "bekas" ? "Barang Bekas (Retur/Sisa)" : "Barang Baru (Beli)"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1.5 block">
                    {editForm.mode === "bekas" ? `Qty Bekas (${unitLabel})` : `Qty Baru (${unitLabel})`}
                  </label>
                  <input
                    type="number"
                    className="w-full h-11 bg-white border border-navy/10 rounded-xl px-4 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/5"
                    value={editForm.qtyInBase}
                    onChange={(e) => setEditForm((f) => ({ ...f, qtyInBase: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Unit Cost</label>
                  {editForm.mode !== "bekas" ? (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30 font-bold">Rp</span>
                      <input
                        type="number"
                        className="w-full h-11 bg-white border border-navy/10 rounded-xl px-4 pl-10 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/5"
                        value={editForm.unitCost}
                        onChange={(e) => setEditForm((f) => ({ ...f, unitCost: e.target.value }))}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-11 flex items-center bg-gray-50 border border-transparent rounded-xl px-4 text-sm font-bold text-gray-400">
                      -
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Supplier</label>
                <div className="w-full h-11 flex items-center bg-blue-50/50 border border-blue-100 rounded-xl px-4 text-sm font-bold text-navy">
                  {editTarget?.supplierName || "Tidak ada data supplier"}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Catatan / Referensi</label>
                <textarea
                  className="w-full h-20 bg-white border border-navy/10 rounded-xl p-4 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/5 resize-none"
                  value={editForm.note}
                  onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Tambahkan catatan..."
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={saveEdit}
                  className="w-full h-12 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 shadow-lg shadow-navy/20 transition-all text-sm uppercase tracking-wide"
                >
                  {actionLoading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          </Modal>

          <Modal
            open={!!deleteTarget}
            title="Hapus Batch"
            onClose={() => setDeleteTarget(null)}
          >
            <div className={styles.modalForm}>
              <div className={styles.modalConfirmText}>
                Yakin mau hapus batch tanggal {deleteTarget ? new Date(deleteTarget.date).toLocaleDateString("id-ID") : ""}?
              </div>
              <div className={styles.confirmActions}>
                <Button
                  style={{ background: "#fff1f1", color: "var(--danger)", border: "1px solid #fecdd3" }}
                  onClick={() => deleteTarget && deleteBatch(deleteTarget)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Menghapus..." : "Hapus"}
                </Button>
                <Button onClick={() => setDeleteTarget(null)} style={{ background: "var(--white)", color: "var(--navy)", border: "1px solid #cbd5e1" }}>
                  Batal
                </Button>
              </div>
            </div>
          </Modal>
        </section>
      </main>
    </div>
  );
}
