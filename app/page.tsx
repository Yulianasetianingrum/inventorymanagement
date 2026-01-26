import Link from "next/link";
import { Geist } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
});

const accessCards = [
  {
    variant: "admin" as const,
    title: "Akses Administrator",
    audience: "Panel kontrol untuk Owner, Purchasing, dan Kepala Gudang.",
    bullets: [
      "Manajemen Karyawan & Hak Akses",
      "Kontrol Stok Material & Rak",
      "Pembuatan & Penugasan Picklist",
      "Audit Performa & Supplier Benchmarking",
    ],
    buttonLabel: "PERGI KE HALAMAN ADMIN →",
    href: "/login",
  },
  {
    variant: "worker" as const,
    title: "Akses Worker",
    audience: "Antarmuka khusus pekerja gudang dan lapangan.",
    bullets: [
      "Pantau Daftar Tugas Real-time",
      "Navigasi Lokasi Rak (Rak01-Rak04)",
      "Validasi Scan Foto Pengambilan",
      "Proses Return & Update Stok Bekas",
    ],
    buttonLabel: "MASUK KE PORTAL WORKER →",
    href: "/worker/login",
  },
];

export default function HomePage() {
  return (
    <div className={`min-h-screen bg-[#f8fafc] text-[#0f172a] ${geistSans.className}`}>
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-10"
          style={{ background: 'radial-gradient(circle, var(--navy) 0%, transparent 70%)' }}
        />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-gold font-black text-xl shadow-lg">
              A
            </div>
            <div>
              <div className="font-black text-navy text-xl leading-none uppercase tracking-tighter">Apix Interior</div>
              <div className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Inventory Management</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-[10px] font-bold text-navy/40 uppercase tracking-widest border border-navy/10 px-3 py-1.5 rounded-full">
              Production Environment
            </span>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Hero Section */}
        <section className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-navy/5 border border-navy/10 text-navy text-xs font-bold uppercase tracking-wider">
            Sistem Inventory Terpadu v2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-navy mb-6 tracking-tight leading-[0.9]">
            Stok Rapi,<br />Produksi <span className="text-gold">Lancar.</span>
          </h1>
          <p className="text-lg text-navy/60 font-medium leading-relaxed">
            Optimasi alur kerja workshop dengan manajemen material yang presisi,
            validasi bukti digital, dan otomasi audit stok.
          </p>
        </section>

        {/* Access Selector Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {accessCards.map((card) => (
            <div
              key={card.title}
              className="premium-card p-1 flex flex-col group overflow-hidden"
              style={{ minHeight: '400px' }}
            >
              <div className={`flex-1 p-8 rounded-[19px] flex flex-col ${card.variant === 'admin' ? 'bg-navy text-white' : 'bg-white text-navy'}`}>
                <div className="mb-8">
                  <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 
                    ${card.variant === 'admin' ? 'bg-gold text-navy' : 'bg-navy text-gold'}`}>
                    {card.variant === 'admin' ? 'Management' : 'Operation'}
                  </div>
                  <h3 className="text-3xl font-black mb-2 tracking-tight">{card.title}</h3>
                  <p className={`text-sm font-medium ${card.variant === 'admin' ? 'text-white/60' : 'text-navy/50'}`}>
                    {card.audience}
                  </p>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {card.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${card.variant === 'admin' ? 'bg-gold' : 'bg-navy'}`} />
                      <span className="text-sm font-semibold opacity-90 leading-tight">{bullet}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={card.href}
                  className={card.variant === 'admin' ? 'btn-gold w-full text-center' : 'btn-primary w-full text-center'}
                >
                  {card.buttonLabel}
                </Link>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-center opacity-40">
                  {card.variant === 'admin' ? 'Gunakan ID Pegawai + Password' : 'Gunakan ID Pegawai + PIN'}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Workflow Steps */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <h2 className="text-3xl font-black text-navy tracking-tight">Alur Kerja Digital</h2>
            <div className="h-px flex-1 bg-navy/10 mx-6 hidden md:block" />
            <div className="text-xs font-bold text-navy/40 uppercase tracking-widest">3 Tahap Optimasi</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Penugasan", desc: "Admin merilis picklist proyek ke worker tertentu." },
              { title: "Eksekusi", desc: "Worker mengambil barang & validasi bukti foto." },
              { title: "Sinkronisasi", desc: "Data stok terupdate otomatis secara real-time." }
            ].map((step, idx) => (
              <div key={idx} className="glass p-8 rounded-3xl border border-white/40">
                <div className="text-4xl font-black text-navy/10 mb-4 tracking-tighter">0{idx + 1}</div>
                <h4 className="text-xl font-black text-navy mb-2 tracking-tight">{step.title}</h4>
                <p className="text-sm font-medium text-navy/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Help Banner */}
        <section className="relative overflow-hidden p-10 md:p-16 rounded-[40px] bg-navy text-white text-center">
          <div
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-4 tracking-tight">Butuh Bantuan Login?</h2>
            <p className="text-white/70 font-semibold mb-8 leading-relaxed">
              Sistem ini untuk penggunaan internal Apix Interior.
              Minta akun atau reset kredensial ke Administrator Gudang.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="https://wa.me/6281214239373"
                className="inline-flex items-center gap-3 bg-white text-navy px-8 py-4 rounded-2xl font-black hover:bg-gold hover:text-navy transition-all shadow-xl"
              >
                Hubungi Helpdesk Admin
              </Link>
              <a
                href="/login"
                className="block w-full md:w-auto text-center py-3 bg-navy/5 text-navy/40 text-[10px] font-black rounded-xl shadow-sm active:scale-95 transition-all hover:bg-navy/10 hover:text-navy"
              >
                PERGI KE HALAMAN ADMIN →
              </a>
              <a
                href="/worker/login"
                className="block w-full md:w-auto text-center py-3 bg-white/5 text-white/40 text-[10px] font-black rounded-xl border border-white/5 shadow-sm active:scale-95 transition-all hover:bg-white/10 hover:text-white"
              >
                MASUK KE PORTAL WORKER →
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-navy/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-8 h-8 bg-navy rounded-lg" />
            <div className="font-black text-navy uppercase text-sm tracking-tighter">Apix Interior</div>
          </div>
          <div className="text-[11px] font-bold text-navy/40 uppercase tracking-[0.3em]">
            © 2026 Internal Operation System
          </div>
          <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-navy/60">
            <span>Security Logged</span>
            <span>v3.0.0 — Unified Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
