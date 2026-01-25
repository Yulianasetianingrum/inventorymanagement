"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
// import styles from "./dashboard.module.css";
// Styling replaced with Tailwind classes commensurate with standard enterprise theme



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
  const [workerPerformance, setWorkerPerformance] = useState<any[]>([]);
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [kpis, setKpis] = useState<{ title: string; value: string; desc: string }[]>([]);

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

  useEffect(() => {
    const loadKpiData = async () => {
      try {
        setLoadingKpi(true);
        const res = await fetch("/api/admin/audit/kpi?filter=month");
        if (res.ok) {
          const json = await res.json();
          // ✅ Switch to Top Items (Traceability)
          if (json.data?.topItems) {
            setWorkerPerformance(json.data.topItems.map((item: any) => ({
              name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
              tasks: item.total, // Reusing 'tasks' key for quantity to keep chart config simple
              full: item.name,
              unit: item.unit
            })));
          }
          // Assuming kpis data might also come from this endpoint or another
          if (json.data?.kpis) {
            setKpis(json.data.kpis);
          }
        }
      } catch (e) {
        console.error("Failed to load KPI chart", e);
      } finally {
        setLoadingKpi(false);
      }
    };
    loadKpiData();
  }, []);

  const logoutLabel = userEmployeeId ?? userLabel.split("•")[0].trim();

  return (
    <div className="min-h-screen bg-gray-50 text-navy font-sans mb-10">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0b1b3a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      {/* Topbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy text-white rounded-lg flex items-center justify-center shadow-lg shadow-navy/20">
              <img src="/logo/apix.png" alt="Logo" className="w-6 h-6 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="text-xl" style={{ display: 'none' }}>🛡️</span> {/* Fallback hidden */}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-navy uppercase tracking-wider leading-none">Apix Interior</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Enterprise Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-navy">{userLabel}</div>
              <div className="text-[10px] font-medium text-gray-400">{userOrg}</div>
            </div>
            <Button
              type="button"
              onClick={handleLogoutClick}
              className="bg-white border border-gray-200 text-navy hover:bg-gray-50 hover:border-gold/50 text-[10px] font-bold uppercase tracking-widest h-9 px-4 rounded-lg transition-colors"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* KPI Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-black text-navy uppercase tracking-wide">Ringkasan Hari Ini</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {kpis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kpis.map((kpi) => (
                <Card key={kpi.title} className="bg-white border border-gray-100 shadow-sm p-6 rounded-xl">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{kpi.title}</div>
                  <div className="text-2xl font-black text-navy mb-1">{kpi.value}</div>
                  <div className="text-xs font-medium text-gray-400">{kpi.desc}</div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border border-gray-100 p-8 text-center rounded-xl border-dashed">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada data KPI terbaru</span>
            </Card>
          )}
        </section>

        {/* Analytics Section with Chart */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-black text-navy uppercase tracking-wide">Performa & Statistik</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chart Card */}
            <Card className="md:col-span-2 bg-white border border-gray-200 shadow-sm p-6 rounded-xl min-h-[300px] flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-black text-navy uppercase tracking-wide">Traceability Barang</h3>
                  <p className="text-xs text-gray-400">Paling Banyak Digunakan (Bulan Ini)</p>
                </div>
              </div>

              <div className="flex-1 w-full min-h-[200px]">
                {loadingKpi ? (
                  <div className="h-full flex items-center justify-center text-xs font-bold text-gray-300 uppercase tracking-widest animate-pulse">
                    Menghitung Pemakaian...
                  </div>
                ) : workerPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workerPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#0b1b3a', fontSize: 10, fontWeight: 900 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                      />
                      <Tooltip
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 900, color: '#0b1b3a' }}
                        itemStyle={{ color: '#d4af37' }}
                      />
                      <Bar dataKey="tasks" radius={[4, 4, 0, 0]} barSize={40}>
                        {workerPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#d4af37' : '#0b1b3a'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center flex-col gap-2 text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">📦</div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Belum ada barang keluar</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Summary Stats */}
            <Card className="bg-navy text-white shadow-xl shadow-navy/20 p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] translate-x-10 -translate-y-10"></div>

              <div className="relative z-10">
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Total Item Keluar</div>
                <div className="text-4xl font-black text-white mb-6">
                  {workerPerformance.reduce((acc, curr) => acc + curr.tasks, 0)} <span className="text-sm font-bold opacity-50">Unit</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Item Terlaris</div>
                    <div className="text-lg font-bold text-gold">
                      {workerPerformance[0]?.full || "-"}
                    </div>
                    <div className="text-[10px] text-white/60">
                      {workerPerformance[0] ? `${workerPerformance[0].tasks} ${workerPerformance[0].unit}` : ""}
                    </div>
                  </div>

                  <Link href="/audit" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors">
                    Lihat Detail Audit →
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Main Menu Grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-black text-navy uppercase tracking-wide">Menu Utama</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleCards.map((m) => (
              <Link key={m.title} href={m.href} className="group block h-full">
                <Card className="h-full bg-white border border-gray-200 shadow-sm p-5 rounded-xl transition-all duration-200 group-hover:border-gold/60 group-hover:shadow-md group-hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-black text-navy uppercase tracking-wide group-hover:text-gold-deep transition-colors">{m.title}</h3>
                    <span className="text-gray-300 group-hover:text-gold transition-colors">↗</span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">{m.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Operational Focus */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-black text-navy uppercase tracking-wide">Fokus Operasional</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Panel */}
            <Card
              className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden cursor-pointer hover:border-gold/30 transition-colors group"
              onClick={goToLowStock}
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="text-sm font-black text-navy uppercase tracking-wide">Low Stock Prioritas</div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Lihat Semua →</span>
              </div>

              <div className="p-2">
                {lowStockList.length > 0 ? (
                  <div className="space-y-1">
                    {lowStockList.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors items-center text-xs">
                        <div className="col-span-4 font-bold text-navy truncate">{item.name}</div>
                        <div className="col-span-3 text-gray-500">Stok: <span className={item.stock <= 0 ? "text-error font-bold" : "text-navy"}>{item.stock}</span></div>
                        <div className="col-span-2 text-gray-400 text-[10px]">Min: {item.min}</div>
                        <div className="col-span-3 text-right">
                          <span className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${String(item.status).toLowerCase().includes("habis") ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                            }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Stok Aman Terkendali</div>
                )}
              </div>
            </Card>

            {/* Picklist Watch */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="text-sm font-black text-navy uppercase tracking-wide">Picklist Monitor</div>
                <Link href="/picklists" className="text-[10px] font-bold text-gray-400 hover:text-navy uppercase tracking-widest transition-colors">
                  Lihat Semua
                </Link>
              </div>

              <div className="p-2">
                {picklistWatch.length > 0 ? (
                  <div className="space-y-1">
                    {picklistWatch.map((pl) => (
                      <div key={pl.code} className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors items-center text-xs">
                        <div className="col-span-3 font-mono font-bold text-navy">{pl.code}</div>
                        <div className="col-span-4 text-gray-500 truncate">{pl.project}</div>
                        <div className="col-span-3">
                          <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase">{pl.status}</span>
                        </div>
                        <div className="col-span-2 text-right text-[10px] text-gray-400 truncate">{pl.worker}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Tidak ada antrian picklist</div>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-navy uppercase tracking-wide">Log Aktivitas</h2>
            </div>
            <Link href="/audit" className="text-[10px] font-bold text-gold hover:text-gold-dark uppercase tracking-widest transition-colors">
              Audit Lengkap →
            </Link>
          </div>

          <Card className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl">
            {activities.length > 0 ? (
              <ul className="space-y-3">
                {activities.slice(0, 10).map((act, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-gray-600 border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada aktivitas tercatat</div>
            )}
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200 mt-10 flex flex-col items-center gap-2">
        <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Apix Interior Enterprise System</div>
        <div className="text-[10px] font-bold text-gold/60 uppercase">© 2026 All Rights Reserved</div>
      </footer>

      {/* Logout Modal */}
      {confirmLogout ? (
        <div className="fixed inset-0 z-[100] bg-navy/20 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-navy mb-2">Konfirmasi Logout</h3>
            <p className="text-sm text-gray-500 mb-6">Apakah anda yakin ingin keluar dari sesi <b>{logoutLabel}</b>?</p>
            <div className="flex justify-end gap-3">
              <Button type="button" onClick={() => setConfirmLogout(false)} className="bg-white border border-gray-200 text-navy hover:bg-gray-50 text-xs font-bold uppercase tracking-wider rounded-lg h-10 px-4">
                Batal
              </Button>
              <Button type="button" onClick={doLogout} className="bg-navy text-white hover:bg-navy-light text-xs font-bold uppercase tracking-wider rounded-lg h-10 px-4 shadow-lg shadow-navy/20">
                Ya, Keluar
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

