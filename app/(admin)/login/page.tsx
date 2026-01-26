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
  inactive: "Maaf, silahkan berlibur terlebih dahulu.",
  wrong_portal: "Anda login di halaman yang salah. Gunakan halaman Worker.",
};

export default function AdminLoginPage({ searchParams }: PageProps) {
  const params = React.use(searchParams);
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [localError, setLocalError] = React.useState("");

  const errorKey = params?.error ?? "";
  const displayError = localError || errorMessages[errorKey];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setLocalError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/auth/login-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setLocalError(errorMessages[json.error] || json.error || "Gagal masuk.");
      }
    } catch (err) {
      setLocalError("Gangguan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative">
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0b1b3a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-navy tracking-tight mb-2">Portal Admin</h1>
          <p className="text-navy/40 font-bold uppercase text-[10px] tracking-[0.3em]">Operational & Inventory Control</p>
        </div>

        <div className="bg-navy rounded-xl shadow-xl border border-navy-light overflow-hidden relative z-10">
          <div className="p-8 space-y-6">
            {displayError && (
              <div className="bg-error/10 border border-error/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="text-xl">⚠️</span>
                <p className="text-xs font-bold text-error leading-tight">{displayError}</p>
              </div>
            )}

            <a
              href="/worker/login"
              className="block w-full text-center py-3 bg-white/10 text-white text-xs font-black rounded-xl border border-white/10 shadow-lg active:scale-95 transition-all hover:bg-white/20"
            >
              MASUK KE PORTAL WORKER →
            </a>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Employee ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-30 group-focus-within:opacity-100 transition-opacity text-white">👤</div>
                  <input
                    name="employeeId"
                    required
                    placeholder="Contoh: OWN-001"
                    className="w-full h-14 pl-12 pr-4 bg-navy-light border border-navy-deep rounded-2xl font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-gold focus:outline-none transition-all disabled:opacity-50"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Password Access</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-30 group-focus-within:opacity-100 transition-opacity text-white">🔑</div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-12 bg-navy-light border border-navy-deep rounded-2xl font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-gold focus:outline-none transition-all disabled:opacity-50"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-4 flex items-center text-[10px] font-black text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full !h-14 shadow-2xl shadow-gold/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
                    AUTHENTICATING...
                  </>
                ) : (
                  "SIGN IN SECURELY"
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-navy/5">
              <a
                href="https://wa.me/6285175020319?text=Lupa%20ID%20atau%20password%20login%20admin"
                className="flex items-center justify-center gap-2 w-full h-12 bg-off-white hover:bg-gold/5 text-[10px] font-black text-navy/40 hover:text-navy border border-navy/5 rounded-xl transition-all"
              >
                <span>🔑</span>
                LUPA KREDENSIAL? HUBUNGI ADMIN
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-1000 relative z-10">
          {[
            { id: 1, title: "Inventory", desc: "Master item control" },
            { id: 2, title: "Business BI", desc: "Data-driven spend audit" },
            { id: 3, title: "Operations", desc: "Monitor worker efficiency" },
            { id: 4, title: "Projects", desc: "Track material allocation" },
            { id: 5, title: "Sourcing", desc: "Supplier management" },
            { id: 6, title: "Accounts", desc: "Secure credential control" }
          ].map(feature => (
            <div key={feature.id} className="bg-white border border-gray-200 p-3 rounded-lg flex flex-col items-center text-center hover:border-gold/50 transition-colors">
              <h3 className="text-[10px] font-bold text-navy uppercase tracking-wider mb-1">{feature.title}</h3>
              <p className="text-[9px] font-medium text-gray-400 leading-tight">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-navy/20 text-[9px] font-bold uppercase tracking-[0.4em]">© 2024 Inventory OS — Premium Enterprise Solution</p>
        </div>
      </div>
    </main>
  );
}
