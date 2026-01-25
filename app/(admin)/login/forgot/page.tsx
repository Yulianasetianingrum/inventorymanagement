"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [employeeId, setEmployeeId] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [waLink, setWaLink] = useState("");

    async function handleRequest(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId })
            });
            const data = await res.json();
            if (res.ok) {
                setWaLink(data.waLink);
                setStep(2);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Error sistem.");
        } finally {
            setLoading(false);
        }
    }

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId, code, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Sandi berhasil diubah! Silakan login.");
                router.push("/login");
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Error sistem.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-off-white p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md relative z-10">
                <div className="premium-card p-1 shadow-2xl">
                    <div className="bg-white p-8 rounded-[23px]">
                        <div className="text-center mb-10">
                            <h1 className="text-2xl font-black text-navy tracking-tight mb-2">Reset Password</h1>
                            <p className="text-xs font-bold text-navy/40 uppercase tracking-widest">Langkah Pemulihan Akun</p>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleRequest} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-1">Employee ID</label>
                                    <input
                                        placeholder="CONTOH: OWN-001"
                                        value={employeeId}
                                        onChange={e => setEmployeeId(e.target.value)}
                                        required
                                        className="w-full h-12 px-4 bg-navy/5 border border-navy/10 rounded-xl font-black text-navy focus:ring-2 focus:ring-gold focus:outline-none transition-all"
                                    />
                                </div>
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="btn-primary w-full !h-14 shadow-xl active:scale-95"
                                >
                                    {loading ? "MEMPROSES..." : "MINTA KODE VERIFIKASI"}
                                </button>
                                <div className="text-center pt-2">
                                    <Link href="/login" className="text-[11px] font-black text-navy/30 hover:text-navy uppercase tracking-widest transition-colors">
                                        ← Kembali ke Login
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleReset} className="space-y-6">
                                <div className="bg-success/5 border border-success/10 p-4 rounded-2xl space-y-3">
                                    <p className="text-[10px] font-black text-success uppercase tracking-widest leading-relaxed">
                                        Permintaan diterima. Silakan konfirmasi ke Admin via WhatsApp untuk mendapatkan kode.
                                    </p>
                                    <a
                                        href={waLink}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 w-full h-10 bg-[#25d366] text-white text-[10px] font-black rounded-lg shadow-lg active:scale-95 transition-all"
                                    >
                                        <span>💬</span>
                                        KIRIM KE WHATSAPP ADMIN
                                    </a>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-1">Kode Verifikasi (6 Digit)</label>
                                        <input
                                            placeholder="123456"
                                            value={code}
                                            onChange={e => setCode(e.target.value)}
                                            required
                                            className="w-full h-12 px-4 bg-navy/5 border border-navy/10 rounded-xl font-black text-navy text-center tracking-[0.5em] focus:ring-2 focus:ring-gold focus:outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            className="w-full h-12 px-4 bg-navy/5 border border-navy/10 rounded-xl font-black text-navy focus:ring-2 focus:ring-gold focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="btn-gold w-full !h-14 shadow-xl active:scale-95"
                                >
                                    {loading ? "MEMPROSES..." : "GANTI KATA SANDI"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-[10px] font-black text-navy/30 hover:text-navy uppercase tracking-widest transition-colors"
                                >
                                    Ganti ID? Hubungi Admin
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
