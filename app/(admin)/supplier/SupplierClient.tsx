"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./supplier.module.css";
import { Button } from "@/components/ui/button";

type SupplierEntry = {
  id: number;
  namaToko: string;
  keperluanItems: string;
  alamat: string;
  mapsUrl?: string | null;
  noTelp?: string | null;
};

type Props = {
  suppliers: SupplierEntry[];
  deleteSupplier: (formData: FormData) => Promise<void>;
};

const normalizeKeperluan = (raw: string) => {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
  } catch { }
  return String(raw || "").split(",").map((x) => x.trim()).filter(Boolean);
};

export function SupplierClient({ suppliers, deleteSupplier }: Props) {
  const [query, setQuery] = useState("");
  const [isMasked, setIsMasked] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) => {
      const keperluan = normalizeKeperluan(s.keperluanItems);
      const hay = `${s.namaToko || ""} ${s.alamat || ""} ${keperluan.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [suppliers, query]);

  const toggleMask = () => {
    if (isMasked) {
      setShowAuthModal(true);
      setAuthError(""); // Reset error on open
    } else {
      setIsMasked(true);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAuth(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setIsMasked(false);
        setShowAuthModal(false);
        setPassword("");
      } else {
        setAuthError("Password tidak valid. Akses ditolak.");
      }
    } catch {
      setAuthError("Terjadi kesalahan sistem. Coba lagi.");
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Search Input & Privacy Toggle */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            className="w-full h-14 bg-white border border-navy/5 rounded-2xl pl-12 pr-6 font-bold text-navy shadow-sm focus:border-gold outline-none transition-all text-sm md:text-base placeholder:text-gray-400"
            placeholder="Cari supplier atau kategori barang..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg md:text-xl opacity-30">🔍</span>
        </div>
        <button
          onClick={toggleMask}
          className={`h-14 w-14 flex items-center justify-center rounded-2xl border transition-all ${isMasked ? 'bg-navy text-gold border-navy' : 'bg-red-50 text-red-500 border-red-100'}`}
          title={isMasked ? "Tampilkan Data Sensitif" : "Sembunyikan Data"}
        >
          {isMasked ? "🔒" : "🔓"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center opacity-30">
          <div className="text-4xl mb-4">🏪</div>
          <div className="font-black text-xl uppercase tracking-widest text-navy">No Suppliers Found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((s) => {
            const items = normalizeKeperluan(s.keperluanItems);
            return (
              <div key={s.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <h3 className="text-lg md:text-xl font-black text-navy mb-3 leading-tight group-hover:text-gold-deep transition-colors">
                  {isMasked ? `${s.namaToko.slice(0, 3)}******` : s.namaToko}
                </h3>

                <div className="flex flex-wrap gap-2 mb-6">
                  {items.map((item, idx) => (
                    <span key={idx} className="bg-gold/10 text-gold-deep px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wide">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="space-y-4 mb-6 flex-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-1">Alamat</span>
                    <span className="text-xs md:text-sm font-bold text-navy/70 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 truncate">
                      {isMasked ? "Jl. ****** (Locked)" : (s.alamat || "Alamat tidak tersedia")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                  <a className={`flex-1 h-10 md:h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-navy text-[10px] md:text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-colors border border-slate-200 ${isMasked ? 'pointer-events-none opacity-50' : ''}`}
                    href={s.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.namaToko)}`}
                    target="_blank">
                    <span>🗺️</span> {isMasked ? "Locked" : "Maps"}
                  </a>
                  <a className={`flex-1 h-10 md:h-12 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-[10px] md:text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-colors border border-green-200 ${isMasked ? 'pointer-events-none opacity-50' : ''}`}
                    href={s.noTelp ? `https://wa.me/${s.noTelp.replace(/\D/g, '')}` : "#"}
                    target="_blank">
                    <span>💬</span> {isMasked ? "Locked" : "WA"}
                  </a>
                </div>

                <div className="flex gap-2 mt-2">
                  <Link href={{ pathname: "/supplier", query: { edit: String(s.id) } }} className="flex-1 h-10 md:h-12 rounded-xl bg-navy text-white hover:bg-navy-light text-[10px] md:text-xs font-black uppercase tracking-wide flex items-center justify-center transition-colors shadow-lg shadow-navy/10">
                    Edit
                  </Link>
                  <form action={deleteSupplier} className="w-12 md:w-14">
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="w-full h-10 md:h-12 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors border border-red-100">
                      <span className="text-lg">🗑️</span>
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleVerify} className="bg-white w-full max-w-sm p-8 rounded-[32px] shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-navy text-gold rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-navy/20">🔒</div>
              <h3 className="text-xl font-black text-navy">Security Check</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Masukkan Password Admin</p>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="text-lg">⚠️</div>
                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide leading-tight">{authError}</div>
              </div>
            )}

            <input
              type="password"
              className={`w-full h-14 px-4 bg-slate-50 border rounded-xl font-bold text-center text-navy mb-6 focus:ring-2 focus:ring-gold focus:outline-none transition-all ${authError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'}`}
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthError(""); }}
              autoFocus
            />

            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowAuthModal(false); setPassword(""); setAuthError(""); }} className="flex-1 h-12 rounded-xl font-bold text-navy/60 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={loadingAuth} className="flex-1 h-12 rounded-xl bg-navy text-white font-bold shadow-lg hover:bg-navy-light transition-all">
                {loadingAuth ? "Verifikasi..." : "Buka Gembok"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
