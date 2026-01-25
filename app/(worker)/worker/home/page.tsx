"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PicklistCard = {
  id: string;
  code: string;
  title: string;
  status: string;
  neededAt?: string;
  progressDone: number;
  progressTotal: number;
  shortage: number;
  project?: {
    namaProjek: string;
    namaKlien: string;
  };
};

export default function WorkerHome() {
  const [me, setMe] = useState<{ employeeId: string; name: string } | null>(null);
  const [active, setActive] = useState<PicklistCard[]>([]);
  const [handoverNeeded, setHandoverNeeded] = useState<PicklistCard[]>([]);
  const [todoCount, setTodoCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await fetch("/api/worker/me");
        if (userRes.ok) setMe((await userRes.json()).data);
        const res = await fetch("/api/worker/picklists?tab=active");
        if (res.ok) {
          const data = (await res.json()).data || [];

          // Filter for tasks that are strictly active (READY or PICKING)
          const activeTasks = data.filter((d: PicklistCard) =>
            d.status === "READY" || d.status === "PICKING"
          );
          setActive(activeTasks.slice(0, 3));
          setTodoCount(activeTasks.length);

          // Handover needed (PICKED)
          setHandoverNeeded(data.filter((d: PicklistCard) => d.status === "PICKED"));
        }
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/worker/login";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Navbar / Header */}
      <header className="bg-navy pt-8 pb-12 px-6 rounded-b-[40px] shadow-2xl shadow-navy/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="text-gold text-xs font-bold uppercase tracking-widest mb-1">Selamat Bekerja</div>
            <h1 className="text-2xl font-black text-white leading-tight">
              {me ? me.name : "Loading..."}
            </h1>
            <div className="inline-flex items-center gap-2 mt-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono text-white/80">{me ? me.employeeId : "..."}</span>
            </div>
          </div>

          <Button
            onClick={logout}
            style={{ background: "transparent", border: "none" }}
            className="text-white/60 hover:text-white hover:bg-white/10 transition-colors -mr-2 p-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>
      </header>

      <main className="px-5 -mt-6 relative z-20 space-y-6">

        {/* Active Tasks Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-navy font-black text-lg">Tugas Aktif</h2>
            {active.length > 0 && <span className="bg-navy/5 text-navy/60 text-xs font-bold px-2 py-0.5 rounded-md">{active.length} Tugas</span>}
          </div>

          <div className="space-y-3">
            {active.length === 0 ? (
              <div className="bg-white p-8 rounded-[20px] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[160px]">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect width="6" height="4" x="9" y="3" rx="2" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                </div>
                <p className="text-navy/60 text-sm font-bold">Tidak ada tugas aktif.</p>
                <p className="text-slate-400 text-xs mt-1">Sistem standby menunggu order masuk.</p>
              </div>
            ) : (
              active.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-[20px] shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>

                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{p.code}</span>
                      <h3 className="font-bold text-navy text-lg leading-tight">{p.title}</h3>
                      {p.project && <div className="text-xs text-slate-500 font-medium mt-0.5">{p.project.namaKlien}</div>}
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${p.status === 'READY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                      <span>Progress</span>
                      <span>{Math.round((p.progressDone / Math.max(1, p.progressTotal)) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-navy rounded-full transition-all duration-500"
                        style={{ width: `${(p.progressDone / Math.max(1, p.progressTotal)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      as="a"
                      href={`/worker/picklists/${p.id}`}
                      className="w-full bg-navy hover:bg-navy/90 text-white font-bold rounded-xl h-10 shadow-lg shadow-navy/20 justify-center"
                    >
                      {p.status === "READY" ? "Mulai Ambil" : "Lanjutkan"}
                    </Button>
                  </div>
                </div>
              ))
            )}
            {active.length > 0 && (
              <Link href="/worker/picklists" className="block text-center text-xs font-bold text-slate-400 hover:text-navy py-2">
                Lihat Semua Tugas &rarr;
              </Link>
            )}
          </div>
        </section>

        {/* Handover Needed Section */}
        {handoverNeeded.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-navy font-black text-lg">Menunggu Serah Terima</h2>
            </div>
            <div className="space-y-3">
              {handoverNeeded.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-[20px] shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{p.code}</span>
                    <div className="font-bold text-navy">{p.title}</div>
                  </div>
                  <Button
                    as="a"
                    href={`/worker/handover/${p.id}`}
                    style={{ background: "#9333ea" }}
                    className="hover:bg-purple-700 text-white rounded-xl font-bold"
                  >
                    Serah Terima
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions Grid */}
        <section>
          <h2 className="text-navy font-black text-lg mb-4 px-1">Menu Cepat</h2>
          <div className="grid grid-cols-2 gap-4">

            {/* Picklists Button */}
            <Link href="/worker/picklists" className="group relative bg-white p-5 rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95">
              {todoCount > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg shadow-red-500/30">
                  {todoCount}
                </div>
              )}
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect width="6" height="4" x="9" y="3" rx="2" /><path d="m9 14 2 2 4-4" /></svg>
              </div>
              <span className="font-bold text-navy text-sm">Picklists</span>
            </Link>

            {/* Scan Item Button */}
            <Link href="/worker/scan" className="group bg-white p-5 rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect width="10" height="6" x="7" y="9" rx="1" /></svg>
              </div>
              <span className="font-bold text-navy text-sm">Scan Item</span>
            </Link>

            {/* Retur Sisa Button */}
            <Link href="/worker/return" className="group bg-white p-5 rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 14 2 2 4-4" /><path d="M5 20v-1a7 7 0 0 1 7-7v0" /><path d="M4 14l4 4 4-4" /></svg>
              </div>
              <span className="font-bold text-navy text-sm">Retur Sisa</span>
            </Link>

            {/* Riwayat Button */}
            <Link href="/worker/history" className="group bg-white p-5 rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>
              </div>
              <span className="font-bold text-navy text-sm">Riwayat</span>
            </Link>

          </div>
        </section>

      </main>
    </div>
  );
}
