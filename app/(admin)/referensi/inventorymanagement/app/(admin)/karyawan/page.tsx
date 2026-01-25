"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";

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

const badgeStyle = (bg: string, color: string) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: "999px",
  background: bg,
  color,
  fontWeight: 700,
  fontSize: "0.85rem",
});

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

export default function KaryawanPage() {

  const fmtLastLogin = (d: any) => {
    if (!d) return "-";
    const dt = typeof d === "string" ? new Date(d) : new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [meEmployeeId, setMeEmployeeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [credentialModal, setCredentialModal] = useState<{ employeeId: string; credential: string; authType: AuthType } | null>(null);
  const [ackCredential, setAckCredential] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetInput, setResetInput] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const isSuperAdmin = meEmployeeId === "ADM-001";
  const hasIdentity = !!meEmployeeId;
  const [actionBlocked, setActionBlocked] = useState<string | null>(null);

  const showError = (msg: string) => setFlash({ type: "error", message: msg });
  const showSuccess = (msg: string) => setFlash({ type: "success", message: msg });


  const [logoutLoading, setLogoutLoading] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    role: "WORKER" as Role,
    phone: "",
    notes: "",
    isActive: true,
  });

  const [meRole, setMeRole] = useState<Role | null>(null);
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      if (status && status !== "ALL") params.set("status", status);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data karyawan");
      const json = await res.json();
      const list =
        Array.isArray(json?.data?.users) ? json.data.users :
        Array.isArray(json?.users) ? json.users :
        Array.isArray(json?.data) ? json.data :
        [];
      setUsers(list);
} catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" as any });
        if (!res.ok) return;
        const json = await res.json().catch(() => ({} as any));
        const emp =
          json?.user?.employeeId ??
          json?.data?.employeeId ??
          json?.data?.session?.employeeId ??
          json?.employeeId ??
          json?.session?.employeeId ??
          "";
        if (emp) setMeEmployeeId(String(emp));
        const role =
          (json?.user?.role as Role | undefined) ??
          (json?.data?.role as Role | undefined) ??
          (json?.data?.session?.role as Role | undefined) ??
          (json?.role as Role | undefined) ??
          (json?.session?.role as Role | undefined);
        if (role) setMeRole(role);
      } catch {
        // ignore
      }
    })();
  }, []);


  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const filtered = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter((u) => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase());
      const matchRole = role === "ALL" ? true : u.role === role;
      const matchStatus = status === "ALL" ? true : status === "Aktif" ? u.isActive : !u.isActive;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, role, status]);

  // Sembunyikan user SYSTEM dari tampilan/aksi
  const visibleUsers = useMemo(() => filtered.filter((u) => u.employeeId !== "SYSTEM"), [filtered]);
  const canCreate = useMemo(() => form.name.trim().length > 0, [form.name]);

  const doLogout = async () => {
  if (logoutLoading) return;
  setLogoutLoading(true);
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    window.location.href = "/login";
  }
};

