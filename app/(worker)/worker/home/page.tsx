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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, listRes, unreadRes] = await Promise.all([
          fetch("/api/worker/me", { cache: "no-store" }),
          fetch("/api/worker/picklists?tab=active", { cache: "no-store" }),
          fetch("/api/worker/messages/unread", { cache: "no-store" })
        ]);

        if (userRes.status === 401) {
          window.location.href = "/worker/login";
          return;
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setMe(userData.data);
        }

        if (listRes.ok) {
          const listData = await listRes.json();
          const data = listData.data || [];

          // Server now provides progress and active items
          const activeTasks = data.filter((d: PicklistCard) =>
            d.status === "READY" || d.status === "PICKING"
          );
          setActive(activeTasks.slice(0, 3));
          setTodoCount(activeTasks.length);

          // Handover needed (PICKED)
          setHandoverNeeded(data.filter((d: PicklistCard) => d.status === "PICKED"));
        }

        if (unreadRes.ok) {
          const unreadData = await unreadRes.json();
          setUnreadCount(unreadData.count || 0);
        }

      } catch (err) {
        console.error("Home Load Error:", err);
      }
    };
    load();
  }, []);

  const formatTargetDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/worker/login";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Navbar / Header */}
      <header className="bg-navy pt-6 md:pt-10 pb-12 md:pb-16 px-4 md:px-8 rounded-b-[40px] shadow-2xl shadow-navy/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-7xl mx-auto flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-4">
            <div className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Selamat Bekerja</div>
            <h1 className="text-xl md:text-3xl font-black text-white leading-tight truncate">
              {me ? me.name : "Loading..."}
            </h1>
            <div className="inline-flex items-center gap-2 mt-2 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] md:text-xs font-mono text-white/80">{me ? me.employeeId : "..."}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Notification Icon */}
            <Link href="/worker/chat" className="relative p-2.5 text-white hover:scale-110 transition-all duration-300 bg-white/5 rounded-xl border border-white/5">
              <svg width="24" height="24" className="md:w-8 md:h-8" viewBox="0 0 24 24" fill={unreadCount > 0 ? "white" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black h-5 w-5 md:h-6 md:w-6 flex items-center justify-center rounded-full border-2 border-navy animate-bounce shadow-lg">
                  {unreadCount}
                </span>
              )}
            </Link>

            <button
              onClick={logout}
              className="text-white/60 hover:text-white p-2.5 bg-white/5 rounded-xl border border-white/5 transition-all flex items-center justify-center"
              aria-label="Logout"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {unreadCount > 0 && (
        <div className="px-4 md:px-8 -mt-8 relative z-30 mb-2 max-w-7xl mx-auto">
          <Link href="/worker/chat" className="block bg-red-600 text-white p-4 rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-xl">📩</span>
              <div className="flex flex-col">
                <span className="font-black text-sm uppercase tracking-wider">Pesan Baru!</span>
                <span className="text-xs opacity-90">{unreadCount} pesan belum dibaca</span>
              </div>
            </div>
            <span className="bg-white/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Buka &rarr;</span>
          </Link>
        </div>
      )}

      <main className={`px-4 md:px-8 ${unreadCount > 0 ? 'mt-4' : '-mt-6'} relative z-20 space-y-8 max-w-7xl mx-auto`}>

        {/* Active Tasks Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-navy font-black text-lg md:text-xl lg:text-2xl">Tugas Aktif</h2>
            {active.length > 0 && <span className="bg-navy/5 text-navy/60 text-xs font-bold px-3 py-1 rounded-full">{todoCount} Total</span>}
          </div>

          {active.length === 0 ? (
            <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-slate-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect width="6" height="4" x="9" y="3" rx="2" />
                  <path d="m9 14 2 2 4-4" />
                </svg>
              </div>
              <p className="text-navy font-bold">Semua Tugas Selesai</p>
              <p className="text-slate-400 text-sm mt-1 max-w-[200px]">Sistem standby menunggu order baru dari Admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {active.map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-[28px] shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gold"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">{p.code}</span>
                      <h3 className="font-bold text-navy text-lg leading-tight truncate">{p.title}</h3>
                      {p.project && <div className="text-xs text-slate-500 font-medium mt-1 truncate">{p.project.namaKlien}</div>}
                      <div className="text-[10px] font-black text-amber-600 mt-2 uppercase tracking-widest">
                        Target Projek Selesai: {formatTargetDate(p.neededAt)}
                      </div>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${p.status === 'READY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      <span>Penyelesaian</span>
                      <span className="text-navy">{Math.round((p.progressDone / Math.max(1, p.progressTotal)) * 100)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-navy rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(p.progressDone / Math.max(1, p.progressTotal)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <Link
                    href={`/worker/picklists/${p.id}`}
                    className="w-full bg-navy hover:bg-navy/90 text-white font-black rounded-2xl h-14 shadow-lg shadow-navy/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-widest"
                  >
                    {p.status === "READY" ? "Mulai Ambil" : "Lanjutkan"}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {active.length > 0 && (
            <Link href="/worker/picklists" className="block text-center text-xs font-black text-slate-400 hover:text-navy py-6 uppercase tracking-widest transition-colors">
              Lihat {todoCount} Daftar Picklist &rarr;
            </Link>
          )}
        </section>

        {/* Handover Needed Section */}
        {handoverNeeded.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-navy font-black text-lg md:text-xl">Menunggu Serah Terima</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {handoverNeeded.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-between group">
                  <div className="min-w-0 mr-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{p.code}</span>
                    <div className="font-bold text-navy truncate">{p.title}</div>
                  </div>
                  <Link
                    href={`/worker/handover/${p.id}`}
                    className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-5 h-12 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
                  >
                    Proses
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions Grid */}
        <section>
          <h2 className="text-navy font-black text-lg md:text-xl mb-4 px-1">Menu Navigasi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

            {/* Picklists Button */}
            <Link href="/worker/picklists" className="group relative bg-white p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center gap-4 hover:shadow-2xl transition-all active:scale-95 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-[40px] -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
              {todoCount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg shadow-red-500/30 z-10">
                  {todoCount}
                </div>
              )}
              <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect width="6" height="4" x="9" y="3" rx="2" /><path d="m9 14 2 2 4-4" /></svg>
              </div>
              <span className="font-black text-navy text-sm md:text-base uppercase tracking-wider">Picklists</span>
            </Link>

            {/* Scan Item Button */}
            <Link href="/worker/scan" className="group relative bg-white p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center gap-4 hover:shadow-2xl transition-all active:scale-95 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/50 rounded-bl-[40px] -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
              <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect width="10" height="6" x="7" y="9" rx="1" /></svg>
              </div>
              <span className="font-black text-navy text-sm md:text-base uppercase tracking-wider text-center">Scan Item</span>
            </Link>

            {/* Retur Sisa Button */}
            <Link href="/worker/return" className="group relative bg-white p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center gap-4 hover:shadow-2xl transition-all active:scale-95 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50/50 rounded-bl-[40px] -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
              <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 14 2 2 4-4" /><path d="M5 20v-1a7 7 0 0 1 7-7v0" /><path d="M4 14l4 4 4-4" /></svg>
              </div>
              <span className="font-black text-navy text-sm md:text-base uppercase tracking-wider text-center">Retur Sisa</span>
            </Link>

            {/* Riwayat Button */}
            <Link href="/worker/history" className="group relative bg-white p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center gap-4 hover:shadow-2xl transition-all active:scale-95 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50/50 rounded-bl-[40px] -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
              <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>
              </div>
              <span className="font-black text-navy text-sm md:text-base uppercase tracking-wider">Riwayat</span>
            </Link>

            {/* Pesan Button - HIGHLIGHTED IF UNREAD */}
            <Link href="/worker/chat" className={`group relative col-span-2 md:col-span-4 p-6 md:p-8 rounded-[32px] shadow-xl transition-all active:scale-95 flex items-center justify-between gap-4 overflow-hidden ${unreadCount > 0
              ? 'bg-gradient-to-r from-red-600 to-red-500 border-none text-white'
              : 'bg-white border border-slate-50 shadow-slate-200/50 hover:shadow-2xl'
              }`}>
              <div className="flex items-center gap-4 md:gap-8 min-w-0">
                <div className={`shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-3xl flex items-center justify-center transition-all duration-300 ${unreadCount > 0
                  ? 'bg-white/20 text-white animate-pulse'
                  : 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white lg:rotate-3'
                  }`}>
                  <svg width="32" height="32" className="md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <div className="min-w-0">
                  <h3 className={`font-black text-lg md:text-2xl leading-none uppercase tracking-wider ${unreadCount > 0 ? 'text-white' : 'text-navy'}`}>Pesan & Inbox</h3>
                  <p className={`text-xs md:text-sm font-bold mt-2 uppercase tracking-widest ${unreadCount > 0 ? 'text-white/80' : 'text-slate-400'}`}>
                    {unreadCount > 0 ? `⚠️ ${unreadCount} Pesan Baru Menunggu` : 'Konsultasi stok dengan Admin'}
                  </p>
                </div>
              </div>
              <div className={`shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${unreadCount > 0
                ? 'bg-white text-red-600 font-black text-xl shadow-lg'
                : 'bg-slate-50 text-slate-300'
                }`}>
                {unreadCount > 0 ? unreadCount : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>}
              </div>
            </Link>

          </div>
        </section>

      </main>
    </div>
  );
}
