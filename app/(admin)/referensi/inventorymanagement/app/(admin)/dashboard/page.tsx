"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import styles from "./dashboard.module.css";

const kpis: { title: string; value: string; desc: string }[] = [];

// ✅ Urutkan sesuai alur kerja & keterkaitan: Karyawan → Supplier → Items → Picklist → Projects → Audit
const moduleCards: { title: string; desc: string; href: string }[] = [
  {
    title: "Karyawan",
    desc: "Kelola akun internal (Admin/Worker): tambah/edit, aktif/nonaktif, reset credential (tampil sekali).",
    href: "/karyawan",
  },
  {
    title: "Supplier",
    desc: "Direktori supplier: item kebutuhan, alamat (masking), dan shortcut Lokasi (Maps) + Hubungi (WA).",
    href: "/supplier",
  },
  {
    title: "Items Gudang",
    desc: "Monitor stok gudang, refill, dan input pembelian/stock-in (unit cost & nilai stok).",
    href: "/items",
  },
  {
    title: "Picklist",
    desc: "Kelola daftar picklist untuk proses pengambilan barang (buat, detail, print).",
    href: "/picklists",
  },
  {
    title: "Projects",
    desc: "Catat project klien/prospek, kebutuhan, dan kontak WhatsApp untuk follow-up cepat.",
    href: "/projects",
  },
  {
    title: "Audit",
    desc: "Audit aktivitas item & audit pengeluaran (cost) untuk pelacakan operasional.",
    href: "/audit",
  },
];

const picklistWatch: { code: string; project: string; status: string; worker: string }[] = [];
const activities: string[] = [];

type LowStockRow = {
  id: number;
  name: string;
  stock: number;
  min: number;
  status: "Habis" | "Wajib Refill" | string;
};

type FetchSoftResult =
  | { ok: true; status: number; json: any }
  | { ok: false; status: number; text: string };

async function fetchJsonSoft(url: string): Promise<FetchSoftResult> {
  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login?error=unauthorized";
    return { ok: false, status: res.status, text: "Unauthorized" };
  }

  // ✅ jangan throw — biar tidak jadi console error noisy
  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {
      text = `HTTP ${res.status}`;
    }
    console.warn("[dashboard] fetch failed:", { url, status: res.status, text: text?.slice?.(0, 200) });
    return { ok: false, status: res.status, text };
  }

  try {
    const json = await res.json();
    return { ok: true, status: res.status, json };
  } catch (e) {
    console.warn("[dashboard] invalid json:", { url, status: res.status, e });
    return { ok: false, status: res.status, text: "Invalid JSON" };
  }
}

