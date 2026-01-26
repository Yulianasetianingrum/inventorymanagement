"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("KPI"); // KPI, ITEMS, SPENDING
  const [filter, setFilter] = useState("month"); // week, month, year
  const [benchmarkSearch, setBenchmarkSearch] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab, filter]);

  async function fetchData() {
    setData(null);
    setLoading(true);
    try {
      let endpoint = "/api/admin/audit/kpi";
      if (activeTab === "ITEMS") endpoint = "/api/admin/audit/items";
      if (activeTab === "SPENDING") endpoint = "/api/admin/audit/spending";

      const res = await fetch(`${endpoint}?filter=${filter}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Gagal memuat data");
      setData(json.data);
    } catch (err: any) {
      console.error("Audit fetch failed", err);
      setData([]); // Fallback to empty to avoid crashing maps
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-navy font-sans mb-10">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0b1b3a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy text-white rounded-lg flex items-center justify-center shadow-lg shadow-navy/20">
              <span className="font-bold text-lg">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-navy uppercase tracking-wider leading-none">Apix Interior</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Audit & BI Center</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[10px] font-bold text-gray-400 hover:text-navy uppercase tracking-widest transition-colors">
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Statistics Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-navy mb-2 tracking-tighter">Inventory Audit</h1>
            <p className="text-sm font-semibold text-navy/40 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              Real-time monitoring & performance analytics
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            {['week', 'month', 'year'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-navy text-white shadow-md' : 'text-gray-400 hover:text-navy hover:bg-gray-50'
                  }`}
              >
                {f === 'week' ? 'Minggu' : f === 'month' ? 'Bulan' : 'Tahun'}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-200 pb-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {[
            { id: 'KPI', label: 'Performa Kerja' },
            { id: 'ITEMS', label: 'Traceability' },
            { id: 'SPENDING', label: 'Audit Finansial' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 flex-shrink-0 ${activeTab === tab.id
                ? 'border-gold text-navy'
                : 'border-transparent text-gray-400 hover:text-navy hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-[10px] font-black uppercase tracking-widest text-navy/20 flex items-center gap-2">
              <span className="animate-pulse">Mengolah Data Raksasa...</span>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "KPI" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-1">
                  <div className="bg-white p-6 rounded-lg">
                    <h2 className="text-xl font-black text-navy mb-6 tracking-tight flex items-center justify-between">
                      Leaderboard Worker
                      <span className="text-[10px] font-bold text-navy/30 uppercase tracking-widest italic">Tugas Selesai</span>
                    </h2>
                    <div className="space-y-4">
                      {data?.workers?.map((w: any, idx: number) => (
                        <div key={w.id} className="flex items-center justify-between p-4 rounded-2xl bg-off-white/50 border border-navy/5 hover:border-gold/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx < 3 ? 'bg-gold text-navy' : 'bg-navy/5 text-navy/40'}`}>
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-navy text-sm">{w.name}</div>
                              <div className="text-[10px] font-bold text-navy/30 uppercase tracking-tighter">ID: {w.employeeId}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-xl font-black text-navy tracking-tight">{w.count}</div>
                            <div className="text-[9px] font-bold text-success uppercase">Tugas Selesai</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-1">
                  <div className="bg-white p-6 rounded-lg">
                    <h2 className="text-xl font-black text-navy mb-6 tracking-tight flex items-center justify-between">
                      Performa Admin
                      <span className="text-[10px] font-bold text-navy/30 uppercase tracking-widest italic">Picklist Dibuat</span>
                    </h2>
                    <div className="space-y-4">
                      {data?.admins?.map((a: any, idx: number) => (
                        <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl bg-off-white/50 border border-navy/5">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center font-black text-xs text-navy/40">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-navy text-sm">{a.name}</div>
                              <div className="text-[10px] font-bold text-navy/30 uppercase tracking-tighter">Staff Admin</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-xl font-black text-navy tracking-tight">{a.count}</div>
                            <div className="text-[9px] font-bold text-navy/40 uppercase">Dibuat</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ITEMS" && (
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-navy/5">
                        <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Detail Sesi</th>
                        <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Barang & Brand</th>
                        <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Proyek & Client</th>
                        <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Worker</th>
                        <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest text-right">Pemakaian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(data) && data.map((l: any) => (
                        <tr key={l.id} className="border-b border-navy/5 last:border-0 hover:bg-off-white/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="text-[11px] font-black text-navy">
                              {l.picklist?.deliveredAt ? new Date(l.picklist.deliveredAt).toLocaleDateString("id-ID") : "N/A"}
                            </div>
                            <div className="text-[9px] font-bold text-navy/30 uppercase truncate max-w-[80px]">{l.picklist?.code}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-navy">{l.item?.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="text-[10px] font-black text-gold uppercase tracking-widest">{l.item?.brand}</div>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${l.stockMode === "baru" ? "bg-navy/5 text-navy" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                                {l.stockMode === "baru" ? "✨ Baru" : "♻️ Bekas"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-navy">{l.picklist?.project?.namaProjek}</div>
                            <div className="text-[10px] font-medium text-navy/40">{l.picklist?.project?.namaKlien}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-semibold text-navy/60">{l.picklist?.assignee?.name}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-black text-navy text-base">{l.usedQty} <small className="text-[10px] opacity-40 uppercase">{l.item?.unit}</small></span>
                              {l.returnedQty > 0 && (
                                <span className="bg-success/10 text-success text-[9px] font-black px-2 py-0.5 rounded-full ring-1 ring-success/20">
                                  +{l.returnedQty} RETURNED
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards (Items) */}
                <div className="md:hidden p-4 space-y-4">
                  {Array.isArray(data) && data.map((l: any) => (
                    <div key={l.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{l.picklist?.deliveredAt ? new Date(l.picklist.deliveredAt).toLocaleDateString("id-ID") : "N/A"}</div>
                          <div className="font-bold text-navy text-sm">{l.item?.name}</div>
                          <div className="text-[10px] text-gold font-bold uppercase">{l.item?.brand}</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-navy text-lg">{l.usedQty} <small className="text-[9px] opacity-40">{l.item?.unit}</small></span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${l.stockMode === "baru" ? "bg-navy/5 text-navy" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                            {l.stockMode === "baru" ? "✨ Nuevo" : "♻️ Bekas"}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] font-bold text-navy">{l.picklist?.project?.namaProjek}</div>
                          <div className="text-[9px] text-gray-400">{l.picklist?.project?.namaKlien}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-semibold text-gray-400">Worker:</span>
                          <span className="text-[10px] font-bold text-navy bg-navy/5 px-2 py-1 rounded-lg">{l.picklist?.assignee?.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {Array.isArray(data) && data.length === 0 && (
                    <div className="py-10 text-center text-gray-400 text-xs font-bold italic">Tidak ada data.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "SPENDING" && (
              <div className="space-y-12">
                <section>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-3 flex-1">
                      <h2 className="text-2xl font-black text-navy tracking-tight">Supplier Benchmarking</h2>
                      <div className="h-px flex-1 bg-navy/5 hidden md:block" />
                    </div>

                    {/* Search Field */}
                    <div className="relative group w-full md:w-auto md:min-w-[300px]">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <span className="text-lg grayscale group-focus-within:grayscale-0 transition-all">🔍</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Cari item benchmarking..."
                        className="w-full h-11 pl-12 pr-10 bg-white border border-gray-200 rounded-xl text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                        value={benchmarkSearch}
                        onChange={(e) => setBenchmarkSearch(e.target.value)}
                      />
                      {benchmarkSearch && (
                        <button
                          onClick={() => setBenchmarkSearch("")}
                          className="absolute inset-y-0 right-3 flex items-center px-1 text-gray-300 hover:text-navy transition-colors font-bold text-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <span className="bg-gold text-navy text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] self-start md:self-center hidden md:inline-block">Price Leader</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.recommendations?.filter((r: any) =>
                      r.item.toLowerCase().includes(benchmarkSearch.toLowerCase()) ||
                      r.brand.toLowerCase().includes(benchmarkSearch.toLowerCase())
                    ).map((r: any, i: number) => (
                      <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col hover:border-gold/50 transition-colors">
                        <div className="bg-white h-full flex flex-col">
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                              🏷️
                            </div>
                            <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest border border-navy/5 px-2 py-1 rounded-lg italic">Verified Cost</span>
                          </div>

                          <div className="flex-1 mb-8">
                            <h4 className="text-xl font-black text-navy mb-1 tracking-tight">{r.item}</h4>
                            <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mb-4">{r.brand}</p>

                            <div className="inline-flex flex-col">
                              <span className="text-[9px] font-black text-navy/40 uppercase tracking-widest mb-1">Harga Termurah</span>
                              <span className="text-2xl font-black text-gold-deep tracking-tighter">Rp {r.cheapest.price.toLocaleString()}</span>
                            </div>

                            <div className="mt-4 flex items-center gap-2 bg-off-white p-3 rounded-xl ring-1 ring-inset ring-navy/5">
                              <div className="w-2 h-2 rounded-full bg-success" />
                              <span className="text-xs font-bold text-navy/60">{r.cheapest.supplier?.namaToko}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <a
                              href={`https://wa.me/${r.cheapest.supplier?.noTelp?.replace(/\D/g, '')}`}
                              target="_blank"
                              className="h-11 bg-[#25d366] text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:brightness-105 transition-all shadow-lg shadow-green-500/20"
                            >
                              Message WA
                            </a>
                            <button className="h-11 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy-light transition-all">
                              Cek Katalog
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(data?.recommendations?.length === 0 || (benchmarkSearch && data?.recommendations?.filter((r: any) =>
                      r.item.toLowerCase().includes(benchmarkSearch.toLowerCase()) ||
                      r.brand.toLowerCase().includes(benchmarkSearch.toLowerCase())
                    ).length === 0)) && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-navy/5 rounded-[40px] text-navy/20 font-black uppercase tracking-widest text-xs">
                          {benchmarkSearch ? "Item Tidak Ditemukan" : "Data Benchmarking Terbatas"}
                        </div>
                      )}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-xl font-black text-navy tracking-tight">Transaksional</h2>
                    <div className="h-px flex-1 bg-navy/5" />
                  </div>

                  <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    {/* Desktop Table (Transactions) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-navy/5">
                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Tanggal</th>
                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Produk</th>
                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Vendor</th>
                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Qty</th>
                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest text-right">Total Biaya</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.batches?.map((b: any) => (
                            <tr key={b.id} className="border-b border-navy/5 last:border-0 hover:bg-off-white/50 transition-colors">
                              <td className="px-6 py-5">
                                <div className="font-bold text-navy">{new Date(b.date).toLocaleDateString("id-ID")}</div>
                                <div className="text-[10px] font-medium text-navy/30 italic">Penerimaan Sesuai</div>
                              </td>
                              <td className="px-6 py-5 font-bold text-navy">{b.item.name}</td>
                              <td className="px-6 py-5">
                                <span className="text-[11px] font-black text-navy/60 uppercase tracking-widest px-3 py-1 bg-navy/5 rounded-full">
                                  {b.supplier?.namaToko}
                                </span>
                              </td>
                              <td className="px-6 py-5 font-black text-navy">{Number(b.qtyInBase)} <span className="opacity-30 text-[10px]">UNIT</span></td>
                              <td className="px-6 py-5 text-right font-black text-base tracking-tighter text-navy flex flex-col">
                                <span>Rp {b.total.toLocaleString()}</span>
                                <span className="text-[9px] font-bold text-navy/30 uppercase tracking-tighter">@Rp {b.unitCost.toLocaleString()}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards (Transactions) */}
                    <div className="md:hidden p-4 space-y-4">
                      {data?.batches?.map((b: any) => (
                        <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{new Date(b.date).toLocaleDateString("id-ID")}</div>
                            <div className="text-[9px] text-gray-400 italic">Received</div>
                          </div>
                          <div>
                            <div className="font-bold text-navy text-sm">{b.item.name}</div>
                            <span className="text-[10px] font-bold text-navy/60 uppercase bg-navy/5 px-2 py-0.5 rounded-full mt-1 inline-block">{b.supplier?.namaToko}</span>
                          </div>
                          <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-end">
                            <div>
                              <div className="text-[9px] text-gray-400 uppercase tracking-wider">Qty</div>
                              <div className="font-black text-navy">{Number(b.qtyInBase)} Unit</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-gray-400 uppercase tracking-wider">Total</div>
                              <div className="font-black text-navy text-base">Rp {b.total.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-navy/5 py-12 px-6 flex flex-col items-center gap-3">
        <div className="text-[10px] font-black text-navy/20 uppercase tracking-[0.4em]">Business Intelligence Center</div>
        <div className="text-[11px] font-black text-gold/60 uppercase tracking-widest">Apix Interior © 2026</div>
      </footer>
    </div>
  );
}