const handleLogout = () => {
  setShowLogoutConfirm(true);
};


  const openCreate = () => {
    setForm({ employeeId: "", name: "", role: "WORKER", phone: "", notes: "", isActive: true });
    setShowCreate(true);
  };

  const submitCreate = async () => {
    if (createLoading || !canCreate) return;
    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: form.employeeId || undefined,
          name: form.name,
          role: form.role,
          phone: form.phone || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Gagal membuat karyawan");
      setCredentialModal({
        employeeId: data.data.user.employeeId,
        credential: data.data.credential,
        authType: data.data.user.authType,
      });
      setShowCreate(false);
      showSuccess("Karyawan berhasil dibuat");
      fetchUsers();
      setForm({ employeeId: "", name: "", role: "WORKER", phone: "", notes: "", isActive: true });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal membuat karyawan");
    } finally {
      setCreateLoading(false);
    }
  };

  const submitEdit = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          phone: form.phone || null,
          notes: form.notes || null,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui karyawan");
      setShowEdit(false);
      fetchUsers();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal memperbarui karyawan");
    }
  };

  const openEdit = (u: User) => {
    if (!isSuperAdmin && hasIdentity && u.role === "ADMIN" && u.employeeId !== meEmployeeId) {
      setActionBlocked(u.employeeId === "ADM-001" ? "Kamu tidak diizinkan edit milik admin utama." : "Kamu tidak diizinkan edit milik admin lain.");
      return;
    }
    setSelected(u);
    setForm({
      employeeId: u.employeeId,
      name: u.name,
      role: u.role,
      phone: u.phone ?? "",
      notes: u.notes ?? "",
      isActive: u.isActive,
    });
    setShowEdit(true);
  };

  const resetCredential = (u: User) => {
    const isTargetAdmin = u.role === "ADMIN";
    const isTargetSuper = u.employeeId === "ADM-001";

    // Admin lain: tidak boleh reset admin lain; ADM-001 bebas.
    if (!isSuperAdmin && hasIdentity && isTargetAdmin && u.employeeId !== meEmployeeId) {
      setActionBlocked(isTargetSuper ? "Kamu tidak diizinkan reset milik admin utama." : "Kamu tidak diizinkan reset milik admin lain.");
      return;
    }

    setResetTarget(u);
    setResetInput("");
  };

  const doResetCredential = async () => {
    if (!resetTarget || resetLoading) return;
    setResetLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}/reset-credential`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "reset by admin", newCredential: resetInput.trim() || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal reset password");

      // tampilkan credential sekali
      setCredentialModal({
        employeeId: data?.data?.user?.employeeId || resetTarget.employeeId,
        credential: data?.data?.credential || "",
        authType: (data?.data?.user?.authType as AuthType) || "PASSWORD",
      });
      setAckCredential(false);
      showSuccess(`Password ${resetTarget.employeeId} berhasil direset`);
      setResetTarget(null);
      setResetInput("");
      fetchUsers();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const deleteUser = (u: User) => {
    if (!isSuperAdmin && hasIdentity && u.role === "ADMIN" && u.employeeId !== meEmployeeId) {
      setActionBlocked(u.employeeId === "ADM-001" ? "Kamu tidak diizinkan hapus admin utama." : "Kamu tidak diizinkan hapus admin lain.");
      return;
    }
    setDeleteTarget(u);
  };

  const doDeleteUser = async () => {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal hapus user");

      setUsers((prev) => (Array.isArray(prev) ? prev : []).filter((x) => x.id !== deleteTarget.id));
      showSuccess(`User ${deleteTarget.employeeId} berhasil dihapus`);
      setDeleteTarget(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal hapus user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleActive = async (u: User) => {
    if (!isSuperAdmin && hasIdentity && u.role === "ADMIN" && u.employeeId !== meEmployeeId) {
      setActionBlocked(u.employeeId === "ADM-001" ? "Kamu tidak diizinkan mengubah status admin utama." : "Kamu tidak diizinkan mengubah status admin lain.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal mengubah status");
      }
      fetchUsers();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fb" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "12px 14px",
          background: "#0a1633",
          color: "#fff",
          borderBottom: "3px solid #d4af37",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>Karyawan</div>
          <div style={{ color: "rgba(255,255,255,0.8)" }}>Kelola akun internal</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button
            style={{ background: "#d4af37", color: "#0b1b3a", border: "1px solid #b88a1e" }}
            onClick={() => router.push("/dashboard")}
          >
            ← Kembali
          </Button>
          <Button style={{ background: "#0b1b3a", color: "#fff", border: "1px solid #e5e7eb" }} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 12px", display: "grid", gap: 14 }}>
        <Card style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <input
              placeholder="Cari nama / Employee ID / role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #0b1b3a" }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
                <option value="ALL">Role: All</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={() => setShowFilterSheet(true)} style={{ background: "#d4af37", color: "#0b1b3a" }}>
                Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Desktop Table */}
        {!isMobile && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 800, color: "#0b1b3a", fontSize: "1.1rem" }}>Karyawan</div>
                <div style={{ fontSize: "0.9rem", color: "#5b667a" }}>
                  {meEmployeeId ? `Login: ${meEmployeeId}${meRole ? ` • ${meRole}` : ""}` : "Login: -"}
                </div>
              </div>
              <Button style={{ background: "#d4af37", color: "#0b1b3a", border: "1px solid #b88a1e" }} onClick={openCreate}>
                + Tambah Karyawan
              </Button>
            </div>
            <Table>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10 }}>Employee ID</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Nama</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Role</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Auth</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Status</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Last login</th>
                  <th style={{ textAlign: "left", padding: 10 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 10, color: "#5b667a" }}>
                      Memuat...
                    </td>
                  </tr>
                ) : visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 10, color: "#5b667a" }}>
                      {error || "Tidak ada data"}
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((u) => (
                    <tr key={u.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 10 }}>{u.employeeId}</td>
                      <td style={{ padding: 10 }}>{u.name}</td>
                      <td style={{ padding: 10 }}>
                        <span style={badgeStyle("#eef2ff", "#312e81")}>{u.role}</span>
                      </td>
                      <td style={{ padding: 10 }}>{u.authType}</td>
                      <td style={{ padding: 10 }}>
                        <span style={badgeStyle(u.isActive ? "#ecfdf3" : "#fef2f2", u.isActive ? "#166534" : "#b91c1c")}>
                          {u.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td style={{ padding: 10 }}>{fmtLastLogin(u.lastLoginAt)}</td>
                      <td style={{ padding: 10 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <Button style={{ background: "#0b1b3a", color: "#fff" }} onClick={() => openEdit(u)}>
                            Edit
                          </Button>
                          {u.employeeId !== "SYSTEM" ? (
                            <>
                              <Button
                                style={{ background: "#d4af37", color: "#0b1b3a", border: "1px solid #b88a1e" }}
                                onClick={() => resetCredential(u)}
                              >
                                Reset
                              </Button>
                              {u.employeeId !== "ADM-001" ? (
                                <>
                                  <Button
                                    style={{ background: u.isActive ? "#dc2626" : "#16a34a", color: "#fff" }}
                                    onClick={() => toggleActive(u)}
                                  >
                                    {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                                  </Button>
                                  <Button
                                    style={{ background: "#b91c1c", color: "#fff", border: "1px solid #991b1b" }}
                                    onClick={() => deleteUser(u)}
                                  >
                                    Hapus
                                  </Button>
                                </>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        )}

        {/* Mobile cards */}
        {isMobile && (
          <div style={{ display: "grid", gap: 12 }}>
            {loading ? (
              <Card>Memuat...</Card>
            ) : visibleUsers.length === 0 ? (
              <Card>{error || "Tidak ada data"}</Card>
            ) : (
              visibleUsers.map((u) => (
                <Card key={u.id} style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontWeight: 800, color: "#0b1b3a" }}>{u.name}</div>
                    <span style={badgeStyle("#eef2ff", "#312e81")}>{u.role}</span>
                  </div>
                  <div style={{ color: "#5b667a" }}>{u.employeeId}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={badgeStyle("#f3f4f6", "#0b1b3a")}>{u.authType}</span>
                    <span style={badgeStyle(u.isActive ? "#ecfdf3" : "#fef2f2", u.isActive ? "#166534" : "#b91c1c")}>
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div style={{ color: "#5b667a" }}>Last login: {fmtLastLogin(u.lastLoginAt)}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button style={{ background: "#0b1b3a", color: "#fff" }} onClick={() => openEdit(u)}>
                      Edit
                    </Button>
                    {u.employeeId !== "SYSTEM" ? (
                      <>
                        <Button style={{ background: "#d4af37", color: "#0b1b3a" }} onClick={() => resetCredential(u)}>
                          Reset
                        </Button>
                        {u.employeeId !== "ADM-001" ? (
                          <>
                            <Button
                              style={{ background: u.isActive ? "#dc2626" : "#16a34a", color: "#fff" }}
                              onClick={() => toggleActive(u)}
                            >
                              {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                            <Button
                              style={{ background: "#b91c1c", color: "#fff", border: "1px solid #991b1b" }}
                              onClick={() => deleteUser(u)}
                            >
                              Hapus
                            </Button>
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal Filter HP */}
      <Modal open={showFilterSheet} title="Filter" onClose={() => setShowFilterSheet(false)}>
        <div style={{ display: "grid", gap: 10 }}>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
            <option value="ALL">Role: All</option>
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 10, borderRadius: 10 }}>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button
              style={{ background: "#fff", color: "#0b1b3a", border: "1px solid #d4af37" }}
              onClick={() => {
                setRole("ALL");
                setStatus("ALL");
              }}
            >
              Reset
            </Button>
            <Button style={{ background: "#d4af37", color: "#0b1b3a" }} onClick={() => setShowFilterSheet(false)}>
              Terapkan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Create */}
      <Modal open={showCreate} title="Tambah Karyawan" onClose={() => setShowCreate(false)}>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={labelStyle}>
            <span>Nama</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label style={labelStyle}>
            <span>Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            <span>Phone (opsional)</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label style={labelStyle}>
            <span>Notes</span>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <label style={labelStyle}>
            <span>Employee ID (opsional, kalau kosong akan dibuat otomatis)</span>
            <input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
          </label>
          <Button
            style={{ background: "#d4af37", color: "#0b1b3a" }}
            onClick={submitCreate}
            disabled={!canCreate || createLoading}
          >
            {createLoading ? "Menyimpan..." : "Simpan & Tampilkan Credential"}
          </Button>
        </div>
      </Modal>

      {/* Modal Edit */}
      <Modal open={showEdit} title="Edit Karyawan" onClose={() => setShowEdit(false)}>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={labelStyle}>
            <span>Nama</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label style={labelStyle}>
            <span>Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            <span>Phone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label style={labelStyle}>
            <span>Notes</span>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span>Aktif</span>
          </label>
          <Button style={{ background: "#d4af37", color: "#0b1b3a" }} onClick={submitEdit}>
            Simpan Perubahan
          </Button>
        </div>
      </Modal>

      {/* Modal Credential Once */}
      <Modal
        open={credentialModal !== null}
        title="Credential (tampil sekali)"
        onClose={() => {
          setCredentialModal(null);
          setAckCredential(false);
        }}
      >
        {credentialModal ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Employee ID</div>
              <div>{credentialModal.employeeId}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Password</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0b1b3a" }}>{credentialModal.credential}</div>
            </div>
            <Button
              style={{ background: "#0b1b3a", color: "#fff" }}
              onClick={() => {
                navigator.clipboard.writeText(
                  `${credentialModal.employeeId} / Password: ${credentialModal.credential}`
                );
              }}
            >
              Copy
            </Button>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={ackCredential} onChange={(e) => setAckCredential(e.target.checked)} />
              <span>Saya sudah mencatat</span>
            </label>
            <Button
              disabled={!ackCredential}
              style={{
                background: ackCredential ? "#d4af37" : "#e5e7eb",
                color: ackCredential ? "#0b1b3a" : "#9ca3af",
                border: "1px solid #b88a1e",
              }}
              onClick={() => {
                setCredentialModal(null);
                setAckCredential(false);
              }}
            >
              Selesai
            </Button>
          </div>
        ) : null}
      </Modal>



      {/* Modal Reset Password */}
      <Modal
        open={!!resetTarget}
        title={resetTarget ? `Reset Password — ${resetTarget.employeeId}` : "Reset Password"}
        onClose={() => (!resetLoading ? setResetTarget(null) : null)}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ color: "#5b667a", fontSize: "0.95rem" }}>
            Password harus 6–32 karakter, campuran huruf + angka. Kosongkan untuk random.
          </div>
          <input
            value={resetInput}
            onChange={(e) => setResetInput(e.target.value)}
            placeholder="Password baru (opsional)"
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              outline: "none",
            }}
            disabled={resetLoading}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button
              type="button"
              style={{ background: "#fff", color: "#0b1b3a", border: "1px solid #d4af37" }}
              disabled={resetLoading}
              onClick={() => setResetTarget(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              style={{ background: "#0b1b3a", color: "#fff" }}
              disabled={resetLoading}
              onClick={doResetCredential}
            >
              {resetLoading ? "Reset..." : "Reset Password"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Hapus User */}
      <Modal
        open={!!deleteTarget}
        title={deleteTarget ? `Hapus User — ${deleteTarget.employeeId}` : "Hapus User"}
        onClose={() => (!deleteLoading ? setDeleteTarget(null) : null)}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ color: "#0b1b3a", fontWeight: 700 }}>
            Yakin hapus user ini? Aksi ini tidak bisa dibatalkan.
          </div>
          {deleteTarget ? (
            <div style={{ color: "#5b667a" }}>
              <div><b>{deleteTarget.employeeId}</b> — {deleteTarget.name}</div>
              <div>Role: {deleteTarget.role}</div>
            </div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button
              type="button"
              style={{ background: "#fff", color: "#0b1b3a", border: "1px solid #d4af37" }}
              disabled={deleteLoading}
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              style={{ background: "#b91c1c", color: "#fff", border: "1px solid #991b1b" }}
              disabled={deleteLoading}
              onClick={doDeleteUser}
            >
              {deleteLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal blokir aksi admin */}
      <Modal open={!!actionBlocked} title="Tidak diizinkan" onClose={() => setActionBlocked(null)}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ color: "#0b1b3a", fontWeight: 700 }}>{actionBlocked}</div>
        </div>
      </Modal>

      {/* Flash message */}
      {flash ? (
        <div
          style={{
            position: "fixed",
            left: 14,
            right: 14,
            bottom: 14,
            zIndex: 50,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: 720,
              width: "100%",
              background: flash.type === "error" ? "#fee2e2" : "#dcfce7",
              border: "1px solid " + (flash.type === "error" ? "#fecaca" : "#bbf7d0"),
              color: "#0b1b3a",
              padding: "10px 12px",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
            }}
          >
            <div style={{ fontWeight: 700 }}>{flash.message}</div>
            <Button
              type="button"
              style={{ background: "#0b1b3a", color: "#fff" }}
              onClick={() => setFlash(null)}
            >
              Tutup
            </Button>
          </div>
        </div>
      ) : null}


{/* Modal Confirm Logout */}
<Modal
  open={showLogoutConfirm}
  title="Logout"
  onClose={() => {
    if (logoutLoading) return;
    setShowLogoutConfirm(false);
  }}
>
  <div style={{ display: "grid", gap: 12 }}>
    <div style={{ fontWeight: 700, color: "#0b1b3a" }}>
      Logout dari akun <span style={{ fontWeight: 900 }}>{meEmployeeId || "ini"}</span>?
    </div>
    <div style={{ color: "#5b667a" }}>Kamu bisa login lagi kapan saja.</div>
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
      <Button
        type="button"
        style={{ background: "#fff", color: "#0b1b3a", border: "1px solid #d4af37" }}
        disabled={logoutLoading}
        onClick={() => setShowLogoutConfirm(false)}
      >
        Batal
      </Button>
      <Button
        type="button"
        style={{ background: "#0b1b3a", color: "#fff", border: "1px solid #e5e7eb" }}
        disabled={logoutLoading}
        onClick={doLogout}
      >
        {logoutLoading ? "Logout..." : "Logout"}
      </Button>
    </div>
  </div>
</Modal>
    </div>
  );
}