function pluckList(payload: any): any[] {
  if (!payload) return [];
  // beberapa variasi common: {data:[...]}, {items:[...]}, {rows:[...]}, {products:[...]}
  const candidates = [payload.data, payload.items, payload.rows, payload.products, payload.result];
  for (const c of candidates) if (Array.isArray(c)) return c;
  // kadang payload langsung array
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function AdminDashboardPage() {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [userLabel, setUserLabel] = useState("Memuat...");
  const [userOrg, setUserOrg] = useState("");
  const [userEmployeeId, setUserEmployeeId] = useState<string | null>(null);

  const [lowStockList, setLowStockList] = useState<LowStockRow[]>([]);

  const goToLowStock = () => {
    window.location.href = "/items?filter=priority";
  };

  const handleLogoutClick = () => setConfirmLogout(true);
  const doLogout = async () => {
    setConfirmLogout(false);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) throw new Error("no session");
        const data = await res.json();
        if (data?.user?.employeeId) {
          setUserEmployeeId(String(data.user.employeeId));
          setUserLabel(`${data.user.employeeId} • ${data.user.role ?? "User"}`);
          setUserOrg(data.user.name ?? "Apix Interior");
        } else {
          setUserEmployeeId(null);
          setUserLabel("Tidak ada sesi");
        }
      } catch {
        setUserEmployeeId(null);
        setUserLabel("Tidak ada sesi");
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadLowStock = async () => {
      // Plan:
      // 1) Coba endpoint filter=low & filter=empty
      // 2) Kalau gagal (endpoint tidak support filter / error), fallback ke /api/admin/items lalu filter di client.
      try {
        const [lowRes, emptyRes] = await Promise.all([
          fetchJsonSoft("/api/admin/items?filter=low"),
          fetchJsonSoft("/api/admin/items?filter=empty"),
        ]);

        const mapRow = (it: any): LowStockRow => ({
          id: Number(it?.id ?? 0),
          name: String(it?.name ?? it?.nama ?? "Item"),
          stock: Number(it?.stockTotal ?? it?.stock ?? 0),
          min: Number(it?.minStock ?? it?.min ?? 0),
          status: String(it?.statusRefill ?? it?.status ?? ""),
        });

        // ✅ primary (kalau filter endpoint bekerja)
        if (lowRes.ok && emptyRes.ok) {
          const empty = pluckList(emptyRes.json).map(mapRow);
          const low = pluckList(lowRes.json).map(mapRow);

          const merged = [...empty, ...low]; // Habis dulu
          const byId = new Map<number, LowStockRow>();
          for (const r of merged) if (r.id && !byId.has(r.id)) byId.set(r.id, r);

          setLowStockList(Array.from(byId.values()).slice(0, 6));
          return;
        }

        // ✅ fallback: load semua, filter statusRefill di client
        const all = await fetchJsonSoft("/api/admin/items");
        if (all.ok) {
          const rows = pluckList(all.json);
          const mapped = rows.map(mapRow);

          const empty = mapped.filter((x) => String(x.status).toLowerCase() === "habis" || x.stock <= 0);
          const low = mapped.filter(
            (x) =>
              String(x.status).toLowerCase() === "wajib refill" ||
              (x.stock > 0 && x.stock <= (Number.isFinite(x.min) ? x.min : 0))
          );

          const merged = [...empty, ...low]; // Habis dulu
          const byId = new Map<number, LowStockRow>();
          for (const r of merged) if (r.id && !byId.has(r.id)) byId.set(r.id, r);

          setLowStockList(Array.from(byId.values()).slice(0, 6));
          return;
        }

        // kalau semuanya gagal
        setLowStockList([]);
      } catch (e) {
        console.warn("[dashboard] loadLowStock unexpected error:", e);
        setLowStockList([]);
      }
    };

    loadLowStock();
  }, []);

  const logoutLabel = userEmployeeId ?? userLabel.split("•")[0].trim();

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <img src="/logo/apix.png" alt="Apix Interior" />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Apix Interior</div>
            <div className={styles.brandSubtitle}>Dashboard</div>
          </div>
        </div>

        <div className={styles.userBox}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{userLabel}</div>
            <div className={styles.userOrg}>{userOrg}</div>
          </div>
          <Button type="button" onClick={handleLogoutClick} className={styles.logoutBtn}>
            Logout
          </Button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.contentInner}>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>Ringkasan Hari Ini</div>
            {kpis.length > 0 ? (
              <>
                <div className={styles.kpiGrid}>
                  {kpis.map((kpi) => (
                    <Card key={kpi.title} className={styles.panel}>
                      <div className={styles.panelTitle}>{kpi.title}</div>
                      <div>{kpi.value}</div>
                      <div className={styles.muted}>{kpi.desc}</div>
                    </Card>
                  ))}
                </div>
                <div className={styles.muted}>Angka diambil dari stock ledger & picklist.</div>
              </>
            ) : (
              <Card className={styles.emptyCard}>Belum ada data KPI hari ini.</Card>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>Menu Utama</div>
            <div className={styles.kpiGrid}>
              {moduleCards.map((m) => (
                <Link key={m.title} href={m.href} className={styles.cardLink} aria-label={`Buka ${m.title}`}>
                  <Card className={`${styles.panel} ${styles.clickablePanel}`}>
                    <div className={styles.panelHeader}>
                      <div className={styles.panelTitle}>{m.title}</div>
                      <span className={styles.chevron} aria-hidden>
                        ›
                      </span>
                    </div>
                    <div className={styles.muted}>{m.desc}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>Fokus Operasional</div>
            <div className={styles.focusGrid}>
              <Card
                className={`${styles.panel} ${styles.clickablePanel}`}
                role="button"
                tabIndex={0}
                onClick={goToLowStock}
                onKeyDown={(e) => e.key === "Enter" && goToLowStock()}
              >
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle}>Low Stock Prioritas</div>
                  <span className={styles.panelHint}>Klik untuk lihat</span>
                </div>

                {lowStockList.length > 0 ? (
                  <div className={styles.activityList}>
                    {lowStockList.map((item) => (
                      <div key={item.id} className={styles.listItem} onClick={(e) => e.stopPropagation()}>
                        <span className={styles.listItemName}>{item.name}</span>
                        <span className={styles.muted}>Stok: {item.stock}</span>
                        <span className={styles.muted}>Min: {item.min}</span>
                        <span className={styles.muted}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.muted}>Belum ada data low stock.</div>
                )}
              </Card>

              <Card className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle}>Picklist Perlu Dipantau</div>
                  <Link href="/picklists" className={styles.panelLink}>
                    Lihat
                  </Link>
                </div>

                {picklistWatch.length > 0 ? (
                  <div className={styles.activityList}>
                    {picklistWatch.map((pl) => (
                      <div key={pl.code} className={styles.picklistItem}>
                        <span>{pl.code}</span>
                        <span className={styles.muted}>{pl.project}</span>
                        <span>{pl.status}</span>
                        <span className={styles.muted}>{pl.worker}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.muted}>Belum ada picklist.</div>
                )}
              </Card>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.panelHeader}>
              <div className={styles.sectionTitle}>Aktivitas Terakhir</div>
              <Link href="/audit" className={styles.panelLink}>
                Lihat semua audit
              </Link>
            </div>

            {activities.length > 0 ? (
              <Card className={styles.activityCard}>
                <ul className={styles.activityList}>
                  {activities.slice(0, 10).map((act) => (
                    <li key={act} className={styles.activityText}>
                      {act}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <Card className={styles.emptyCard}>Belum ada aktivitas.</Card>
            )}
          </section>
        </div>
      </main>

      {confirmLogout ? (
        <div className={styles.overlay}>
          <Card className={styles.modal}>
            <div className={styles.panelTitle}>Logout dari akun {logoutLabel}?</div>
            <div className={styles.modalActions}>
              <Button type="button" onClick={() => setConfirmLogout(false)} className={styles.btnGhost}>
                Batal
              </Button>
              <Button type="button" onClick={doLogout} className={styles.btnGold}>
                Logout
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

