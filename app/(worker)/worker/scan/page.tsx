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
    const item = selectedItems.find(i => i.itemId === id);
    if (!item) return;

    let maxStock = item.stockMode === "baru" ? item.stockNew : item.stockUsed;
    if (val > maxStock) {
      alert(`Stok ${item.stockMode} hanya tersedia ${maxStock}`);
      val = maxStock;
    }
    if (val < 1) val = 1;

    setSelectedItems(selectedItems.map(i => i.itemId === id ? { ...i, qty: val } : i));
  };

  const updateMode = (id: number, mode: "baru" | "bekas") => {
    setSelectedItems(selectedItems.map(i => {
      if (i.itemId === id) {
        let maxStock = mode === "baru" ? i.stockNew : i.stockUsed;
        let newQty = i.qty;

        // Auto-adjust qty if it exceeds new mode's stock
        if (newQty > maxStock) {
          newQty = maxStock > 0 ? maxStock : 1; // Keep at least 1 but expect validation error on submit if 0
        }

        return { ...i, stockMode: mode, qty: newQty };
      }
      return i;
    }));
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

    // Final Validation
    const invalidItems = selectedItems.filter(i => {
      const max = i.stockMode === "baru" ? i.stockNew : i.stockUsed;
      return i.qty > max;
    });
    if (invalidItems.length > 0) {
      return alert(`Stok tidak cukup untuk: ${invalidItems.map(i => i.name).join(", ")}`);
    }

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
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-12">
      <header className="bg-navy pt-6 md:pt-10 pb-12 md:pb-16 px-4 md:px-8 rounded-b-[40px] shadow-2xl shadow-navy/20 relative shrink-0">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Self-Service</div>
              <h1 className="text-xl md:text-3xl font-black text-white leading-tight">Ambil Barang</h1>
              <p className="text-white/60 text-[10px] md:text-xs mt-1 font-medium">Catat pengambilan barang manual</p>
            </div>
            <button onClick={() => router.back()} className="text-white/60 hover:text-white bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold">
              Kembali
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 -mt-6 relative z-20 space-y-6 max-w-4xl mx-auto">
        {/* Project Select */}
        <div className="bg-white p-5 rounded-[24px] shadow-lg border border-slate-100 relative z-30">
          <label className="block text-[10px] md:text-xs font-black text-navy/40 uppercase tracking-widest mb-2">Project Tujuan</label>
          <div className="relative">
            <select
              className="w-full h-12 md:h-14 bg-slate-50 rounded-xl px-4 text-xs md:text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 appearance-none"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
            >
              <option value="">-- Pilih Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.namaProjek} - {p.namaKlien}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-navy/40">▼</div>
          </div>
        </div>

        {/* Item Selector */}
        <div className="bg-white p-5 rounded-[24px] shadow-lg border border-slate-100 relative z-20">
          <label className="block text-[10px] md:text-xs font-black text-navy/40 uppercase tracking-widest mb-2">Cari Barang</label>
          <div className="relative">
            <input
              className="w-full h-12 md:h-14 bg-slate-50 rounded-xl px-4 pl-11 text-xs md:text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all placeholder:text-slate-400"
              placeholder="Ketikan nama barang..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg grayscale">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-navy transition-colors font-bold text-lg w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {searchTerm && (
            <div className="absolute top-[88px] left-0 w-full bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                  {searchResults.map(item => (
                    <div
                      key={item.id}
                      onClick={() => addItem(item)}
                      className="p-3 md:p-4 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center transition-colors group mb-1 last:mb-0"
                    >
                      <div>
                        <div className="font-bold text-navy text-xs md:text-sm group-hover:text-amber-600 transition-colors">{item.name}</div>
                        <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest mt-0.5">{item.brand} • {item.size}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">📍 {item.location}</div>
                      </div>
                      <div className="text-navy/10 text-xl font-black group-hover:text-amber-500 group-hover:translate-x-1 transition-all">→</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-3xl mb-2">🤷‍♂️</div>
                  <div className="text-sm font-bold text-navy">Item tidak ditemukan</div>
                  <div className="text-[10px] text-slate-400 mt-1">Coba kata kunci lain</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Items List */}
        {selectedItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black text-navy uppercase tracking-widest">Barang Dipilih ({selectedItems.length})</h3>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pilih Kondisi ✨/♻️</div>
            </div>
            {selectedItems.map((item) => (
              <div key={item.itemId} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 space-y-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-navy/10"></div>
                <div className="flex justify-between items-start pl-2">
                  <div className="flex-1">
                    <div className="font-black text-navy text-sm md:text-base leading-tight">{item.name}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.brand} • {item.size}</div>
                  </div>
                  <button onClick={() => removeItem(item.itemId)} className="w-8 h-8 md:w-10 md:h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-bold hover:bg-red-100 transition-colors">×</button>
                </div>

                <div className="flex gap-2 pl-2">
                  <button
                    onClick={() => updateMode(item.itemId, "baru")}
                    className={`flex-1 h-10 md:h-12 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${item.stockMode === "baru" ? "bg-navy text-gold shadow-lg shadow-navy/20 ring-2 ring-gold/20 scale-[1.02]" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
                  >
                    <span>✨</span>
                    <span>Baru ({item.stockNew})</span>
                  </button>
                  <button
                    onClick={() => updateMode(item.itemId, "bekas")}
                    className={`flex-1 h-10 md:h-12 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${item.stockMode === "bekas" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20 ring-2 ring-amber-500/20 scale-[1.02]" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
                  >
                    <span>♻️</span>
                    <span>Bekas ({item.stockUsed})</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-dashed border-slate-200 ml-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-[8px] md:text-[9px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Jumlah Diambil (Pcs)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full h-10 md:h-12 bg-white rounded-xl px-4 font-black text-navy text-lg focus:outline-none border border-slate-200 focus:border-navy/30 text-center"
                        value={item.qty}
                        onChange={e => updateQty(item.itemId, Number(e.target.value))}
                      />
                    </div>
                    <div className="text-right min-w-[30%]">
                      <span className="block text-[8px] md:text-[9px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Tipe Stok</span>
                      <div className={`text-[10px] md:text-xs font-black uppercase px-3 py-2 rounded-lg text-center ${item.stockMode === "baru" ? "bg-navy/10 text-navy" : "bg-amber-100 text-amber-700"}`}>
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
        <div className="bg-white p-6 rounded-[24px] shadow-lg border border-slate-100 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 bg-navy/5 rounded-full text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] mb-4">
            Evidence - Bukti Foto
          </div>

          {/* Grid Display */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
                  <img src={url} className="w-full h-full object-cover" alt={`Evidence ${idx}`} />
                  {!submitting && (
                    <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors">×</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!submitting && (
            <label className="block relative cursor-pointer group hover:scale-[1.01] transition-transform active:scale-[0.99]">
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              <div className="w-full h-24 md:h-32 rounded-3xl border-2 border-dashed border-navy/10 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-navy/5 transition-all">
                <div className="text-3xl mb-2">📸</div>
                <div className="text-xs md:text-sm font-black text-navy/60 uppercase tracking-widest">Tambah Foto (Max 50)</div>
              </div>
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 pb-20">
          <button
            onClick={handleSubmit}
            disabled={submitting || images.length === 0}
            className="w-full h-16 md:h-20 bg-navy hover:bg-navy-light text-white font-black text-sm md:text-lg rounded-[24px] shadow-2xl shadow-navy/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>MENGOLAH DATA...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🚀</span>
                <span>KONFIRMASI PENGAMBILAN ({images.length} FOTO)</span>
              </>
            )}
          </button>
        </div>

      </main>
    </div>
  );
}
