"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./projects.module.css";

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
  // create form
  const [namaProjek, setNamaProjek] = useState("");
  const [namaKlien, setNamaKlien] = useState("");
  const [noHpWa, setNoHpWa] = useState("");
  const [keperluan, setKeperluan] = useState("");

  // list state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [visiblePhoneIds, setVisiblePhoneIds] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProjectRow | null>(null);

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNamaProjek, setEditNamaProjek] = useState("");
  const [editNamaKlien, setEditNamaKlien] = useState("");
  const [editNoHpWa, setEditNoHpWa] = useState("");
  const [editKeperluan, setEditKeperluan] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const canSubmit = useMemo(() => {
    return namaProjek.trim().length > 0 && namaKlien.trim().length > 0 && noHpWa.trim().length > 0;
  }, [namaProjek, namaKlien, noHpWa]);

  const canSaveEdit = useMemo(() => {
    return (
      !!editId &&
      editNamaProjek.trim().length > 0 &&
      editNamaKlien.trim().length > 0 &&
      editNoHpWa.trim().length > 0
    );
  }, [editId, editNamaProjek, editNamaKlien, editNoHpWa]);

  async function loadProjects() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Gagal load projects.");

      const raw = Array.isArray(data?.projects) ? data.projects : [];
      const normalized: ProjectRow[] = raw.map((p: any) => ({
        id: String(p?.id ?? ""),
        namaProjek: String(p?.namaProjek ?? ""),
        namaKlien: String(p?.namaKlien ?? ""),
        noHpWa: String(p?.noHpWa ?? ""),
        keperluan: p?.keperluan == null ? null : String(p.keperluan),
        createdAt: String(p?.createdAt ?? ""),
      }));

      setProjects(normalized);
    } catch (e: any) {
      toast(e?.message || "Terjadi error saat load.", true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaProjek: namaProjek.trim(),
          namaKlien: namaKlien.trim(),
          noHpWa: noHpWa.trim(),
          keperluan: keperluan.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Gagal menyimpan project.");

      setNamaProjek("");
      setNamaKlien("");
      setNoHpWa("");
      setKeperluan("");

      await loadProjects();
      toast("Project berhasil dibuat.");
    } catch (e: any) {
      toast(e?.message || "Terjadi error.", true);
    } finally {
      setIsSaving(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Disalin.");
    } catch {
      toast("Gagal menyalin.", true);
    }
  }

  function togglePhone(id: string) {
    setVisiblePhoneIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function openEdit(p: ProjectRow) {
    setEditId(p.id);
    setEditNamaProjek(p.namaProjek);
    setEditNamaKlien(p.namaKlien);
    setEditNoHpWa(p.noHpWa);
    setEditKeperluan(p.keperluan || "");
    setEditOpen(true);
  }

  function closeEdit() {
    if (editSaving) return;
    setEditOpen(false);
    setEditId(null);
    setEditNamaProjek("");
    setEditNamaKlien("");
    setEditNoHpWa("");
    setEditKeperluan("");
  }

  async function saveEdit() {
    if (!canSaveEdit || editSaving || !editId) return;

    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${encodeURIComponent(editId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaProjek: editNamaProjek.trim(),
          namaKlien: editNamaKlien.trim(),
          noHpWa: editNoHpWa.trim(),
          keperluan: editKeperluan.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Gagal update project.");

      await loadProjects();
      closeEdit();
      toast("Project diupdate.");
    } catch (e: any) {
      toast(e?.message || "Terjadi error saat update.", true);
    } finally {
      setEditSaving(false);
    }
  }

  async function deleteProject(p: ProjectRow) {
    if (deletingId) return;
    setConfirmDelete(p);
  }

  async function performDelete(p: ProjectRow) {
    setDeletingId(p.id);
    try {
      const res = await fetch(`/api/admin/projects/${encodeURIComponent(p.id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Gagal hapus project.");

      setProjects((prev) => prev.filter((x) => x.id !== p.id));
      toast("Project dihapus.");
    } catch (e: any) {
      toast(e?.message || "Terjadi error saat hapus.", true);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  }

  function toast(msg: string, error?: boolean) {
    const el = document.createElement("div");
    el.className = `${styles.toast} ${error ? styles.toastError : ""}`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add(styles.toastShow));
    setTimeout(() => {
      el.classList.remove(styles.toastShow);
      setTimeout(() => el.remove(), 200);
    }, 1400);
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <img src="/logo/apix.png" alt="" />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Apix Interior</div>
            <div className={styles.brandSubtitle}>Projects</div>
          </div>
        </div>

        <button type="button" className={styles.navButton} onClick={() => window.history.back()}>
          ← Kembali
        </button>
      </header>

      <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <div className={styles.subtitle}>Form input + daftar project (responsif HP/Tablet, rapi di Desktop).</div>
        </div>

      </div>

      <div className={styles.grid}>
        {/* FORM */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Tambah Project</div>
            <div className={styles.cardHint}>Isi minimal dulu, nanti bisa edit.</div>
          </div>

          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Nama Projek</label>
              <input
                value={namaProjek}
                onChange={(e) => setNamaProjek(e.target.value)}
                placeholder="Contoh: Kitchenset Pak Budi - Depok"
                className={styles.input}
                autoComplete="off"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nama Klien / PIC</label>
              <input
                value={namaKlien}
                onChange={(e) => setNamaKlien(e.target.value)}
                placeholder="Contoh: Budi Santoso / Mbak Rina (PIC)"
                className={styles.input}
                autoComplete="off"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>No. HP / WhatsApp</label>
              <div className={styles.row}>
                <input
                  value={noHpWa}
                  onChange={(e) => setNoHpWa(e.target.value)}
                  type="password"
                  placeholder="08xxxxxxxxxx"
                  className={styles.input}
                  autoComplete="off"
                  inputMode="tel"
                />
                <button
                  type="button"
                  onClick={() => copyText(noHpWa)}
                  disabled={!noHpWa.trim()}
                  className={styles.button}
                  title={noHpWa.trim() ? `Copy (${maskPhone(noHpWa)})` : "Isi nomor dulu"}
                >
                  Copy
                </button>
              </div>
              <div className={styles.helpText}>Nomor disensor seperti password. Bisa Copy tanpa lihat.</div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Keperluan</label>
              <input
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                placeholder="Contoh: Kitchen set + island"
                className={styles.input}
                autoComplete="off"
              />
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                disabled={!canSubmit || isSaving}
                className={`${styles.button} ${styles.primary}`}
              >
                {isSaving ? "Menyimpan..." : "Simpan Project"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setNamaProjek("");
                  setNamaKlien("");
                  setNoHpWa("");
                  setKeperluan("");
                }}
                className={styles.button}
                disabled={isSaving}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {/* LIST */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Daftar Project</div>
            <div className={styles.badge}>{projects.length} data</div>
          </div>

          {projects.length === 0 ? (
            <div className={styles.emptyState}>{isLoading ? "Loading..." : "Belum ada data."}</div>
          ) : (
            <>
              {/* Desktop/Tablet table */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nama Projek</th>
                      <th>Klien / PIC</th>
                      <th>No. HP/WA</th>
                      <th>Keperluan</th>
                      <th className={styles.thRight}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => {
                      const show = !!visiblePhoneIds[p.id];
                      const wa = normalizeWhatsAppId(p.noHpWa);
                      const waHref = wa ? `https://wa.me/${wa}` : "";
                      const hubungiDisabled = !wa;

                      return (
                        <tr key={p.id}>
                          <td className={styles.tdStrong}>{p.namaProjek}</td>
                          <td>{p.namaKlien}</td>
                          <td>
                            <div className={styles.phoneCell}>
                              <span className={styles.mono}>{show ? p.noHpWa : maskPhone(p.noHpWa)}</span>
                              <button
                                type="button"
                                onClick={() => togglePhone(p.id)}
                                className={styles.iconPill}
                                title={show ? "Sembunyikan" : "Lihat"}
                              >
                                {show ? "🙈" : "👁️"}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyText(p.noHpWa)}
                                className={styles.pill}
                                title="Copy"
                              >
                                Copy
                              </button>
                            </div>
                          </td>
                          <td>{p.keperluan || "-"}</td>
                          <td className={styles.tdRight}>
                            <div className={styles.actionCell}>
                              <a
                                className={`${styles.pill} ${styles.waPill} ${hubungiDisabled ? styles.disabled : ""}`}
                                href={hubungiDisabled ? undefined : waHref}
                                target="_blank"
                                rel="noreferrer"
                                aria-disabled={hubungiDisabled}
                                onClick={(e) => {
                                  if (hubungiDisabled) e.preventDefault();
                                }}
                                title={hubungiDisabled ? "Nomor WA tidak valid" : "Hubungi via WhatsApp"}
                              >
                                Hubungi
                              </a>
                              <button
                                type="button"
                                onClick={() => openEdit(p)}
                                className={`${styles.pill} ${styles.editPill}`}
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProject(p)}
                                className={`${styles.pill} ${styles.deletePill}`}
                                disabled={deletingId === p.id}
                                title="Hapus"
                              >
                                {deletingId === p.id ? "Menghapus..." : "Hapus"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className={styles.mobileList}>
                {projects.map((p) => {
                  const show = !!visiblePhoneIds[p.id];
                  const wa = normalizeWhatsAppId(p.noHpWa);
                  const waHref = wa ? `https://wa.me/${wa}` : "";
                  const hubungiDisabled = !wa;

                  return (
                    <div key={p.id} className={styles.itemCard}>
                      <div className={styles.itemTop}>
                        <div className={styles.itemTitle}>{p.namaProjek}</div>
                        <div className={styles.itemSub}>{p.namaKlien}</div>
                      </div>

                      <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>No. WA</div>
                        <div className={styles.itemValue}>
                          <span className={styles.mono}>{show ? p.noHpWa : maskPhone(p.noHpWa)}</span>
                          <button
                            type="button"
                            onClick={() => togglePhone(p.id)}
                            className={styles.iconPill}
                            title={show ? "Sembunyikan" : "Lihat"}
                          >
                            {show ? "🙈" : "👁️"}
                          </button>
                          <button type="button" onClick={() => copyText(p.noHpWa)} className={styles.pill}>
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>Keperluan</div>
                        <div className={styles.itemValueText}>{p.keperluan || "-"}</div>
                      </div>

                      <div className={styles.itemActions}>
                        <a
                          className={`${styles.pill} ${styles.waPill} ${hubungiDisabled ? styles.disabled : ""}`}
                          href={hubungiDisabled ? undefined : waHref}
                          target="_blank"
                          rel="noreferrer"
                          aria-disabled={hubungiDisabled}
                          onClick={(e) => {
                            if (hubungiDisabled) e.preventDefault();
                          }}
                        >
                          Hubungi
                        </a>
                        <button type="button" onClick={() => openEdit(p)} className={`${styles.pill} ${styles.editPill}`}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProject(p)}
                          className={`${styles.pill} ${styles.deletePill}`}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className={styles.modalOverlay} onMouseDown={closeEdit}>
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Edit Project</div>
                <div className={styles.modalHint}>Update data klien & kebutuhan.</div>
              </div>

              <button type="button" className={styles.iconButton} onClick={closeEdit} aria-label="Tutup">
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label}>Nama Projek</label>
                <input
                  value={editNamaProjek}
                  onChange={(e) => setEditNamaProjek(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nama Klien / PIC</label>
                <input
                  value={editNamaKlien}
                  onChange={(e) => setEditNamaKlien(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>No. HP / WhatsApp</label>
                <input
                  value={editNoHpWa}
                  onChange={(e) => setEditNoHpWa(e.target.value)}
                  className={styles.input}
                  inputMode="tel"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Keperluan</label>
                <input
                  value={editKeperluan}
                  onChange={(e) => setEditKeperluan(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.button} onClick={closeEdit} disabled={editSaving}>
                Batal
              </button>

      <button
        type="button"
        className={`${styles.button} ${styles.primary}`}
        onClick={saveEdit}
        disabled={!canSaveEdit || editSaving}
              >
                {editSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
        </div>
      </div>
    )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete ? (
        <div className={styles.modalOverlay} onMouseDown={() => (!deletingId ? setConfirmDelete(null) : null)}>
          <div className={`${styles.modal} ${styles.dangerModal}`} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Hapus Project</div>
                <div className={styles.modalHint}>Aksi ini tidak bisa dibatalkan.</div>
              </div>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setConfirmDelete(null)}
                aria-label="Tutup"
                disabled={!!deletingId}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalHint}>
                Hapus project <strong>{confirmDelete.namaProjek}</strong> milik {confirmDelete.namaKlien}?
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.button} onClick={() => setConfirmDelete(null)} disabled={!!deletingId}>
                Batal
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.deletePill}`}
                onClick={() => performDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
              >
                {deletingId === confirmDelete.id ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
