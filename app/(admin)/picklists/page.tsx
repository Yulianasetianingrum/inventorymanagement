"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

export default function PicklistPage() {
  const [picklists, setPicklists] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  useEffect(() => {
    fetchData();
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
    ).slice(0, 5);
  }, [items, searchItem]);

  function addItem(item: any) {
    if (selectedItems.find(si => si.id === item.id)) return;
    setSelectedItems([...selectedItems, { ...item, reqQty: 1 }]);
    setSearchItem("");
  }

  function removeItem(id: number) {
    setSelectedItems(selectedItems.filter(si => si.id !== id));
  }

  function updateQty(id: number, qty: number) {
    setSelectedItems(selectedItems.map(si => si.id === id ? { ...si, reqQty: qty } : si));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) return alert("Pilih minimal 1 barang.");

    const body = {
      projectId: isNewProject ? null : projectId,
      newProject: isNewProject ? newProject : null,
      title,
      mode,
      neededAt,
      assigneeId,
      notes,
      items: selectedItems.map(si => ({ itemId: si.id, reqQty: si.reqQty }))
    };

    try {
      const res = await fetch("/api/admin/picklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchData();
      } else {
        const err = await res.json();
        alert("Gagal: " + (err.error || "Server error"));
      }
    } catch (err) {
      alert("Error membuat picklist");
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
              <h2 className="text-2xl font-black text-navy mb-8 tracking-tight">Form Penugasan Baru</h2>
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
                    className="w-full h-11 bg-off-white border border-navy/5 rounded-xl px-4 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all cursor-pointer"
                    value={mode}
                    onChange={e => setMode(e.target.value)}
                  >
                    <option value="INTERNAL">Internal (Gudang → Workshop)</option>
                    <option value="EXTERNAL">External (Supplier → Workshop)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label className="text-xs font-black text-navy uppercase tracking-widest">Proyek Terkait</label>
                  {!isNewProject ? (
                    <div className="flex gap-2">
                      <select
                        className="flex-1 h-11 bg-off-white border border-navy/5 rounded-xl px-4 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all cursor-pointer"
                        value={projectId}
                        onChange={e => setProjectId(e.target.value)}
                        required={!isNewProject}
                      >
                        <option value="">Pilih Proyek Aktif...</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.namaProjek} — {p.namaKlien}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsNewProject(true)}
                        className="h-11 px-4 bg-navy text-gold text-xs font-black rounded-xl hover:bg-navy-light transition-all shrink-0"
                      >
                        + Proyek Baru
                      </button>
                    </div>
                  ) : (
                    <div className="bg-off-white p-5 rounded-2xl border border-navy/5 relative group">
                      <div className="flex justify-between items-center mb-4">
                        <strong className="text-xs font-black text-navy uppercase tracking-widest">Detail Proyek Baru</strong>
                        <button type="button" onClick={() => setIsNewProject(false)} className="text-[10px] font-black text-danger uppercase tracking-widest hover:underline">Batal</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className="input-field h-10 bg-white px-3 text-sm rounded-lg border border-navy/5" placeholder="Nama Projek*" value={newProject.namaProjek} onChange={e => setNewProject({ ...newProject, namaProjek: e.target.value })} required />
                        <input className="input-field h-10 bg-white px-3 text-sm rounded-lg border border-navy/5" placeholder="Nama Klien" value={newProject.namaKlien} onChange={e => setNewProject({ ...newProject, namaKlien: e.target.value })} />
                        <input className="input-field h-10 bg-white px-3 text-sm rounded-lg border border-navy/5" placeholder="WhatsApp Klien" value={newProject.noHpWa} onChange={e => setNewProject({ ...newProject, noHpWa: e.target.value })} />
                        <input className="input-field h-10 bg-white px-3 text-sm rounded-lg border border-navy/5" placeholder="Keperluan" value={newProject.keperluan} onChange={e => setNewProject({ ...newProject, keperluan: e.target.value })} />
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
                  <label className="text-xs font-black text-navy uppercase tracking-widest">Target Selesai</label>
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
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-navy/5 overflow-hidden z-20">
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
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min="1"
                                  className="w-16 h-8 bg-off-white rounded-lg text-center font-black focus:outline-none focus:ring-1 focus:ring-gold"
                                  value={si.reqQty}
                                  onChange={e => updateQty(si.id, Number(e.target.value))}
                                />
                                <span className="text-[11px] font-bold text-navy/40">{si.unit}</span>
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
                  <button type="submit" className="btn-primary w-full shadow-lg shadow-navy/10">Konfirmasi & Rilis Picklist</button>
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
            <div className="overflow-x-auto">
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
                    <tr key={p.id} className="border-b border-navy/5 last:border-0 hover:bg-off-white/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-black text-navy leading-none mb-1 group-hover:text-gold transition-colors">{p.code}</div>
                        <div className="text-[10px] font-semibold text-navy/50">{p.title}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-navy truncate max-w-[150px]">{p.project?.namaProjek}</div>
                        <div className="text-[11px] font-medium text-navy/50">{p.project?.namaKlien}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-[9px] font-black text-navy">
                            {p.assignee?.name?.[0]}
                          </div>
                          <span className="font-bold text-navy/70">{p.assignee?.name}</span>
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
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm("Hapus picklist ini? Data tidak bisa dikembalikan.")) return;
                            try {
                              const res = await fetch(`/api/admin/picklists/${p.id}`, { method: "DELETE" });
                              if (res.ok) {
                                fetchData();
                              } else {
                                alert("Gagal menghapus");
                              }
                            } catch {
                              alert("Error deleting");
                            }
                          }}
                          className="mt-2 text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Hapus
                        </button>
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
          </div>
        )}
      </main>
    </div>
  );
}
