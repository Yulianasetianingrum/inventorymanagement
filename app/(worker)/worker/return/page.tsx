"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function ReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillItemName = searchParams.get("itemName");

  const [items, setItems] = useState<any[]>([]);

  // Form State
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState(prefillItemName || "");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    // Fetch items currently held by worker
    fetch("/api/worker/returns/held-items")
      .then(r => r.json())
      .then(d => {
        const heldItems = d.data || [];
        setItems(heldItems);

        // Auto-select if prefill matches
        if (prefillItemName) {
          const match = heldItems.find((i: any) => i.name === prefillItemName);
          if (match) {
            // We need to wait a tick or just call passing the match
            // But we can't call addItem easily here due to closure/dep array complexity 
            // So we'll just set it directly if not already present
            setSelectedItems(prev => {
              if (prev.find(p => p.sourceLineId === match.id)) return prev;
              return [...prev, {
                sourceLineId: match.id,
                itemId: match.itemId,
                name: match.name,
                brand: match.brand,
                size: match.size,
                qty: 1,
                unit: match.unit,
                maxQty: match.balance,
                projectName: match.projectName
              }];
            });
            setSearchTerm(""); // Clear search after auto-add
          } else {
            // If specific match not found, keep search term to show results
            setSearchTerm(prefillItemName);
          }
        }
      });
  }, [prefillItemName]);

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
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-12">
      <header className="bg-amber-600 pt-6 md:pt-10 pb-12 md:pb-16 px-4 md:px-8 rounded-b-[40px] shadow-2xl shadow-amber-900/20 relative shrink-0">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-amber-200 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Self-Service</div>
              <h1 className="text-xl md:text-3xl font-black text-white leading-tight">Return Barang</h1>
              <p className="text-white/60 text-[10px] md:text-xs mt-1 font-medium">Kembalikan tanggungan barang ke gudang bekas</p>
            </div>
            <button onClick={() => router.back()} className="text-white/60 hover:text-white bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold">
              Kembali
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 -mt-6 relative z-20 space-y-6 max-w-4xl mx-auto">

        {/* Item Selector */}
        <div className="bg-white p-5 rounded-[24px] shadow-lg border border-slate-100 relative z-30">
          <label className="block text-[10px] md:text-xs font-black text-navy/40 uppercase tracking-widest mb-2">Cari Barang Dipegang</label>
          <div className="relative">
            <input
              className="w-full h-12 md:h-14 bg-slate-50 rounded-xl px-4 pl-11 text-xs md:text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-amber-600/20 placeholder:text-slate-400"
              placeholder="Cari item atau project..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg grayscale">🔍</span>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-amber-600 font-bold text-lg w-8 h-8 flex items-center justify-center">×</button>
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
                      className="p-3 md:p-4 hover:bg-amber-50 rounded-xl cursor-pointer flex justify-between items-center group transition-colors mb-1 last:mb-0"
                    >
                      <div>
                        <div className="font-bold text-navy text-xs md:text-sm group-hover:text-amber-700">{item.name}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.brand} • {item.size}</div>
                        <div className="text-[9px] font-bold text-amber-600 mt-1 uppercase">📍 {item.projectName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-600 font-black text-xs md:text-sm">{item.balance} <span className="text-[9px] opacity-60 uppercase">{item.unit}</span></div>
                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">DI TANGAN</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-3xl mb-2">🤷‍♂️</div>
                  <div className="text-sm font-bold text-navy">Item tidak ditemukan</div>
                  <div className="text-[10px] text-slate-400 mt-1">Pastikan nama barang benar</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Items List */}
        {selectedItems.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-navy uppercase tracking-widest px-1">Barang Dikembalikan ({selectedItems.length})</h3>
            {selectedItems.map((item) => (
              <div key={item.sourceLineId} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/20"></div>
                <div className="flex justify-between items-start mb-4 pl-2">
                  <div className="flex-1">
                    <h4 className="font-black text-navy text-sm md:text-base leading-tight">{item.name}</h4>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">📍 {item.projectName}</p>
                  </div>
                  <button onClick={() => removeItem(item.sourceLineId)} className="w-8 h-8 md:w-10 md:h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-bold hover:bg-red-100 transition-colors">×</button>
                </div>

                <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-dashed border-slate-200 ml-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-[8px] md:text-[9px] font-black text-navy/40 uppercase tracking-widest mb-1.5">Jumlah Di Kembalikan</label>
                      <input
                        type="number"
                        min="1"
                        max={item.maxQty}
                        className="w-full h-10 md:h-12 bg-white rounded-xl px-4 font-black text-navy text-lg focus:outline-none border border-slate-200 focus:border-amber-500/30 text-center"
                        value={item.qty}
                        onChange={e => updateQty(item.sourceLineId, Number(e.target.value))}
                      />
                    </div>
                    <div className="text-right min-w-[30%]">
                      <span className="block text-[8px] md:text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Maksimal Sisa</span>
                      <div className="text-navy font-black text-sm md:text-base bg-white border border-slate-100 px-3 py-2 rounded-lg text-center">{item.maxQty} <span className="text-[8px] text-slate-400 font-bold uppercase">{item.unit}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Camera Evidence Sections */}
        <div className="bg-white p-6 rounded-[24px] shadow-lg border border-slate-100 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 bg-amber-50 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">
            Evidence - Bukti Balik Gudang
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
              <div className="w-full h-24 md:h-32 rounded-3xl border-2 border-dashed border-amber-900/10 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-amber-50 transition-all">
                <div className="text-3xl mb-2">📸</div>
                <div className="text-xs md:text-sm font-black text-navy/60 uppercase tracking-widest">Tambah Foto Bukti</div>
              </div>
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 pb-20">
          <Button
            onClick={handleSubmit}
            disabled={submitting || images.length === 0}
            className="w-full h-16 md:h-20 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm md:text-lg rounded-[24px] shadow-2xl shadow-amber-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {submitting ? "MEMPROSES..." : `KONFIRMASI RETURN (${images.length} FOTO)`}
          </Button>
        </div>

      </main>
    </div>
  );
}

export default function AdHocReturnPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading form...</div>}>
      <ReturnContent />
    </Suspense>
  );
}
