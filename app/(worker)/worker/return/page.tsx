"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdHocReturnPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  // Form State
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    // Fetch items currently held by worker
    fetch("/api/worker/returns/held-items")
      .then(r => r.json())
      .then(d => setItems(d.data || []));
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
      i.projectName?.toLowerCase().includes(lower)
    ).slice(0, 15);
    setSearchResults(results);
  }, [searchTerm, items]);

  const addItem = (item: any) => {
    if (selectedItems.find(i => i.sourceLineId === item.id)) return;
    setSelectedItems([...selectedItems, {
      sourceLineId: item.id,
      itemId: item.itemId,
      name: item.name,
      brand: item.brand,
      size: item.size,
      qty: 1,
      unit: item.unit,
      maxQty: item.balance,
      projectName: item.projectName
    }]);
    setSearchTerm("");
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(i => i.sourceLineId !== id));
  };

  const updateQty = (sourceLineId: string, val: number) => {
    setSelectedItems(selectedItems.map(i => {
      if (i.sourceLineId === sourceLineId) {
        const safeVal = Math.min(val, i.maxQty);
        return { ...i, qty: safeVal };
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
    if (selectedItems.length === 0) return alert("Pilih minimal 1 item!");
    if (images.length === 0) return alert("Foto bukti pengembalian wajib!");

    // Double check quantities
    for (const it of selectedItems) {
      if (it.qty > it.maxQty) return alert(`Jumlah return ${it.name} melebihi tanggungan (${it.maxQty})`);
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/worker/returns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map(i => ({
            sourceLineId: i.sourceLineId,
            itemId: i.itemId,
            qty: i.qty
          })),
          images
        })
      });

      if (res.ok) {
        alert("Pengembalian berhasil! Stok Bekas telah bertambah.");
        router.push("/worker/home");
        // DO NOT setSubmitting(false) here to prevent UI flicker
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
      <header className="bg-amber-600 pt-8 pb-12 px-6 rounded-b-[40px] shadow-2xl shadow-amber-900/20 relative">
        <div className="relative z-10">
          <div className="text-amber-200 text-xs font-bold uppercase tracking-widest mb-1">Self-Service</div>
          <h1 className="text-2xl font-black text-white leading-tight">Return Barang</h1>
          <p className="text-white/60 text-xs mt-1">Kembalikan tanggungan barang ke gudang bekas</p>
        </div>
      </header>

      <main className="px-5 -mt-6 relative z-20 space-y-6">

        {/* Item Selector */}
        <div className="bg-white p-5 rounded-[20px] shadow-lg border border-slate-100 relative">
          <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Cari Barang Dipegang</label>
          <div className="relative">
            <input
              className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-amber-600/20"
              placeholder="Cari item atau project..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-amber-600 font-bold text-lg">×</button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-[84px] left-0 w-full bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden z-50">
              <div className="max-h-[300px] overflow-y-auto">
                {searchResults.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="p-4 hover:bg-amber-50 border-b border-slate-50 cursor-pointer flex justify-between items-center group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-navy text-sm group-hover:text-amber-700">{item.name}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.brand} • {item.size}</div>
                      <div className="text-[9px] font-bold text-amber-600 mt-1 uppercase">📍 {item.projectName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-600 font-black text-sm">{item.balance} <span className="text-[10px] opacity-60">{item.unit}</span></div>
                      <div className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">DI TANGAN</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Items List */}
        {selectedItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-navy uppercase tracking-widest px-1">Barang Dikembalikan ({selectedItems.length})</h3>
            {selectedItems.map((item) => (
              <div key={item.sourceLineId} className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-navy text-sm leading-tight">{item.name}</h4>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">📍 {item.projectName}</p>
                  </div>
                  <button onClick={() => removeItem(item.sourceLineId)} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center font-bold">×</button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-[8px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Jumlah Di Kembalikan</label>
                      <input
                        type="number"
                        min="1"
                        max={item.maxQty}
                        className="w-full h-10 bg-white rounded-lg px-3 font-black text-navy focus:outline-none border border-slate-200"
                        value={item.qty}
                        onChange={e => updateQty(item.sourceLineId, Number(e.target.value))}
                      />
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Maksimal Sisa</span>
                      <div className="text-navy font-black text-sm">{item.maxQty} <span className="text-[10px] text-slate-400 font-bold">{item.unit}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Camera Evidence Sections */}
        <div className="bg-white p-5 rounded-[20px] shadow-lg border border-slate-100 text-center">
          <div className="inline-block px-3 py-1 bg-amber-50 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">
            Evidence - Bukti Balik Gudang
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
              <div className="w-full h-20 rounded-2xl border-2 border-dashed border-amber-900/10 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-amber-50 transition-all">
                <div className="text-xl mb-1">📸</div>
                <div className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Tambah Foto Bukti</div>
              </div>
            </label>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || images.length === 0}
          className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-xl shadow-amber-900/20 active:scale-[0.98] transition-all"
        >
          {submitting ? "MEMPROSES..." : `KONFIRMASI RETURN (${images.length} FOTO)`}
        </Button>

      </main>
    </div>
  );
}
