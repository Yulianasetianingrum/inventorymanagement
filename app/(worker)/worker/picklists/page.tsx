"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function WorkerPicklistsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/worker/picklists")
      .then(res => res.json())
      .then(json => {
        setTasks(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Mobile Top Header */}
      <header className="bg-navy pt-8 pb-10 px-6 rounded-b-[40px] shadow-2xl shadow-navy/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Tugas Saya</h1>
            <div className="w-10 h-10 bg-gold rounded-2xl flex items-center justify-center text-navy font-black shadow-lg">
              {tasks.length}
            </div>
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Operational Manifest</p>
        </div>
      </header>

      <main className="px-5 -mt-6 relative z-20">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-navy/10 border-t-navy rounded-full animate-spin" />
            <span className="mt-4 text-[10px] font-black text-navy/20 uppercase tracking-widest">Sinkronisasi Manifest...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(t => (
              <Link key={t.id} href={`/worker/picklists/${t.id}`} className="block transition-transform active:scale-[0.98]">
                <div className="premium-card p-1">
                  <div className="bg-white p-5 rounded-[19px] flex items-center gap-4 relative overflow-hidden">
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${getStatusColorClass(t.status)}`} />

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-navy/30 uppercase tracking-tighter">{t.code}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ring-1 ring-inset ${getStatusBadgeClass(t.status)}`}>
                          {t.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-navy leading-tight tracking-tight mb-1">
                        {t.title || t.project?.namaProjek}
                      </h3>
                      <div className="text-xs font-bold text-navy/50 mb-3">{t.project?.namaKlien}</div>

                      <div className="flex items-center justify-between pt-3 border-t border-navy/5">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-navy/30 uppercase">Mode</span>
                            <span className={`text-[10px] font-black uppercase ${t.mode === 'EXTERNAL' ? 'text-gold-deep' : 'text-navy/60'}`}>
                              {t.mode}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-navy/30 uppercase">Items</span>
                            <span className="text-[10px] font-black text-navy">{t._count?.lines || 0}</span>
                          </div>
                        </div>
                        <div className="text-navy/20">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {tasks.length === 0 && (
              <div className="py-32 text-center text-navy/20">
                <div className="text-5xl mb-4">✨</div>
                <div className="text-xs font-black uppercase tracking-widest">Semua Tugas Selesai</div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Sticky Logout/Return Button */}
      <nav className="fixed bottom-0 left-0 right-0 p-6 glass border-t border-white/20 backdrop-blur-2xl z-50">
        <Link href="/worker/home" className="btn-primary w-full shadow-2xl shadow-navy/40">
          Beranda Dashboard
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
