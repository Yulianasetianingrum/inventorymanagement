"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function MaterialWithdrawalPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  // Form State
  const [projectId, setProjectId] = useState("");
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Projects & Items for lookup
    Promise.all([
      fetch("/api/worker/projects").then(r => r.json()),
      fetch("/api/worker/items").then(r => r.json())
    ]).then(([projData, itemData]) => {
      setProjects(projData.data || []);
      setItems(itemData.data || []);
    });
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const results = items.filter(i =>
      i.name.toLowerCase().includes(lower) ||
      i.brand?.toLowerCase().includes(lower) ||
      i.size?.toLowerCase().includes(lower)
    ).slice(0, 15); // Show more results
    setSearchResults(results);
  }, [searchTerm, items]);

  const addItem = (item: any) => {
    if (selectedItems.find(i => i.itemId === item.id)) return;
    setSelectedItems([...selectedItems, {
      itemId: item.id,
      name: item.name,
      brand: item.brand,
      size: item.size,
      qty: 1,
      unit: item.unit,
      stockMode: "baru",
      stockNew: item.stockNew,
      stockUsed: item.stockUsed
    }]);
    setSearchTerm("");
  };

  const removeItem = (id: number) => {
    setSelectedItems(selectedItems.filter(i => i.itemId !== id));
  };

  const updateQty = (id: number, val: number) => {
    setSelectedItems(selectedItems.map(i => i.itemId === id ? { ...i, qty: val } : i));
  };

  const updateMode = (id: number, mode: "baru" | "bekas") => {
    setSelectedItems(selectedItems.map(i => i.itemId === id ? { ...i, stockMode: mode } : i));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (images.length + files.length > 50) {
        alert("Maksimal 50 foto!");
        return;
      }
      setSubmitting(true);
      try {
        const { compressImage } = await import("@/lib/imageCompression");
        const newImages: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.size > 10 * 1024 * 1024) continue;
          const compressed = await compressImage(file, 50);
          newImages.push(compressed);
        }
        setImages(prev => [...prev, ...newImages]);
      } catch (err) {
        console.error("Compression failed", err);
        alert("Gagal memproses gambar");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!projectId) return alert("Pilih Project tujuan!");
    if (selectedItems.length === 0) return alert("Pilih minimal 1 item!");
    if (images.length === 0) return alert("Foto bukti wajib dilampirkan!");

    setSubmitting(true);
    try {
      const res = await fetch("/api/worker/picklists/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          items: selectedItems.map(i => ({
            itemId: i.itemId,
            qty: i.qty,
            stockMode: i.stockMode
          })),
          images
        })
      });

      if (res.ok) {
        alert("Pengambilan berhasil dicatat!");
        router.push("/worker/home");
        // DO NOT setSubmitting(false) here to prevent UI flicker before redirect
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
        setSubmitting(false);
      }
    } catch (e) {
      alert("Error submitting data");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="bg-navy pt-8 pb-12 px-6 rounded-b-[40px] shadow-2xl shadow-navy/20 relative">
        <div className="relative z-10">
          <div className="text-gold text-xs font-bold uppercase tracking-widest mb-1">Self-Service</div>
          <h1 className="text-2xl font-black text-white leading-tight">Ambil Barang</h1>
          <p className="text-white/60 text-xs mt-1">Catat pengambilan barang manual</p>
        </div>
      </header>

      <main className="px-5 -mt-6 relative z-20 space-y-6">
        {/* Project Select */}
        <div className="bg-white p-5 rounded-[20px] shadow-lg border border-slate-100">
          <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Project Tujuan</label>
          <select
            className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
          >
            <option value="">-- Pilih Project --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.namaProjek} - {p.namaKlien}</option>
            ))}
          </select>
        </div>

        {/* Item Selector */}
        <div className="bg-white p-5 rounded-[20px] shadow-lg border border-slate-100 relative">
          <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Cari Barang</label>
          <div className="relative">
            <input
              className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
              placeholder="Ketik nama barang..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-navy transition-colors font-bold text-lg"
              >
                ×
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-[84px] left-0 w-full bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden z-50">
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {searchResults.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="p-4 hover:bg-slate-50 border-b border-slate-50 cursor-pointer flex justify-between items-center transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-navy text-sm group-hover:text-amber-600 transition-colors">{item.name}</div>
                      <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest mt-0.5">{item.brand} • {item.size}</div>
                      <div className="text-[9px] font-bold text-slate-400 mt-0.5">📍 {item.location}</div>
                    </div>
                    <div className="text-navy/20 text-xl font-black group-hover:translate-x-1 transition-transform">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchTerm && searchResults.length === 0 && (
            <div className="absolute top-[84px] left-0 w-full bg-white shadow-2xl rounded-2xl border border-slate-100 p-8 text-center z-50">
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-sm font-bold text-navy">Item tidak ditemukan</div>
              <div className="text-[10px] text-slate-400">Coba gunakan kata kunci lain</div>
            </div>
          )}
        </div>

        {/* Selected Items List */}
        {selectedItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black text-navy uppercase tracking-widest">Barang Dipilih ({selectedItems.length})</h3>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pilih Kondisi ✨/♻️</div>
            </div>
            {selectedItems.map((item) => (
              <div key={item.itemId} className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold text-navy text-sm leading-tight">{item.name}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.brand} • {item.size}</div>
                  </div>
                  <button onClick={() => removeItem(item.itemId)} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center font-bold">×</button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateMode(item.itemId, "baru")}
                    className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${item.stockMode === "baru" ? "bg-navy text-gold shadow-lg shadow-navy/20 ring-2 ring-gold/20" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
                  >
                    <span>✨</span>
                    <span>Baru ({item.stockNew})</span>
                  </button>
                  <button
                    onClick={() => updateMode(item.itemId, "bekas")}
                    className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${item.stockMode === "bekas" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20 ring-2 ring-amber-500/20" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
                  >
                    <span>♻️</span>
                    <span>Bekas ({item.stockUsed})</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-[8px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Jumlah Diambil</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full h-10 bg-white rounded-lg px-3 font-black text-navy focus:outline-none border border-slate-200"
                        value={item.qty}
                        onChange={e => updateQty(item.itemId, Number(e.target.value))}
                      />
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Tipe Stok</span>
                      <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${item.stockMode === "baru" ? "bg-navy/5 text-navy" : "bg-amber-50 text-amber-600"}`}>
                        {item.stockMode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Camera Evidence Sections */}
        <div className="bg-white p-5 rounded-[20px] shadow-lg border border-slate-100 text-center">
          <div className="inline-block px-3 py-1 bg-navy/5 rounded-full text-[9px] font-black text-navy/40 uppercase tracking-[0.2em] mb-4">
            Evidence - Bukti Foto
          </div>

          {/* Grid Display */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                  <img src={url} className="w-full h-full object-cover" alt={`Evidence ${idx}`} />
                  {!submitting && (
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg">×</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!submitting && (
            <label className="block relative cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              <div className="w-full h-20 rounded-2xl border-2 border-dashed border-navy/10 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-navy/5 transition-all">
                <div className="text-xl mb-1">📸</div>
                <div className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Tambah Foto (Max 50)</div>
              </div>
            </label>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || images.length === 0}
          className="w-full h-14 bg-navy hover:bg-navy-light text-white font-bold rounded-2xl shadow-xl shadow-navy/20 active:scale-[0.98] transition-all"
        >
          {submitting ? "MENGOLAH DATA..." : `KONFIRMASI PENGAMBILAN (${images.length} FOTO)`}
        </Button>

      </main>
    </div>
  );
}
