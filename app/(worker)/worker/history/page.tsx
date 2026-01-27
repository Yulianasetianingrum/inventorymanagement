"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WorkerHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  useEffect(() => {
    fetch("/api/worker/history")
      .then(res => res.json())
      .then(json => {
        setHistory(json.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "SCAN": return { icon: "📦", color: "bg-emerald-500", label: "Self-Scan", shadow: "shadow-emerald-200" };
      case "RETURN": return { icon: "♻️", color: "bg-amber-500", label: "Retur Sisa", shadow: "shadow-amber-200" };
      default: return { icon: "📋", color: "bg-purple-500", label: "Manifest", shadow: "shadow-purple-200" };
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header */}
      <header className="bg-navy pt-8 pb-12 px-6 rounded-b-[40px] shadow-2xl shadow-navy/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-1">Activity Log</div>
            <h1 className="text-2xl font-black text-white leading-tight">Riwayat Kerja</h1>
          </div>
          <Link href="/worker/home" className="text-white/60 hover:text-white bg-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
            Tutup
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 -mt-6 relative z-20 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-navy/10 border-t-navy rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white p-12 rounded-[24px] shadow-lg border border-slate-100 text-center flex flex-col items-center justify-center">
            <div className="text-5xl mb-4 grayscale opacity-20">📜</div>
            <p className="text-navy font-bold">Belum ada aktivitas tercatat.</p>
            <p className="text-slate-400 text-xs mt-1">Mulai ambil barang atau selesaikan tugas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((act) => {
              const style = getTypeStyle(act.type);
              return (
                <div key={act.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 relative group active:scale-[0.98] transition-transform">
                  <div className={`absolute top-5 left-0 w-1.5 h-8 ${style.color} rounded-r-full`}></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${style.color} text-white flex items-center justify-center rounded-xl shadow-lg ${style.shadow} text-xl`}>
                        {style.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.code}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase ${style.color}`}>{style.label}</span>
                        </div>
                        <h3 className="font-bold text-navy text-base leading-tight">{act.title}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-navy/40 uppercase tracking-wider">{act.status}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1">
                        {new Date(act.timestamp).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-500 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                    <div className="flex-1 overflow-hidden">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Project / Tujuan</span>
                      <div className="text-navy font-bold truncate">{act.projectName}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Kuantitas</span>
                      <div className="text-navy font-black">{act.itemCount} <span className="text-slate-400 font-bold">Items</span></div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center px-1">
                    <div className="text-[10px] text-slate-400 font-medium italic">
                      {new Date(act.timestamp).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    {act.type === "RETURN" ? (
                      <button
                        onClick={() => setSelectedActivity(act)}
                        className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline"
                      >
                        Lihat Detail →
                      </button>
                    ) : (
                      <Link href={`/worker/picklists/${act.id}`} className="text-[10px] font-black text-navy uppercase tracking-widest hover:underline">
                        Lihat Detail →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal for Returns */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setSelectedActivity(null)} />
          <div className="bg-white rounded-[32px] w-full max-w-sm max-h-[80vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Detail Return</div>
                  <h3 className="text-xl font-black text-navy">{selectedActivity.code}</h3>
                  <p className="text-xs text-slate-400 font-medium">{new Date(selectedActivity.timestamp).toLocaleString("id-ID")}</p>
                </div>
                <button onClick={() => setSelectedActivity(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold hover:bg-red-50 hover:text-red-500 transition-colors">×</button>
              </div>

              {/* Items List */}
              <div className="space-y-3 mb-6">
                <h4 className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Barang Dikembalikan</h4>
                {selectedActivity.items && selectedActivity.items.length > 0 ? (
                  selectedActivity.items.map((it: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-navy truncate flex-1 mr-2">{it.name || "Unknown Item"}</span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">{it.qty}x</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Data item tidak tersedia.</p>
                )}
              </div>

              {/* Evidence Images */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Bukti Foto</h4>
                {(selectedActivity.meta?.imageUrls && selectedActivity.meta.imageUrls.length > 0) ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedActivity.meta.imageUrls.map((url: string, idx: number) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={url} alt={`Bukti ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Tidak ada foto.</p>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-[32px]">
              <button onClick={() => setSelectedActivity(null)} className="w-full py-3 bg-navy text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-navy-light transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
