"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, PieChart, Pie, Legend } from 'recharts';
// import styles from "./dashboard.module.css";
// Styling replaced with Tailwind classes commensurate with standard enterprise theme


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};



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





type AnalysisData = {
  kpi: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
  };
  fastMoving: { name: string; stockUsed: number; totalStock: number }[];
  deadStock: { name: string; value: number; totalStock: number }[];
  categories: { name: string; count: number }[];
  slowMovingCount: number;
};

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

  // Analytics State
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);

  const [kpis, setKpis] = useState<{ title: string; value: string; desc: string }[]>([]);
  const [picklistWatch, setPicklistWatch] = useState<{ code: string; project: string; status: string; worker: string }[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

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
        // Using fetch for existing endpoints (legacy) and fetchJsonSoft for new one
        const [kpiRes, plistRes, analysisRes] = await Promise.all([
          fetch("/api/admin/audit/kpi?filter=month"),
          fetch("/api/admin/picklists"),
          fetchJsonSoft("/api/admin/analysis")
        ]);

        // Process Analysis Data
        if (analysisRes && analysisRes.ok) {
          if (analysisRes.json.data) {
            setAnalysisData(analysisRes.json.data);
          }
        }
        setLoadingAnalysis(false);

        if (kpiRes.ok) {
          const json = await kpiRes.json();
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
          if (json.data?.recentActivity) {
            // @ts-ignore
            setActivities(json.data.recentActivity);
          }
        }

        if (plistRes.ok) {
          const json = await plistRes.json();
          const list = Array.isArray(json.data) ? json.data : Array.isArray(json.picklists) ? json.picklists : [];
          // Filter only active (READY/PICKING) and take top 5
          const active = list
            .filter((p: any) => ["READY", "PICKING"].includes(p.status))
            .slice(0, 5)
            .map((p: any) => ({
              code: p.code,
              project: p.project?.namaProjek || "No Project",
              status: p.status === "PICKING" ? "Running" : "Pending",
              worker: p.assignee?.name || "-"
            }));
          setPicklistWatch(active);
        }

      } catch (e) {
        console.error("Failed to load KPI/Picklist data", e);
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

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8 md:space-y-10">

        {/* KPI Section REMOVED - Redundant with Analysis */}

        {/* Analytics Section (Merged) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base md:text-lg font-black text-navy uppercase tracking-wide">Analisis Inventaris & Kesehatan Stok</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {!analysisData ? (
            <div className="p-8 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
              {loadingAnalysis ? "Memuat Data Analisis..." : "Gagal memuat data analisis."}
            </div>
          ) : (
            <div className="space-y-8">
              {/* 1. New KPI Cards for Assets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none text-white shadow-lg shadow-blue-500/20 rounded-xl">
                  <div className="p-5">
                    <div className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Total Nilai Aset</div>
                    <div className="text-2xl font-black">{formatCurrency(analysisData.kpi.totalValue)}</div>
                    <div className="text-white/60 text-[10px] mt-1">Estimasi uang mengendap</div>
                  </div>
                </Card>

                <Card className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total SKU Item</div>
                  <div className="text-2xl font-black text-navy">{analysisData.kpi.totalItems}</div>
                  <div className="text-gray-400 text-[10px] mt-1">Jenis barang aktif</div>
                </Card>

                <Link href="/items?filter=priority" className="contents">
                  <Card className={`border border-gray-100 shadow-sm rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-red-200 transition-all ${analysisData.kpi.lowStockCount > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${analysisData.kpi.lowStockCount > 0 ? 'text-red-400' : 'text-green-600'}`}>Status Alert</div>
                    <div className={`text-2xl font-black ${analysisData.kpi.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {analysisData.kpi.lowStockCount} Item
                    </div>
                    <div className={`text-[10px] mt-1 ${analysisData.kpi.lowStockCount > 0 ? 'text-red-400' : 'text-green-600'}`}>
                      {analysisData.kpi.lowStockCount > 0 ? 'Perlu Restock Segera! (Klik untuk melihat)' : 'Stok Aman Terkendali'}
                    </div>
                  </Card>
                </Link>
              </div>

              {/* 2. Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fast Moving */}
                <Link href="/audit?tab=ITEMS" className="contents">
                  <Card className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 h-[350px] flex flex-col cursor-pointer hover:border-gold/50 hover:shadow-md transition-all">
                  <h3 className="text-sm font-black text-navy uppercase tracking-wide mb-4 flex items-center gap-2">🔥 Top Fast Moving <span className="text-[10px] font-normal text-gray-400 normal-case">(Berdasarkan pemakaian)</span></h3>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysisData.fastMoving} layout="vertical" margin={{ left: 0, right: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="stockUsed" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  </Card>
                </Link>

                {/* Category Pie */}
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 h-[350px] flex flex-col">
                  <h3 className="text-sm font-black text-navy uppercase tracking-wide mb-4">📊 Distribusi Kategori</h3>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analysisData.categories}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {analysisData.categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* 3. Dead Stock Table */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
                  <div>
                    <h3 className="text-sm font-black text-red-700 uppercase tracking-wide">💀 Dead Stock Candidates</h3>
                    <p className="text-[10px] text-red-400 mt-1">Barang bernilai tinggi yang tidak bergerak. Pertimbangkan likuidasi.</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-4 w-10">#</th>
                        <th className="p-4">Nama Barang</th>
                        <th className="p-4 text-center">Stok Ngendap</th>
                        <th className="p-4 text-right">Nilai Aset</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {analysisData.deadStock.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-red-50/10 transition-colors cursor-pointer"
                          onClick={() => {
                            const q = encodeURIComponent(String(item?.name ?? ""));
                            window.location.href = `/picklists?item=${q}`;
                          }}
                        >
                          <td className="p-4 text-gray-300 font-bold">{idx + 1}</td>
                          <td className="p-4 font-bold text-navy">{item.name}</td>
                          <td className="p-4 text-center text-gray-500 font-mono">{item.totalStock}</td>
                          <td className="p-4 text-right font-bold text-red-600 font-mono">{formatCurrency(item.value)}</td>
                        </tr>
                      ))}
                      {analysisData.deadStock.length === 0 && (
                        <tr><td colSpan={4} className="p-6 text-center text-gray-400 italic">Bersih! Tidak ada dead stock signifikan.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

            </div>
          )}
        </section>

        {/* Main Menu Grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-base md:text-lg font-black text-navy uppercase tracking-wide">Menu Utama</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <h2 className="text-base md:text-lg font-black text-navy uppercase tracking-wide">Fokus Operasional</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Panel */}
            <Card
              className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden cursor-pointer hover:border-gold/30 transition-colors group"
              onClick={goToLowStock}
            >
              <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="text-xs md:text-sm font-black text-navy uppercase tracking-wide">Low Stock Prioritas</div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Lihat Semua →</span>
              </div>

              <div className="p-2">
                {lowStockList.length > 0 ? (
                  <div className="space-y-1">
                    {lowStockList.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors items-center text-xs">
                        <div className="col-span-6 md:col-span-4 font-bold text-navy truncate">{item.name}</div>
                        <div className="col-span-6 md:col-span-3 text-gray-500 text-right md:text-left">Stok: <span className={item.stock <= 0 ? "text-error font-bold" : "text-navy"}>{item.stock}</span></div>
                        <div className="hidden md:block col-span-2 text-gray-400 text-[10px]">Min: {item.min}</div>
                        <div className="col-span-12 md:col-span-3 flex justify-end">
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
              <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="text-xs md:text-sm font-black text-navy uppercase tracking-wide">Picklist Monitor</div>
                <Link href="/picklists" className="text-[10px] font-bold text-gray-400 hover:text-navy uppercase tracking-widest transition-colors">
                  Lihat Semua
                </Link>
              </div>

              <div className="p-2">
                {loadingKpi ? (
                  <div className="py-10 text-center text-xs font-bold text-gray-300 uppercase tracking-widest animate-pulse">Memuat Antrian...</div>
                ) : picklistWatch.length > 0 ? (
                  <div className="space-y-1">
                    {picklistWatch.map((pl) => (
                      <div key={pl.code} className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors items-center text-xs">
                        <div className="col-span-6 md:col-span-3 font-mono font-bold text-navy">{pl.code}</div>
                        <div className="col-span-6 md:col-span-4 text-gray-500 truncate text-right md:text-left">{pl.project}</div>
                        <div className="col-span-6 md:col-span-3 mt-1 md:mt-0">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${pl.status === 'Running' ? 'bg-warn-light text-warn-dark' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {pl.status}
                          </span>
                        </div>
                        <div className="col-span-6 md:col-span-2 text-right text-[10px] text-gray-400 truncate mt-1 md:mt-0">{pl.worker}</div>
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

        {/* Audit */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base md:text-lg font-black text-navy uppercase tracking-wide">Audit</h2>
            </div>
            <Link href="/audit" className="text-[10px] font-bold text-gold hover:text-gold-dark uppercase tracking-widest transition-colors">
              Audit Lengkap →
            </Link>
          </div>

          <Card className="bg-white border border-gray-200 shadow-sm p-4 md:p-5 rounded-xl">
            {activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((act: any, i) => {
                  let badgeColor = "bg-gray-100 text-gray-600";
                  let actionLabel = act.action;
                  let icon = "🔧";

                  if (act.action === "CREATE_PICKLIST") {
                    badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
                    actionLabel = "Membuat Picklist";
                    icon = "📝";
                  } else if (act.action === "STOCK_ADJUSTMENT") {
                    badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                    actionLabel = "Update Stok";
                    icon = "📦";
                  } else if (act.action === "DELETE_ITEM") {
                    badgeColor = "bg-red-50 text-red-700 border-red-100";
                    actionLabel = "Hapus Item";
                    icon = "🗑️";
                  } else if (act.action === "CREATE_USER") {
                    badgeColor = "bg-green-50 text-green-700 border-green-100";
                    actionLabel = "Tambah User";
                    icon = "👤";
                  } else if (act.action === "DELETE_USER") {
                    badgeColor = "bg-red-50 text-red-700 border-red-100";
                    actionLabel = "Hapus User";
                    icon = "🚫";
                  }

                  // Clean detail text
                  let safeDetail = act.detail || "";
                  safeDetail = safeDetail.replace("Created picklist ", "No. ");
                  safeDetail = safeDetail.replace("Deleted item ", "Item ID: ");
                  safeDetail = safeDetail.replace("Adj Stock: ", "");

                  return (
                    <li key={i} className="flex items-start gap-3 border-b border-gray-50 last:border-0 pb-3 last:pb-0 group">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs border ${badgeColor} shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] md:text-[11px] font-black text-navy uppercase tracking-wide truncate pr-2">
                            {actionLabel}
                          </span>
                          <span className="text-[9px] font-bold text-gray-300 uppercase whitespace-nowrap">
                            {new Date(act.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5 leading-relaxed truncate font-medium">
                          <span className="text-navy/60 font-bold mr-1">{act.user}</span>
                          {safeDetail}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada audit tercatat</div>
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
