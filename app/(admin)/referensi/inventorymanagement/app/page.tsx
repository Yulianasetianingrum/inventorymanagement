import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

const accessCards = [
  {
    variant: "admin" as const,
    title: "Masuk Admin",
    audience: "Untuk: Owner, Admin, Purchasing, Kepala Gudang",
    bullets: [
      "Kelola karyawan (ID & PIN/Password)",
      "Kelola material & minimum stock",
      "Buat & assign picklist proyek",
      "Pantau shortage & audit",
    ],
    buttonLabel: "Masuk Admin",
    href: "/login",
  },
  {
    variant: "worker" as const,
    title: "Masuk Worker",
    audience: "Untuk: Pekerja gudang / pengambil barang",
    bullets: [
      "Lihat tugas picklist",
      "Ambil barang sesuai area",
      "Input jumlah diambil + shortage",
      "Serah-terima & retur",
    ],
    buttonLabel: "Masuk Worker",
    href: "/worker/login",
  },
];

const steps = [
  "Admin membuat picklist proyek",
  "Worker mengambil barang & input jumlah",
  "Serah-terima/retur tercatat → stok terupdate",
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Apix Interior</div>
            <div className={styles.brandSubtitle}>Inventory Management</div>
          </div>
        </div>
        <span className={styles.badge}>Internal Only</span>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.tagline}>Stok rapi, produksi lancar.</p>
          <h1 className={styles.heroTitle}>Apix Interior Inventory Management</h1>
          <p className={styles.heroSubtitle}>
            Aplikasi internal untuk mengatur stok material, picklist proyek, serah-terima, dan retur sisa.
          </p>
        </div>
      </section>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pilih Akses</h2>
          <div className={styles.accessGrid}>
            {accessCards.map((card) => (
              <Card key={card.title} className={styles.accessCard}>
                <div>
                  <h3 className={styles.accessTitle} style={{ color: card.variant === "admin" ? "var(--gold)" : "var(--navy)" }}>
                    {card.title}
                  </h3>
                  <p className={styles.accessAudience}>{card.audience}</p>
                </div>
                <ul className={styles.bulletList}>
                  {card.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div style={{ display: "grid", gap: 6 }}>
                  <Button
                    as="a"
                    href={card.href}
                    style={{
                      textDecoration: "none",
                      background: card.variant === "admin" ? "var(--gold)" : "var(--navy)",
                      color: card.variant === "admin" ? "var(--navy)" : "var(--white)",
                      border: `1px solid ${card.variant === "admin" ? "var(--gold-dark)" : "var(--gold)"}`,
                      justifyContent: "center",
                    }}
                  >
                    {card.buttonLabel}
                  </Button>
                  <small className={styles.muted}>
                    {card.variant === "admin" ? "Login pakai Employee ID + Password" : "Login pakai Employee ID + PIN"}
                  </small>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Alur Kerja Cepat</h2>
          <div className={styles.stepsGrid}>
            {steps.map((text, idx) => (
              <Card key={text} className={styles.stepCard}>
                <div className={styles.stepRow}>
                  <div className={styles.stepBadge}>{idx + 1}</div>
                  <p style={{ color: "var(--navy)", lineHeight: 1.5, marginTop: 2 }}>{text}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Butuh Bantuan Login?</h2>
          <Card className={styles.helpCard}>
            <p style={{ color: "var(--navy)", fontWeight: 800 }}>Butuh bantuan login?</p>
            <p style={{ color: "var(--navy)" }}>Tidak ada registrasi publik. Akun dibuat oleh Admin.</p>
            <p style={{ color: "var(--navy)" }}>
              Jika lupa PIN/Password, minta reset ke Admin Gudang. Semua aktivitas tercatat untuk keamanan.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="https://wa.me/6285175020319?text=Lupa%20ID%20atau%20Password%20login" style={{ color: "var(--gold)" }}>
                Hubungi Admin
              </Link>
            </div>
          </Card>
        </section>
      </main>

      <footer className={styles.footer}>
        <span style={{ fontWeight: 700 }}>© Apix Interior — Internal System</span>
        <span className={styles.footerSub}>Gunakan dengan benar untuk akurasi stok.</span>
      </footer>
    </div>
  );
}
