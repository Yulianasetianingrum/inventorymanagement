"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

import { ChatPopup } from "@/components/admin/ChatPopup";

export default function PicklistPage() {
  const [picklists, setPicklists] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null); // For chat sender

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatTarget, setChatTarget] = useState<any>(null);
  const [unreadWorkers, setUnreadWorkers] = useState<any[]>([]);
  const [showInbox, setShowInbox] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  // Modal & Toast State
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, msg: "", error: false });

  const showToast = (msg: string, error = false) => {
    setToast({ visible: true, msg, error });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  };

  // Form states
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isNewProject, setIsNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    namaProjek: "",
    namaKlien: "",
    noHpWa: "",
    keperluan: ""
  });
  const [mode, setMode] = useState("INTERNAL");
  const [assigneeId, setAssigneeId] = useState("");
  const [neededAt, setNeededAt] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchItem, setSearchItem] = useState("");
  const [projectSearch, setProjectSearch] = useState(""); // Search term

  const filteredProjects = useMemo(() => {
    if (!projectSearch) return projects.slice(0, 10);
    return projects.filter(p =>
      p.namaProjek.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.namaKlien.toLowerCase().includes(projectSearch.toLowerCase())
    ).slice(0, 10);
  }, [projects, projectSearch]);

  useEffect(() => {
    // Run auto-close logic first
    fetch("/api/admin/picklists/auto-close")
      .then(() => fetchData())
      .catch(() => fetchData());
  }, []);

  useEffect(() => {
    let interval: any;
    const loadUnread = async () => {
      try {
        const res = await fetch("/api/admin/messages/unread");
        const json = await res.json();
        if (res.ok) setUnreadWorkers(json.data || []);
      } catch {
        // ignore
      }
    };
    loadUnread();
    interval = setInterval(loadUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const item = params.get("item");
    if (item) {
      setShowForm(true);
      setSearchItem(item);
    }
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [plistRes, projRes, workerRes, itemRes] = await Promise.all([
        fetch("/api/admin/picklists"),
        fetch("/api/admin/projects"),
        fetch("/api/admin/users?role=WORKER"),
        fetch("/api/admin/items")
      ]);

      const plistData = await plistRes.json();
      if (plistData.currentUser) setCurrentUser(plistData.currentUser); // Expect API update
      const projData = await projRes.json();
      const workerData = await workerRes.json();
      const itemData = await itemRes.json();

      const plistList = Array.isArray(plistData.data) ? plistData.data : Array.isArray(plistData.picklists) ? plistData.picklists : [];
      const projList = Array.isArray(projData.projects) ? projData.projects : Array.isArray(projData.data) ? projData.data : [];
      const workerList = Array.isArray(workerData.data?.users) ? workerData.data.users : Array.isArray(workerData.users) ? workerData.users : [];
      const itemList = Array.isArray(itemData.data) ? itemData.data : Array.isArray(itemData.items) ? itemData.items : [];

      setPicklists(plistList);
      setProjects(projList);
      setWorkers(workerList);
      setItems(itemList);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = useMemo(() => {
    if (!searchItem) return [];
    return items.filter(it =>
      it.name.toLowerCase().includes(searchItem.toLowerCase()) ||
      it.brand?.toLowerCase().includes(searchItem.toLowerCase())
    ).slice(0, 20);
  }, [items, searchItem]);

  const evidenceItems = useMemo(() => {
    if (!detailData) return [];
    if (Array.isArray(detailData.evidence) && detailData.evidence.length > 0) {
      return detailData.evidence;
    }
    const legacy: any[] = [];
    if (detailData.pickingImage) legacy.push({ type: "PICKING", imageUrl: detailData.pickingImage });
    if (detailData.returnImage) legacy.push({ type: "RETURN", imageUrl: detailData.returnImage });
    return legacy;
  }, [detailData]);

  function addItem(item: any) {
    if (selectedItems.find(si => si.id === item.id)) return;
    setSelectedItems([...selectedItems, { ...item, reqQty: 1 }]);
    setSearchItem("");
  }

  function openChatWith(worker: any) {
    setChatTarget(worker);
    setShowChat(true);
    setShowInbox(false);
  }

  async function openDetail(id: string) {
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/picklists/${id}`);
      const json = await res.json();
      if (res.ok) setDetailData(json.data);
      else setDetailData(null);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function removeItem(id: number) {
    setSelectedItems(selectedItems.filter(si => si.id !== id));
  }

  function updateQty(id: number, qty: number) {
    const item = selectedItems.find(si => si.id === id);
    if (!item) return;

    // Clamp logic
    // Clamp logic
    let safeQty = qty;
    // Only clamp by stock limits if INTERNAL (taking from warehouse)
    // If EXTERNAL (purchasing), allows ordering more than current stock
    if (mode !== "EXTERNAL") {
      if (safeQty > item.stockTotal) safeQty = item.stockTotal;
    }
    if (safeQty < 1) safeQty = 1;

    setSelectedItems(selectedItems.map(si => si.id === id ? { ...si, reqQty: safeQty } : si));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) return showToast("Pilih minimal 1 barang.", true);

    const toUtcIso = (value: string) => {
      if (!value) return null;
      const d = new Date(value);
      return d.toISOString();
    };

    const body = {
      projectId: isNewProject ? null : projectId,
      newProject: isNewProject ? newProject : null,
      title,
      mode,
      neededAt: toUtcIso(neededAt),
      assigneeId,
      notes,
      items: selectedItems.map(si => ({ itemId: si.id, reqQty: si.reqQty }))
    };

    try {
      const url = editingId ? `/api/admin/picklists/${editingId}` : "/api/admin/picklists";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchData();
        showToast("Picklist berhasil disimpan ✅");
      } else {
        const err = await res.json();
        showToast("Gagal: " + (err.error || "Server error"), true);
      }
    } catch (err) {
      showToast("Error processing request", true);
    }
  }

  function resetForm() {
    setTitle("");
    setProjectId("");
    setIsNewProject(false);
    setNewProject({ namaProjek: "", namaKlien: "", noHpWa: "", keperluan: "" });
    setMode("INTERNAL");
    setAssigneeId("");
    setNeededAt("");
    setNotes("");
    setSelectedItems([]);
    setEditingId(null);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-50 glass border-b border-white/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center text-gold font-black text-sm">
              A
            </div>
            <div className="hidden sm:block">
              <div className="font-black text-navy text-sm uppercase leading-none">Apix Interior</div>
              <div className="text-[9px] font-bold text-gold uppercase tracking-widest">Picklist Admin</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs font-bold text-navy/60 hover:text-navy px-3 py-1.5 transition-colors">
              ← Dashboard
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className={showForm ? "btn-primary !py-2 !px-4 !text-xs bg-danger hover:bg-danger/80" : "btn-gold !py-2 !px-4 !text-xs"}
            >
              {showForm ? "Batal" : "+ Buat Picklist"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {showForm && (
          <div className="premium-card p-1 mb-10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white p-8 rounded-[19px]">
              <h2 className="text-2xl font-black text-navy mb-8 tracking-tight">{editingId ? "Edit Penugasan" : "Form Penugasan Baru"}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label className="text-xs font-black text-navy uppercase tracking-widest">Judul Picklist</label>
                  <input
                    className="w-full h-11 bg-off-white border border-navy/5 rounded-xl px-4 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Ambil Bahan Finishing Proyek Kemang"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-navy uppercase tracking-widest">Metode Distribusi</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as "INTERNAL" | "EXTERNAL")}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 appearance-none bg-slate-50"
                  >
                    <option value="INTERNAL">Internal (Gudang → Workshop)</option>
                    {/* External mode removed as per user request (too complicated) */}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label className="text-xs font-black text-navy uppercase tracking-widest">Proyek Terkait</label>
                  {!isNewProject ? (
                    <div className="relative group">
                      {/* Search Input */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            className="w-full h-11 bg-off-white border border-navy/5 rounded-xl px-4 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
                            placeholder="Cari Proyek (Ketik Nama)..."
                            value={projectSearch}
                            onChange={e => {
                              setProjectSearch(e.target.value);
                              if (projectId) setProjectId(""); // Clear selection on type
                            }}
                          />
                          {projectId && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success font-black text-xs pointer-events-none">
                              ✓ Selected
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewProject(true);
                            setProjectId("");
                            setProjectSearch("");
                          }}
                          className="h-11 px-4 bg-navy text-gold text-xs font-black rounded-xl hover:bg-navy-light transition-all shrink-0"
                        >
                          + Baru
                        </button>
                      </div>

                      {/* Dropdown Results */}
                      {projectSearch && !projectId && filteredProjects.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-navy/5 z-20 overflow-hidden">
                          {filteredProjects.map(p => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setProjectId(p.id);
                                setProjectSearch(p.namaProjek);
                              }}
                              className="p-3 hover:bg-off-white cursor-pointer border-b border-navy/5 last:border-0"
                            >
                              <div className="font-bold text-navy text-sm">{p.namaProjek}</div>
                              <div className="text-[10px] text-navy/40 uppercase font-bold">{p.namaKlien}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-off-white p-5 rounded-2xl border border-navy/5 relative group animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center mb-4">
                        <strong className="text-xs font-black text-navy uppercase tracking-widest">Detail Proyek Baru</strong>
                        <button type="button" onClick={() => setIsNewProject(false)} className="text-[10px] font-black text-danger uppercase tracking-widest hover:underline">Batal</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input autoComplete="off" className="input-field h-10 bg-white px-3 text-sm rounded-lg border border-navy/5" placeholder="Nama Projek*" value={newProject.namaProjek} onChange={e => setNewProject({ ...newProject, namaProjek: e.target.value })} required />
                        <input autoComplete="off" className="input-field h-10 bg-white px-3 text-sm rounded-lg border border-navy/5" placeholder="Nama Klien" value={newProject.namaKlien} onChange={e => setNewProject({ ...newProject, namaKlien: e.target.value })} />
                        <input autoComplete="off" className="input-field h-10 bg-white px-3 text-sm rounded-lg border border-navy/5" placeholder="WhatsApp Klien" value={newProject.noHpWa} onChange={e => setNewProject({ ...newProject, noHpWa: e.target.value })} />
                        <input autoComplete="off" className="input-field h-10 bg-white px-3 text-sm rounded-lg border border-navy/5" placeholder="Keperluan" value={newProject.keperluan} onChange={e => setNewProject({ ...newProject, keperluan: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-navy uppercase tracking-widest">Visual Evidence</label>
                  <div className="h-11 flex items-center px-4 bg-navy/5 rounded-xl text-[10px] font-black text-navy/40 uppercase tracking-widest italic border border-dashed border-navy/10">
                    Mandatory Scan Enabled
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-navy uppercase tracking-widest">Assign Assignee</label>
                  <select
                    className="w-full h-11 bg-off-white border border-navy/5 rounded-xl px-4 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all cursor-pointer"
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Member Gudang...</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name} — ({w.employeeId})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-navy uppercase tracking-widest">Target Projek Selesai</label>
                  <input
                    type="datetime-local"
                    className="w-full h-11 bg-off-white border border-navy/5 rounded-xl px-4 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
                    value={neededAt}
                    onChange={e => setNeededAt(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-3">
                  <label className="text-xs font-black text-navy uppercase tracking-widest">Daftar Barang (Manifest)</label>
                  <div className="relative group">
                    <input
                      placeholder="Ketik nama atau brand barang..."
                      className="w-full h-11 bg-off-white border border-navy/5 rounded-xl px-4 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
                      value={searchItem}
                      onChange={e => setSearchItem(e.target.value)}
                    />
                    {filteredItems.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-20">
                        <div className="bg-white rounded-2xl shadow-2xl border border-navy/10 overflow-y-auto max-h-[400px] custom-scrollbar p-1 pb-16">
                          {filteredItems.map(it => (
                            <div
                              key={it.id}
                              className="p-3 flex items-center justify-between hover:bg-off-white cursor-pointer transition-colors"
                              onClick={() => addItem(it)}
                            >
                              <div>
                                <div className="font-bold text-navy text-sm">{it.name}</div>
                                <div className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">{it.brand} — Rak: {it.location || "???"}</div>
                              </div>
                              <div className="bg-success/10 text-success text-[10px] font-black px-2 py-1 rounded">Stok: {it.stockNew}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-navy/5 mt-4">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-navy/5">
                        <tr>
                          <th className="px-5 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">Detail Item</th>
                          <th className="px-5 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest">Kuantitas</th>
                          <th className="px-5 py-3 text-[10px] font-black text-navy/40 uppercase tracking-widest text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map(si => (
                          <tr key={si.id} className="border-b border-navy/5 last:border-0">
                            <td className="px-5 py-4">
                              <div className="font-bold text-navy">{si.name}</div>
                              <div className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">{si.brand}</div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="number"
                                    min="1"
                                    max={si.stockTotal}
                                    className="w-16 h-8 bg-off-white rounded-lg text-center font-black focus:outline-none focus:ring-1 focus:ring-gold"
                                    value={si.reqQty}
                                    onChange={e => updateQty(si.id, Number(e.target.value))}
                                  />
                                  <span className="text-[11px] font-bold text-navy/40">{si.unit}</span>
                                </div>
                                <div className="text-[9px] font-bold text-navy/30 uppercase tracking-wide">
                                  Max: {si.stockTotal} (B:{si.stockNew} | S:{si.stockUsed})
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button type="button" onClick={() => removeItem(si.id)} className="text-[10px] font-black text-danger uppercase tracking-widest hover:underline">Hapus</button>
                            </td>
                          </tr>
                        ))}
                        {selectedItems.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-5 py-8 text-center">
                              <div className="text-xs font-bold text-navy/30 uppercase tracking-widest italic">Belum ada barang yang didaftarkan.</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 pt-6 border-t border-navy/5">
                  <button type="submit" className="btn-primary w-full shadow-lg shadow-navy/10">{editingId ? "Simpan Perubahan" : "Konfirmasi & Rilis Picklist"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-navy tracking-tight">Status Penugasan</h1>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-navy text-gold text-[10px] font-black rounded-full uppercase tracking-widest">Semua Data</div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-30">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-[11px] font-black uppercase tracking-widest">Sinkronisasi Database...</div>
          </div>
        ) : (
          <div className="premium-card overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-navy/5">
                    <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Manifes</th>
                    <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Destinasi / Proyek</th>
                    <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Assignee</th>
                    <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Mode</th>
                    <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest text-right">Aktivitas Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {picklists.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => openDetail(p.id)}
                      className="border-b border-navy/5 last:border-0 hover:bg-off-white/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="font-black text-navy leading-none mb-1 group-hover:text-gold transition-colors">{p.code}</div>
                        <div className="text-[10px] font-semibold text-navy/50">{p.title}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-navy truncate max-w-[150px]">{p.project?.namaProjek}</div>
                        <div className="text-[11px] font-medium text-navy/50">{p.project?.namaKlien}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-[9px] font-black text-navy">
                              {p.assignee?.name?.[0]}
                            </div>
                            <span className="font-bold text-navy/70">{p.assignee?.name}</span>
                          </div>

                          {p.status !== 'DELIVERED' && (
                            <div className="flex gap-2 ml-8">
                              {p.assignee?.phone && (
                                <a
                                  href={`https://wa.me/${p.assignee.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-2 py-1 bg-[#25d366] hover:bg-[#128c7e] text-white text-[9px] font-black rounded uppercase tracking-wider flex items-center gap-1 transition-colors shadow-sm"
                                  title="Chat WhatsApp"
                                >
                                  <span>WA</span>
                                </a>
                              )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setChatTarget(p.assignee);
                                    setShowChat(true);
                                  }}
                                className="px-2 py-1 bg-navy/10 hover:bg-navy/20 text-navy text-[9px] font-black rounded uppercase tracking-wider flex items-center gap-1 transition-colors"
                              >
                                💬 Chat
                              </button>
                            </div>
                          )}

                          {p.status === 'PICKED' && (
                            <span className="ml-2 px-2 py-0.5 bg-success/10 text-success text-[8px] font-bold rounded border border-success/20 uppercase tracking-wider">
                              ✅ Menunggu Jadwal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-[6px] uppercase tracking-wider 
                          ${p.mode === 'EXTERNAL' ? 'bg-gold/10 text-gold-deep border border-gold/20' : 'bg-navy/5 text-navy/60 border border-navy/10'}`}>
                          {p.mode}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${p.status === 'DELIVERED' ? 'bg-success' :
                            p.status === 'PICKING' ? 'bg-accent' :
                              p.status === 'READY' ? 'bg-warning' : 'bg-navy/20'
                            }`} />
                          <span className="font-black text-navy text-[10px] uppercase tracking-widest">{p.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-[11px] font-bold text-navy/40">{new Date(p.updatedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div className="text-[9px] font-medium text-navy/20 uppercase tracking-tighter">{new Date(p.updatedAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</div>
                        {(!p.neededAt || new Date(p.neededAt) > new Date()) && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              // Logic to pre-fill form
                              setEditingId(p.id);
                              setTitle(p.title);
                              setProjectId(p.projectId || "");
                              setProjectSearch(p.project?.namaProjek || "");
                              setMode(p.mode);
                              setAssigneeId(p.assigneeId || "");
                              if (p.neededAt) {
                                const d = new Date(p.neededAt);
                                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                                setNeededAt(d.toISOString().slice(0, 16));
                              } else {
                                setNeededAt("");
                              }
                              setNotes(p.notes || "");

                              // Fetch full details to get lines
                              const res = await fetch(`/api/admin/picklists/${p.id}`);
                              const json = await res.json();
                              if (json.data && json.data.lines) {
                                setSelectedItems(json.data.lines.map((l: any) => ({
                                  id: l.item.id,
                                  name: l.item.name,
                                  brand: l.item.brand,
                                  unit: l.item.unit,
                                  stockTotal: l.item.stockNew + l.item.stockUsed, // Approx
                                  stockNew: l.item.stockNew,
                                  stockUsed: l.item.stockUsed,
                                  reqQty: l.reqQty
                                })));
                              }

                              setShowForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="mt-2 mr-3 text-[10px] font-bold text-navy hover:underline uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            edit
                          </button>
                        )}
                        {p.status !== 'PICKED' && p.status !== 'DELIVERED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(p.id);
                            }}
                            className="mt-2 text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {picklists.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center opacity-20 italic">Belum ada riwayat penugasan ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {picklists.map(p => (
                <div
                  key={p.id}
                  onClick={() => openDetail(p.id)}
                  className="p-4 border-b border-navy/5 last:border-0 hover:bg-off-white/50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-navy text-sm">{p.code}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${p.status === 'DELIVERED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-navy/50">{p.title}</div>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${p.mode === 'EXTERNAL' ? 'bg-gold/10 text-gold-deep border border-gold/20' : 'bg-navy/5 text-navy/60 border border-navy/10'}`}>
                      {p.mode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4 bg-navy/5 p-3 rounded-xl border border-navy/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-navy shadow-sm">
                        {p.project?.namaProjek?.[0] || "?"}
                      </div>
                      <div>
                        <div className="font-bold text-navy text-xs">{p.project?.namaProjek}</div>
                        <div className="text-[9px] text-navy/40">{p.project?.namaKlien}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {p.assignee?.name && <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">{p.assignee.name[0]}</div>}
                      <span className="text-[10px] font-bold text-navy/70">{p.assignee?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(!p.neededAt || new Date(p.neededAt) > new Date()) && (
                        <button
                          className="text-[10px] font-bold text-navy hover:underline uppercase"
                          onClick={async (e) => {
                            e.stopPropagation();
                            setEditingId(p.id);
                            setTitle(p.title);
                            setProjectId(p.projectId || "");
                            setProjectSearch(p.project?.namaProjek || "");
                            setMode(p.mode);
                            setAssigneeId(p.assigneeId || "");
                            if (p.neededAt) {
                              const d = new Date(p.neededAt);
                              d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                              setNeededAt(d.toISOString().slice(0, 16));
                            } else {
                              setNeededAt("");
                            }
                            setNotes(p.notes || "");

                            const res = await fetch(`/api/admin/picklists/${p.id}`);
                            const json = await res.json();
                            if (json.data && json.data.lines) {
                              setSelectedItems(json.data.lines.map((l: any) => ({
                                id: l.item.id,
                                name: l.item.name,
                                brand: l.item.brand,
                                unit: l.item.unit,
                                stockTotal: l.item.stockNew + l.item.stockUsed,
                                stockNew: l.item.stockNew,
                                stockUsed: l.item.stockUsed,
                                reqQty: l.reqQty
                              })));
                            }
                            setShowForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {p.status !== 'PICKED' && p.status !== 'DELIVERED' && (
                        <button
                          className="text-[10px] font-bold text-danger hover:underline uppercase"
                          onClick={async (e) => {
                            e.stopPropagation();
                            setDeleteTarget(p.id);
                          }}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
        }

        {/* Confirmation Modal */}
        {
          deleteTarget && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-navy/10 animate-in zoom-in-95 duration-200 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
                <h3 className="text-xl font-black text-navy mb-2">Hapus Penugasan?</h3>
                <p className="text-sm text-navy/60 font-medium mb-6">
                  Tindakan ini tidak bisa dibatalkan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 h-11 bg-slate-100 text-navy/70 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      if (!deleteTarget) return;
                      try {
                        const res = await fetch(`/api/admin/picklists/${deleteTarget}`, { method: "DELETE" });
                        if (res.ok) {
                          showToast("Picklist berhasil dihapus ✅");
                          fetchData();
                        } else {
                          showToast("Gagal menghapus ❌", true);
                        }
                      } catch {
                        showToast("Error deleting", true);
                      }
                      setDeleteTarget(null);
                    }}
                    className="flex-1 h-11 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Toast Notification */}
        <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 transform ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className={`px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 ${toast.error ? 'bg-red-600 text-white' : 'bg-navy text-white'}`}>
            <span>{toast.msg}</span>
          </div>
        </div>
      </main >

      {/* Detail Modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 md:p-8 max-w-3xl w-full mx-2 md:mx-4 shadow-2xl border border-navy/10 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Detail Picklist</div>
                <div className="text-xl font-black text-navy">{detailData?.code || "..."}</div>
                <div className="text-[11px] text-navy/50 font-semibold">{detailData?.title}</div>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-navy/40 hover:text-navy">✕</button>
            </div>

            {detailLoading ? (
              <div className="py-10 text-center text-sm text-navy/50">Memuat detail...</div>
            ) : detailData ? (
              <div className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</div>
                    <div className="text-sm font-black text-navy">{detailData.status}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Projek Selesai</div>
                    <div className="text-sm font-black text-navy">{formatDateTime(detailData.neededAt)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diselesaikan</div>
                    <div className="text-sm font-black text-navy">{formatDateTime(detailData.deliveredAt || detailData.pickedAt)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl border border-slate-100 p-3">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Assignee</div>
                    <div className="text-sm font-bold text-navy">{detailData.assignee?.name || "-"}</div>
                    <div className="text-[10px] text-slate-400">{detailData.assignee?.employeeId || "-"}</div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-3">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Project</div>
                    <div className="text-sm font-bold text-navy">{detailData.project?.namaProjek || "-"}</div>
                    <div className="text-[10px] text-slate-400">{detailData.project?.namaKlien || "-"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black text-navy uppercase tracking-widest mb-2">Bukti Foto</div>
                  {evidenceItems.length === 0 ? (
                    <div className="text-[11px] text-slate-400">Belum ada bukti foto.</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {evidenceItems.map((ev: any) => (
                        <a
                          key={ev.id || ev.imageUrl}
                          href={ev.imageUrl}
                          target="_blank"
                          className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm"
                        >
                          <img src={ev.imageUrl} alt={ev.type || "Evidence"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute bottom-2 left-2 bg-white/80 text-[9px] font-black text-navy px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {ev.type || "Bukti"}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {detailData.events?.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-navy uppercase tracking-widest mb-2">Jejak Aktivitas</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {detailData.events.map((ev: any) => (
                        <div key={ev.id} className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                          <div className="font-bold text-navy">{ev.eventType}</div>
                          <div className="text-slate-400">{formatDateTime(ev.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailData.lines?.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-navy uppercase tracking-widest mb-2">Barang (Diambil / Return)</div>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {detailData.lines.map((l: any) => (
                        <div key={l.id} className="flex items-center justify-between text-[11px] bg-white border border-slate-100 rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <div className="font-bold text-navy truncate">{l.item?.name || "-"}</div>
                            <div className="text-[9px] text-slate-400 uppercase tracking-widest">{l.item?.brand} • {l.item?.size}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] text-slate-400 uppercase tracking-widest">Diambil</div>
                            <div className="font-black text-navy">{l.pickedQty ?? l.reqQty} {l.item?.unit || ""}</div>
                            <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Return</div>
                            <div className="font-black text-amber-700">{l.returnedQty || 0} {l.item?.unit || ""}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-red-500">Gagal memuat detail.</div>
            )}
          </div>
        </div>
      )}

      {/* Floating Inbox */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
        {showInbox && (
          <div className="w-72 bg-white rounded-2xl shadow-2xl border border-navy/10 overflow-hidden">
            <div className="bg-navy text-white px-4 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-between">
              <span>Inbox Worker</span>
              <button onClick={() => setShowInbox(false)} className="text-white/60 hover:text-white">✕</button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {unreadWorkers.length === 0 ? (
                <div className="p-4 text-center text-[10px] text-slate-400">Tidak ada pesan baru.</div>
              ) : (
                unreadWorkers.map((w: any) => (
                  <button
                    key={w.id}
                    onClick={() => openChatWith(w)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                  >
                    <div className="text-xs font-black text-navy">{w.name}</div>
                    <div className="text-[9px] text-slate-500">ID: {w.employeeId}</div>
                    <div className="mt-1 inline-flex items-center text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      {w.count} pesan baru
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowInbox(v => !v)}
          className="relative w-14 h-14 rounded-full bg-navy text-white shadow-2xl shadow-navy/30 flex items-center justify-center hover:scale-105 transition-transform"
          title="Inbox"
        >
          ✉
          {unreadWorkers.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
              {unreadWorkers.reduce((sum, w) => sum + (w.count || 0), 0)}
            </span>
          )}
        </button>
      </div>

      {/* Chat Popup */}
      {
        showChat && chatTarget && currentUser && (
          <ChatPopup
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            targetUser={chatTarget}
            currentUser={currentUser}
          />
        )
      }
    </div >
  );
}
