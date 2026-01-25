"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./projects.module.css";
import { Button } from "@/components/ui/button";

type ProjectRow = {
  id: string;
  namaProjek: string;
  namaKlien: string;
  noHpWa: string;
  keperluan: string | null;
  createdAt: string;
};

function maskPhone(phone: string) {
  if (!phone) return "";
  const s = phone.trim();
  if (s.length <= 4) return "•".repeat(s.length);
  return "•".repeat(Math.max(0, s.length - 3)) + s.slice(-3);
}

function normalizeWhatsAppId(raw: string) {
  let digits = (raw || "").replace(/[^\d+]/g, "");
  digits = digits.replace(/^\+/, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  return digits.replace(/\D/g, "");
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: "", visible: false });

  // Form State
  const [form, setForm] = useState({
    namaProjek: "",
    namaKlien: "",
    noHpWa: "",
    keperluan: ""
  });

  // Modal State
  const [editTarget, setEditTarget] = useState<ProjectRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [visiblePhoneIds, setVisiblePhoneIds] = useState<Record<string, boolean>>({});

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      showToast("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const showToast = (msg: string) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      setForm({ namaProjek: "", namaKlien: "", noHpWa: "", keperluan: "" });
      loadProjects();
      showToast("Project berhasil dibuat");
    } catch (e) {
      showToast("Gagal menyimpan project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      await fetch(`/api/admin/projects/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      setEditTarget(null);
      loadProjects();
      showToast("Project diperbarui");
    } catch (e) {
      showToast("Gagal memperbarui");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/admin/projects/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      loadProjects();
      showToast("Project dihapus");
    } catch (e) {
      showToast("Gagal menghapus");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.premiumContainer}>
        {/* Header Section */}
        <header className={styles.headerCard}>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className={styles.headerSubtitle}>Operational Tracking</p>
              <h1 className={styles.headerTitle}>Project Master</h1>
            </div>
            <Button onClick={() => window.history.back()} className="btn-primary !bg-white/10 !backdrop-blur !h-12 !px-6 border-white/20">
              ← Kembali
            </Button>
          </div>
        </header>

        <div className={styles.mainGrid}>
          {/* Form Create */}
          <aside className={styles.formCard}>
            <h2 className={styles.formTitle}>Tambah Project Baru</h2>
            <form onSubmit={handleSubmit} className={styles.fieldGroup}>
              <div>
                <label className={styles.formLabel}>Nama Projek</label>
                <input
                  className={styles.formInput}
                  value={form.namaProjek}
                  onChange={e => setForm({ ...form, namaProjek: e.target.value })}
                  placeholder="e.g. Kitchen Set - Bpk. Budi"
                />
              </div>
              <div>
                <label className={styles.formLabel}>Nama Klien / PIC</label>
                <input
                  className={styles.formInput}
                  value={form.namaKlien}
                  onChange={e => setForm({ ...form, namaKlien: e.target.value })}
                />
              </div>
              <div>
                <label className={styles.formLabel}>No. WhatsApp</label>
                <input
                  className={styles.formInput}
                  type="password"
                  value={form.noHpWa}
                  onChange={e => setForm({ ...form, noHpWa: e.target.value })}
                  placeholder="08xxxxxxxx"
                />
              </div>
              <div>
                <label className={styles.formLabel}>Keperluan</label>
                <input
                  className={styles.formInput}
                  value={form.keperluan}
                  onChange={e => setForm({ ...form, keperluan: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isSaving} className="btn-gold w-full !h-14 font-black mt-4">
                {isSaving ? "Menyimpan..." : "SIMPAN PROJECT"}
              </Button>
            </form>
          </aside>

          {/* Project Cards Grid */}
          <main className={styles.projectList}>
            {isLoading ? (
              <div className="col-span-full py-20 text-center font-black opacity-20 text-2xl uppercase">Loading Projects...</div>
            ) : projects.length === 0 ? (
              <div className="col-span-full py-20 text-center font-black opacity-20 text-2xl uppercase">No Projects Found</div>
            ) : (
              projects.map(p => {
                const isVisible = visiblePhoneIds[p.id];
                return (
                  <div key={p.id} className={styles.projectCard}>
                    <h3 className={styles.projectTitle}>{p.namaProjek}</h3>
                    <p className={styles.clientName}>{p.namaKlien}</p>

                    <div className={styles.projectDetail}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>WhatsApp</span>
                        <div className="flex items-center gap-2">
                          <span className={styles.mono + " text-xs font-bold"}>
                            {isVisible ? p.noHpWa : maskPhone(p.noHpWa)}
                          </span>
                          <button onClick={() => setVisiblePhoneIds({ ...visiblePhoneIds, [p.id]: !isVisible })} className="text-xs opacity-40">
                            {isVisible ? "🙈" : "👁️"}
                          </button>
                        </div>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Keperluan</span>
                        <span className={styles.detailValue}>{p.keperluan || "-"}</span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <a
                        href={`https://wa.me/${normalizeWhatsAppId(p.noHpWa)}`}
                        target="_blank"
                        className={`${styles.actionBtn} ${styles.btnWA}`}
                      >
                        HUBUNGI
                      </a>
                      <button className={`${styles.actionBtn} ${styles.btnEdit}`} onClick={() => {
                        setForm({ namaProjek: p.namaProjek, namaKlien: p.namaKlien, noHpWa: p.noHpWa, keperluan: p.keperluan || "" });
                        setEditTarget(p);
                      }}>EDIT</button>
                      <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={() => setDeleteTarget(p)}>HAPUS</button>
                    </div>
                  </div>
                )
              })
            )}
          </main>
        </div>
      </div>

      {/* Edit Modal (Optional if using side form, but keeping for consistency) */}
      {editTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className="p-8">
              <h2 className="text-2xl font-black text-navy mb-6">Update Project</h2>
              <div className={styles.fieldGroup}>
                <div>
                  <label className={styles.formLabel}>Nama Projek</label>
                  <input className={styles.formInput} value={form.namaProjek} onChange={e => setForm({ ...form, namaProjek: e.target.value })} />
                </div>
                <div>
                  <label className={styles.formLabel}>WhatsApp</label>
                  <input className={styles.formInput} value={form.noHpWa} onChange={e => setForm({ ...form, noHpWa: e.target.value })} />
                </div>
                <div className="flex gap-4 mt-6">
                  <Button className="flex-1 !bg-navy/5 !text-navy/40 !h-12 font-black" onClick={() => setEditTarget(null)}>BATAL</Button>
                  <Button className="flex-1 btn-gold !h-12 font-black" onClick={handleEdit}>SIMPAN</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent + " !max-w-sm"}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⚠️</div>
              <h3 className="text-xl font-black text-navy mb-2">Hapus Project?</h3>
              <p className="text-xs font-bold text-navy/40 mb-8 leading-relaxed">
                Data project <strong>{deleteTarget.namaProjek}</strong> akan dihapus permanen.
              </p>
              <div className="flex gap-4">
                <Button className="flex-1 !bg-navy/5 !text-navy/40 !h-12 font-black" onClick={() => setDeleteTarget(null)}>BATAL</Button>
                <Button className="flex-1 btn-error !h-12 font-black" onClick={handleDelete}>HAPUS</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`${styles.toast} ${toast.visible ? styles.toastVisible : ""}`}>
        {toast.msg}
      </div>
    </div>
  );
}
