"use client";

import React from "react";
import { useRouter } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  missing: "Employee ID dan password wajib diisi.",
  unauthorized: "Employee ID atau password salah.",
  rate_limit: "Terlalu banyak percobaan. Coba lagi beberapa menit.",
  wrong_portal: "Anda tidak terdaftar sebagai Worker. Silakan login di Portal Admin.",
};

export default function WorkerLoginPage({ searchParams }: PageProps) {
  const params = React.use(searchParams);
  const errorKey = params?.error ?? "";
  const error = errorMessages[errorKey];
  const [showPin, setShowPin] = React.useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0b1b3a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          {/* Icon removed as requested */}
          <h1 className="text-2xl font-black text-navy tracking-tight mb-1">Portal Worker</h1>
          <p className="text-navy/30 font-bold uppercase text-[9px] tracking-[0.3em]">Project Fulfillment System</p>
        </div>

        <div className="bg-gold rounded-xl shadow-xl border border-gold-deep overflow-hidden relative z-10">
          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-white/20 border border-white/30 p-3 rounded-2xl flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <p className="text-[11px] font-bold text-navy leading-tight">{error}</p>
              </div>
            )}

            {errorKey === "wrong_portal" && (
              <a
                href="/login"
                className="block w-full text-center py-3 bg-navy text-white text-[10px] font-black rounded-xl shadow-lg active:scale-95 transition-all"
              >
                PERGI KE HALAMAN ADMIN →
              </a>
            )}

            <form method="post" action="/api/auth/login-worker" className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest ml-1">Employee ID</label>
                <input
                  name="employeeId"
                  required
                  placeholder="ID Karyawan"
                  className="w-full h-12 px-4 bg-white border border-white/40 rounded-xl font-black text-navy placeholder:text-navy/30 focus:ring-2 focus:ring-navy focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest ml-1">Access PIN</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPin ? "text" : "password"}
                    required
                    placeholder="••••"
                    className="w-full h-12 px-4 bg-white border border-white/40 rounded-xl font-black text-navy placeholder:text-navy/30 focus:ring-2 focus:ring-navy focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute inset-y-0 right-4 flex items-center text-[9px] font-black text-navy/40 hover:text-navy transition-colors"
                  >
                    {showPin ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full !h-14 shadow-xl active:scale-95 mt-2"
              >
                MULAI BEKERJA
              </button>
            </form>

            <div className="pt-4 text-center">
              <a
                href="https://wa.me/6285175020319?text=Lupa%20ID%20atau%20PIN%20login%20worker"
                className="text-[10px] font-black text-navy/30 hover:text-navy transition-colors underline decoration-navy/10 underline-offset-4"
              >
                LUPA ID / PIN? CHAT ADMIN
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4 text-[9px] font-bold text-navy/20 uppercase tracking-widest">
            <span>Security Active</span>
            <span>•</span>
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </main>
  );
}
