"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import styles from "./karyawan.module.css";

type Role = "ADMIN" | "WORKER";
type AuthType = "PIN" | "PASSWORD";

type User = {
  id: string;
  employeeId: string;
  name: string;
  role: Role;
  authType: AuthType;
  isActive: boolean;
  phone?: string | null;
  notes?: string | null;
  lastLoginAt?: string | null;
};

const roleOptions: Role[] = ["ADMIN", "WORKER"];
const statusOptions = ["ALL", "Aktif", "Nonaktif"];

export default function KaryawanPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [meEmployeeId, setMeEmployeeId] = useState<string>("");
  const [meRole, setMeRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // UI States
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [credentialModal, setCredentialModal] = useState<{ employeeId: string; credential: string; authType: AuthType } | null>(null);
  const [ackCredential, setAckCredential] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetInput, setResetInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [toast, setToast] = useState<{ msg: string; error?: boolean; visible: boolean }>({ msg: "", visible: false });

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    role: "WORKER" as Role,
    phone: "",
    notes: "",
    isActive: true,
  });

  const isSuperAdmin = meEmployeeId === "ADM-001";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      const list =
        Array.isArray(json?.data?.users) ? json.data.users :
          Array.isArray(json?.users) ? json.users :
            Array.isArray(json?.data) ? json.data :
              [];
      setUsers(list);
    } catch (err) {
      showToast("Gagal memuat data", true);
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      const empId = json?.user?.employeeId || json?.employeeId || "";
      setMeEmployeeId(empId);
      setMeRole(json?.user?.role || json?.role || null);
    } catch (err) { }
  };

  useEffect(() => {
    fetchUsers();
    fetchMe();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (msg: string, error = false) => {
    setToast({ msg, error, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === "ALL" ? true : u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" ? true : statusFilter === "Aktif" ? u.isActive : !u.isActive;
      return matchRole && matchStatus && u.employeeId !== "SYSTEM";
    });
  }, [users, roleFilter, statusFilter]);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCredentialModal({ employeeId: data.data.user.employeeId, credential: data.data.credential, authType: data.data.user.authType });
      setShowCreate(false);
      showToast("Karyawan berhasil ditambahkan");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal memperbarui data");
      setShowEdit(false);
      showToast("Profil diperbarui");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  const handleReset = async () => {
    if (!resetTarget) return;
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}/reset-credential`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newCredential: resetInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCredentialModal({ employeeId: data.data.user.employeeId, credential: data.data.credential, authType: data.data.user.authType });
      setResetTarget(null);
      showToast("Password direset");
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setDeleteTarget(null);
      showToast("Akun dihapus");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  const toggleActive = async (u: User) => {
    try {
      await fetch(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      fetchUsers();
    } catch (err) { }
  };

  return (
    <div className={styles.page}>
      <div className={styles.premiumContainer}>
        {/* Header Section */}
        <header className={styles.headerCard}>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className={styles.headerSubtitle}>User Management</p>
              <h1 className={styles.headerTitle}>Internal Resources</h1>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => {
                setForm({ employeeId: "", name: "", role: "WORKER", phone: "", notes: "", isActive: true });
                setShowCreate(true);
              }} className="btn-gold !h-12 !px-6">
                + Tambah Akun
              </Button>
              <Button onClick={() => router.push("/dashboard")} className="btn-primary !bg-white/10 !backdrop-blur !h-12 !px-6 border-white/20">
                Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Controls Section */}
        <div className={styles.controlBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Cari nama, ID, atau role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <select className={styles.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="ALL">Semua Role</option>
              <option value="ADMIN">Admin</option>
              <option value="WORKER">Worker</option>
            </select>
            <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.premiumTable}>
            <thead>
              <tr>
                <th>Identitas Karyawan</th>
                <th>Role & Auth</th>
                <th>Status Akun</th>
                <th>Aktivitas Terakhir</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 font-bold opacity-30">Menghubungkan ke database...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 font-bold opacity-30">Tidak ada akun yang sesuai kriteria.</td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userMeta}>ID: {user.employeeId} • {user.phone || "No Phone"}</div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <span className={`${styles.badge} ${user.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeWorker}`}>
                          {user.role}
                        </span>
                        <span className="text-[10px] font-black opacity-30 tracking-widest uppercase flex items-center">{user.authType}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${user.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div className="font-bold text-navy/60 text-xs">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("id-ID") : "Belum pernah login"}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => {
                          setSelected(user);
                          setForm({ ...user, employeeId: user.employeeId || "", phone: user.phone || "", notes: user.notes || "" });
                          setShowEdit(true);
                        }}>Edit</button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnGold}`} onClick={() => {
                          setResetTarget(user);
                          setResetInput("");
                        }}>Reset</button>
                        {user.employeeId !== "ADM-001" && (
                          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setDeleteTarget(user)}>Hapus</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || showEdit) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{showEdit ? "Update Profil Karyawan" : "Pendaftaran Akun Baru"}</h2>
              <button className={styles.modalClose} onClick={() => { setShowCreate(false); setShowEdit(false); }}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div>
                  <label className={styles.formLabel}>Nama Lengkap</label>
                  <input className={styles.formInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className={styles.formLabel}>Employee ID (Opsional)</label>
                  <input className={styles.formInput} value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} placeholder="Otomatis jika kosong" />
                </div>
                <div>
                  <label className={styles.formLabel}>Jabatan / Role</label>
                  <select className={styles.formInput} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}>
                    <option value="WORKER">Warehouse Worker</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className={styles.formLabel}>Nomor Telepon</label>
                  <input className={styles.formInput} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="grid-cols-full">
                  <label className={styles.formLabel}>Catatan Tambahan</label>
                  <textarea className={`${styles.formInput} !h-20 py-3`} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div className="flex items-center gap-4">
                  <label className={styles.formCheck}>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                    <span className={styles.formCheckText}>Status Akun Aktif</span>
                  </label>
                </div>
              </div>
              <div className="mt-8">
                <Button onClick={showEdit ? handleEdit : handleCreate} className="btn-primary w-full !h-14 shadow-lg uppercase tracking-widest font-black">
                  {showEdit ? "Update Identitas" : "Simpan & Generate Password"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credential Modal */}
      {credentialModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent + " !max-w-md"}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🔑</div>
              <h3 className="text-xl font-black text-navy mb-1">Akses Diperoleh</h3>
              <p className="text-xs font-bold text-navy/40 mb-6 uppercase tracking-wider">Simpan kredensial ini baik-baik</p>

              <div className="bg-navy/5 p-6 rounded-2xl mb-8 border border-navy/5">
                <div className="text-[10px] font-black text-navy/30 uppercase mb-2">Password / PIN Baru</div>
                <div className="text-3xl font-black text-navy tracking-widest">{credentialModal.credential}</div>
              </div>

              <label className="flex items-center justify-center gap-2 mb-8 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded" checked={ackCredential} onChange={e => setAckCredential(e.target.checked)} />
                <span className="text-xs font-bold text-navy/60 group-hover:text-navy transition-colors">Saya sudah menyalin kredensial</span>
              </label>

              <Button
                disabled={!ackCredential}
                className="btn-navy w-full !h-14 font-black tracking-widest"
                onClick={() => { setCredentialModal(null); setAckCredential(false); }}
              >
                CONYINUE TO DASHBOARD
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {resetTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent + " !max-w-md"}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Reset Access</h2>
              <button className={styles.modalClose} onClick={() => setResetTarget(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p className="text-sm font-bold text-navy/40 mb-6 leading-relaxed">
                Set password baru untuk <strong>{resetTarget.name}</strong>. Kosongkan untuk generate otomatis.
              </p>
              <label className={styles.formLabel}>Custom Password (Opsional)</label>
              <input className={styles.formInput} value={resetInput} onChange={e => setResetInput(e.target.value)} placeholder="Min. 6 karakter" />

              <div className="mt-8">
                <Button onClick={handleReset} className="btn-gold w-full !h-14 font-black">RESET NOW</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent + " !max-w-sm"}>
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⚠️</div>
              <h3 className="text-xl font-black text-navy mb-2">Hapus Akun?</h3>
              <p className="text-sm font-bold text-navy/40 mb-8 leading-relaxed">
                Menghapus <strong>{deleteTarget.employeeId}</strong> akan memutus semua akses sistem secara permanen.
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
      <div className={`${styles.toast} ${toast.visible ? styles.toastVisible : ""} ${toast.error ? styles.toastError : ""}`}>
        {toast.msg}
      </div>
    </div>
  );
}
