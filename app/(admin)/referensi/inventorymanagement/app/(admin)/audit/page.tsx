import Link from "next/link";
import styles from "./audit.module.css";

export const dynamic = "force-dynamic";

export default function AuditPage() {
  return (
    <div className={styles.page}>
      {/* Navbar patokan (ikut Items) */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <img src="/logo/apix.png" alt="Apix Interior" />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Apix Interior</div>
            <div className={styles.brandSubtitle}>Audit</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <Link className={styles.secondaryBtn} href="/dashboard">
            ← Kembali
          </Link>
        </div>
      </header>

      {/* Konten (kosong dulu) */}
      <main className={styles.container}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Audit</h1>
        </div>

        <div className={styles.card}>
          <p className={styles.muted}>
            Halaman Audit masih kosong. Nanti di sini bisa isi audit log (filter, search, detail perubahan, dsb).
          </p>
        </div>
      </main>
    </div>
  );
}
