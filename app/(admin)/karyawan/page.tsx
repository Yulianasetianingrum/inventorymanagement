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
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header Section */}
        <header className="bg-navy p-6 md:p-8 rounded-[32px] mb-8 relative overflow-hidden shadow-2xl shadow-navy/20">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-gold opacity-10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] mb-2">User Management</p>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">Internal Resources</h1>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <Button onClick={() => {
                setForm({ employeeId: "", name: "", role: "WORKER", phone: "", notes: "", isActive: true });
                setShowCreate(true);
              }} className="bg-gold text-navy hover:bg-gold-light font-bold h-12 px-6 rounded-xl shadow-lg shadow-gold/20 flex-1 md:flex-none">
                + Tambah Akun
              </Button>
              <Button onClick={() => router.push("/dashboard")} className="bg-white/10 text-white hover:bg-white/20 backdrop-blur font-bold h-12 px-6 rounded-xl border border-white/10 flex-1 md:flex-none">
                Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-4 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              className="w-full h-14 pl-12 pr-6 bg-white border border-gray-100 rounded-2xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/5 shadow-sm transition-all text-sm"
              placeholder="Cari nama, ID, atau role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="h-14 px-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-navy uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-navy/5 shadow-sm min-w-[140px]"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Semua Role</option>
              <option value="ADMIN">Admin</option>
              <option value="WORKER">Worker</option>
            </select>
            <select
              className="h-14 px-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-navy uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-navy/5 shadow-sm min-w-[140px]"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Identitas Karyawan</th>
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Role & Auth</th>
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Status Akun</th>
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Aktivitas Terakhir</th>
                <th className="px-6 py-5 text-right text-xs font-black text-navy/40 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 font-bold opacity-30 text-navy">Menghubungkan ke database...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 font-bold opacity-30 text-navy">Tidak ada akun yang sesuai kriteria.</td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-navy text-base">{user.name}</div>
                      <div className="text-xs font-semibold text-navy/40 mt-1">ID: {user.employeeId} • {user.phone || "No Phone"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 items-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide ${user.role === 'ADMIN' ? 'bg-navy/10 text-navy' : 'bg-amber-100 text-amber-700'}`}>
                          {user.role}
                        </span>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{user.authType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-navy/60 text-xs">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("id-ID") : "Belum pernah login"}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="h-9 px-4 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors" onClick={() => {
                          setSelected(user);
                          setForm({ ...user, employeeId: user.employeeId || "", phone: user.phone || "", notes: user.notes || "" });
                          setShowEdit(true);
                        }}>Edit</button>
                        <button className="h-9 px-4 rounded-lg bg-gold text-navy text-xs font-bold hover:bg-gold-dark transition-colors" onClick={() => {
                          setResetTarget(user);
                          setResetInput("");
                        }}>Reset</button>
                        {user.employeeId !== "ADM-001" && (
                          <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" onClick={() => setDeleteTarget(user)}>
                            <span className="text-lg">🗑️</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="text-center py-20 font-bold opacity-30 text-navy">Menghubungkan ke database...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 font-bold opacity-30 text-navy">Tidak ada akun yang sesuai kriteria.</div>
          ) : (
            filtered.map(user => (
              <div key={user.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${user.role === 'ADMIN' ? 'bg-navy' : 'bg-gold'}`}></div>

                <div className="flex justify-between items-start mb-4 pl-3">
                  <div>
                    <h3 className="font-bold text-navy text-lg leading-tight">{user.name}</h3>
                    <div className="text-xs font-semibold text-navy/40 mt-1">ID: {user.employeeId}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="pl-3 space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${user.role === 'ADMIN' ? 'bg-navy/10 text-navy' : 'bg-amber-100 text-amber-700'}`}>
                      {user.role}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">Auth: {user.authType}</span>
                  </div>

                  <div className="text-xs text-navy/60">
                    <span className="font-bold text-navy/30 uppercase tracking-widest text-[9px] block mb-0.5">Last Login</span>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("id-ID") : "Belum pernah login"}
                  </div>
                </div>

                <div className="pl-3 flex gap-2 border-t border-slate-50 pt-3">
                  <button className="flex-1 h-10 rounded-xl bg-navy text-white text-xs font-bold shadow-lg shadow-navy/20" onClick={() => {
                    setSelected(user);
                    setForm({ ...user, employeeId: user.employeeId || "", phone: user.phone || "", notes: user.notes || "" });
                    setShowEdit(true);
                  }}>Edit Profil</button>
                  <button className="flex-1 h-10 rounded-xl bg-gold text-navy text-xs font-bold shadow-lg shadow-gold/20" onClick={() => {
                    setResetTarget(user);
                    setResetInput("");
                  }}>Reset Password</button>
                  {user.employeeId !== "ADM-001" && (
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600" onClick={() => setDeleteTarget(user)}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || showEdit) && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-navy p-6 md:p-8 relative">
              <h2 className="text-2xl font-black text-white">{showEdit ? "Update Profil" : "Akun Baru"}</h2>
              <button
                className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                onClick={() => { setShowCreate(false); setShowEdit(false); }}
              >✕</button>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Nama Lengkap</label>
                <input className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Employee ID</label>
                  <input className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10 placeholder:text-slate-300 text-sm" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} placeholder="Auto" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Role</label>
                  <select className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10 text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}>
                    <option value="WORKER">Worker</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Nomor Telepon</label>
                <input className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>

              <div>
                <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Catatan</label>
                <textarea className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10 resize-none text-sm" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded text-navy focus:ring-navy/20 border-gray-300"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                />
                <span className="font-bold text-navy text-sm">Status Akun Aktif</span>
              </div>

              <div className="pt-4">
                <Button onClick={showEdit ? handleEdit : handleCreate} className="w-full h-14 bg-navy hover:bg-navy-light text-white font-black text-sm rounded-xl uppercase tracking-widest shadow-xl shadow-navy/20">
                  {showEdit ? "Simpan Perubahan" : "Buat Akun Baru"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credential Modal */}
      {credentialModal && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-gold/10 text-gold rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🔑</div>
            <h3 className="text-2xl font-black text-navy mb-2">Akses Diperoleh</h3>
            <p className="text-xs font-bold text-navy/40 mb-8 uppercase tracking-wider">Simpan kredensial ini baik-baik</p>

            <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
              <div className="text-[10px] font-black text-navy/30 uppercase mb-2">Password / PIN Baru</div>
              <div className="text-3xl font-black text-navy tracking-widest select-all font-mono">{credentialModal.credential}</div>
            </div>

            <label className="flex items-center justify-center gap-3 mb-8 cursor-pointer group hover:opacity-80 transition-opacity">
              <input type="checkbox" className="w-5 h-5 rounded border-2 border-navy/20" checked={ackCredential} onChange={e => setAckCredential(e.target.checked)} />
              <span className="text-xs font-bold text-navy">Saya sudah menyalin kredensial</span>
            </label>

            <Button
              disabled={!ackCredential}
              className="w-full h-14 bg-navy hover:bg-navy-light text-white font-black rounded-xl uppercase tracking-widest"
              onClick={() => { setCredentialModal(null); setAckCredential(false); }}
            >
              Selesai
            </Button>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl">
            <div className="bg-navy p-6 flex justify-between items-center text-white">
              <h2 className="font-black text-lg">Reset Password</h2>
              <button onClick={() => setResetTarget(null)} className="opacity-60 hover:opacity-100">✕</button>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-sm font-bold text-navy/60 mb-6 leading-relaxed">
                Reset untuk <strong>{resetTarget.name}</strong>. Kosongkan utk auto-generate.
              </p>
              <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Password Baru</label>
              <input className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-gold/20 mb-8" value={resetInput} onChange={e => setResetInput(e.target.value)} placeholder="Auto-generate" />

              <Button onClick={handleReset} className="w-full h-12 bg-gold hover:bg-gold-dark text-navy font-black rounded-xl border border-gold-deep/10 shadow-lg shadow-gold/20">RESET SEKARANG</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-red-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-8 text-center rounded-[32px] shadow-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⚠️</div>
            <h3 className="text-xl font-black text-navy mb-2">Hapus Akun?</h3>
            <p className="text-sm font-bold text-navy/40 mb-8 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. User <strong>{deleteTarget.employeeId}</strong> akan hilang selamanya.
            </p>
            <div className="flex gap-4">
              <Button className="flex-1 h-12 bg-slate-100 text-slate-400 font-black rounded-xl hover:bg-slate-200" onClick={() => setDeleteTarget(null)}>BATAL</Button>
              <Button className="flex-1 h-12 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30" onClick={handleDelete}>HAPUS</Button>
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
