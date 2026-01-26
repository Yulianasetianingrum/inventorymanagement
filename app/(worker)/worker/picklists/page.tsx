"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function WorkerPicklistsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/worker/picklists")
      .then(res => {
        if (res.status === 401) {
          window.location.href = "/worker/login";
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then(json => {
        setTasks(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-12">
      {/* Responsive Header */}
      <header className="bg-navy pt-6 md:pt-10 pb-8 md:pb-12 px-4 md:px-8 rounded-b-[40px] shadow-2xl shadow-navy/20 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Operational Manifest</div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Tugas Saya</h1>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gold rounded-2xl flex items-center justify-center text-navy font-black shadow-lg shadow-gold/20 text-lg md:text-xl">
              {tasks.length}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 -mt-6 relative z-20 max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-navy/10 border-t-navy rounded-full animate-spin" />
            <span className="mt-4 text-[10px] md:text-xs font-black text-navy/20 uppercase tracking-widest">Sinkronisasi Manifest...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {tasks.map(t => (
              <Link key={t.id} href={`/worker/picklists/${t.id}`} className="block transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group">
                <div className="bg-white p-5 rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden h-full flex flex-col hover:shadow-xl hover:border-navy/10">
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${getStatusColorClass(t.status)}`} />

                  <div className="flex-1 pl-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.code}</span>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide ${getStatusBadgeClass(t.status)}`}>
                        {t.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-navy leading-snug mb-1 group-hover:text-gold-dark transition-colors line-clamp-2">
                      {t.title || t.project?.namaProjek}
                    </h3>
                    <div className="text-xs font-medium text-slate-500 mb-4 truncate">{t.project?.namaKlien}</div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mb-0.5">Mode</span>
                          <span className={`text-[10px] font-black uppercase ${t.mode === 'EXTERNAL' ? 'text-amber-600' : 'text-navy'}`}>
                            {t.mode}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mb-0.5">Progress</span>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-navy rounded-full" style={{ width: `${(t.progressDone / Math.max(1, t.progressTotal)) * 100}%` }}></div>
                            </div>
                            <span className="text-[9px] font-black text-navy">{t.progressDone}/{t.progressTotal}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-navy group-hover:text-white transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {tasks.length === 0 && (
              <div className="col-span-full py-32 text-center text-navy/20">
                <div className="text-5xl mb-4">✨</div>
                <div className="text-xs font-black uppercase tracking-widest">Semua Tugas Selesai</div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Sticky Logout/Return Button - Only visible on Mobile if needed, but here we keep full Nav for consistent UX */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-white/20 z-50 md:hidden">
        <Link href="/worker/home" className="w-full bg-navy text-white font-bold h-12 rounded-xl flex items-center justify-center shadow-lg shadow-navy/20 active:scale-95 transition-all">
          Kembali ke Dashboard
        </Link>
      </nav>
    </div>
  );
}

function getStatusColorClass(s: string) {
  if (s === "READY") return "bg-warning";
  if (s === "PICKING") return "bg-accent";
  if (s === "PICKED") return "bg-success";
  if (s === "DELIVERED") return "bg-navy";
  return "bg-navy/10";
}

function getStatusBadgeClass(s: string) {
  if (s === "READY") return "bg-warning/10 text-warning ring-warning/20";
  if (s === "PICKING") return "bg-accent/10 text-accent ring-accent/20";
  if (s === "PICKED") return "bg-success/10 text-success ring-success/20";
  if (s === "DELIVERED") return "bg-navy/10 text-navy ring-navy/20";
  return "bg-navy/5 text-navy/30 ring-navy/10";
}
