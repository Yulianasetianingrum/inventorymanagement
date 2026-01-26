"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WorkerPicklistDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [picklist, setPicklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Multi-image state
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Return states
  const [returnLines, setReturnLines] = useState<any[]>([]);
  // Picking modes state
  const [lineModes, setLineModes] = useState<Record<string, "baru" | "bekas">>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/worker/picklists/${id}`);

        if (!res.ok) {
          const text = await res.text();
          console.error("API Error Status:", res.status, text.slice(0, 100));
          setLoading(false);
          return;
        }

        const json = await res.json();
        if (json.data) {
          setPicklist(json.data);
          const modes: Record<string, "baru" | "bekas"> = {};
          json.data.lines?.forEach((l: any) => {
            modes[l.id] = (l.stockMode as "baru" | "bekas") || "baru";
          });
          setLineModes(modes);

          setReturnLines(json.data.lines?.map((l: any) => ({
            id: l.id,
            usedQty: l.pickedQty,
            returnedQty: 0,
            addToStock: true
          })) || []);
        } else {
          console.error("Fetch Error:", json.error);
        }
      } catch (err) {
        console.error("Load Picklist Details Error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleStart() {
    const res = await fetch(`/api/worker/picklists/${id}/start`, { method: "POST" });
    if (res.ok) window.location.reload();
  }

  async function handleFinishPicking() {
    if (images.length === 0) return alert("Mohon lampirkan minimal 1 foto bukti pengambilan.");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/worker/picklists/${id}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          lineModes // Send the selected modes to the backend
        })
      });
      if (res.ok) window.location.reload();
      else {
        alert("Gagal menyelesaikan picking");
        setSubmitting(false);
      }
    } catch (e) {
      setSubmitting(false);
    }
  }

  async function handleReturn() {
    if (images.length === 0) return alert("Mohon lampirkan minimal 1 foto bukti pengembalian.");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/worker/picklists/${id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, lines: returnLines })
      });
      if (res.ok) router.push("/worker/picklists");
      else {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        alert("Gagal menyelesaikan return: " + (err.error || "Server Error"));
        setSubmitting(false);
      }
    } catch (e) {
      setSubmitting(false);
    }
  }

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
          if (file.size > 10 * 1024 * 1024) continue; // Skip huge files
          const compressed = await compressImage(file, 50);
          newImages.push(compressed);
        }

        setImages(prev => [...prev, ...newImages]);
      } catch (err) {
        console.error("Compression failed", err);
        alert("Gagal memproses beberapa gambar");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-off-white">
      <div className="w-12 h-12 border-4 border-navy/10 border-t-navy rounded-full animate-spin" />
    </div>
  );

  if (!picklist) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-black text-navy mb-2">Manifest Tidak Ditemukan</h2>
      <button onClick={() => router.back()} className="btn-primary">Kembali ke List</button>
    </div>
  );

  const isReady = picklist.status === 'READY';
  const isPicking = picklist.status === 'PICKING';
  const isPicked = picklist.status === 'PICKED';
  const isDelivered = picklist.status === 'DELIVERED';

  // Helper to get existing evidence based on current stage
  const getExistingEvidence = (type: "PICKING" | "RETURN") => {
    if (!picklist.evidence) return [];
    const ev = picklist.evidence.filter((e: any) => e.type === type).map((e: any) => e.imageUrl);
    return ev;
  };

  // Fallback to legacy columns if no evidence relation found (consistency check)
  const legacyPicking = picklist.pickingImage ? [picklist.pickingImage] : [];
  const legacyReturn = picklist.returnImage ? [picklist.returnImage] : [];

  const existingPickingImages = getExistingEvidence("PICKING").length > 0 ? getExistingEvidence("PICKING") : legacyPicking;
  const existingReturnImages = getExistingEvidence("RETURN").length > 0 ? getExistingEvidence("RETURN") : legacyReturn;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 md:pb-12">
      {/* Dynamic Header */}
      <header className={`pt-6 md:pt-10 pb-12 md:pb-16 px-4 md:px-8 rounded-b-[40px] shadow-2xl transition-colors duration-500 shrink-0 ${isReady ? 'bg-warning' : isPicking ? 'bg-accent' : isPicked ? 'bg-success' : isDelivered ? 'bg-slate-700' : 'bg-navy'
        }`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/10 active:scale-95 transition-all text-xl hover:bg-white/30"
            >
              ←
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">{picklist.code}</h1>
                <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase backdrop-blur-sm">{picklist.status}</span>
              </div>
              <div className="text-[10px] md:text-xs font-black text-white/60 uppercase tracking-widest mt-1">Operational Task</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-[24px]">
            <div className="bg-white/95 p-5 md:p-6 rounded-[20px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Project / Destinasi</span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-tighter ${picklist.mode === 'EXTERNAL' ? 'bg-gold/10 text-gold-deep border-gold/20' : 'bg-navy/5 text-navy/40 border-navy/10'
                  }`}>{picklist.mode}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-navy leading-tight mb-1">{picklist.project?.namaProjek}</h2>
              <p className="text-xs md:text-sm font-bold text-navy/60">{picklist.project?.namaKlien}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 -mt-6 space-y-6 max-w-4xl mx-auto">
        {/* Notes Card */}
        {picklist.notes && (
          <div className="bg-white p-5 rounded-[24px] shadow-lg shadow-slate-200/50 border-l-4 border-l-gold relative z-20">
            <p className="text-sm font-semibold text-navy/70 italic leading-relaxed">
              " {picklist.notes} "
            </p>
          </div>
        )}

        {/* Item List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs md:text-sm font-black text-navy uppercase tracking-[0.2em]">Daftar Manifest Barang</h3>
            <span className="text-[10px] md:text-xs font-bold text-navy/30 bg-navy/5 px-2 py-1 rounded-lg">{picklist.lines?.length} Items</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {picklist.lines?.map((l: any) => (
              <div key={l.id} className="bg-white p-5 rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-navy text-base md:text-lg leading-tight truncate">{l.item.name}</h4>
                    <p className="text-[10px] md:text-xs font-black text-navy/30 uppercase tracking-widest mt-1">{l.item.brand} • {l.item.size}</p>
                  </div>
                  <div className="bg-navy text-gold p-2 md:p-3 rounded-xl text-center min-w-[50px] md:min-w-[60px] shadow-lg shadow-navy/10 shrink-0">
                    <div className="text-xl md:text-2xl font-black leading-none">{l.reqQty}</div>
                    <div className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter opacity-70 mt-0.5">{l.item.unit}</div>
                  </div>
                </div>

                {/* Rack Location Highlight */}
                <div className="bg-gold/5 border border-gold/20 rounded-xl p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg grayscale-0 shrink-0">📍</span>
                    <span className="text-[10px] md:text-xs font-black text-gold-deep uppercase tracking-widest truncate">LOKASI GUDANG</span>
                  </div>
                  <span className="bg-gold text-navy font-black text-[10px] md:text-xs px-3 py-1 rounded-lg shadow-sm shrink-0">
                    {l.item.storageLocation?.name || l.item.locationLegacy || "RAK TIDAK TERDATA"}
                  </span>
                </div>

                {/* Stock Mode Selection (In Picking Stage) */}
                {isPicking && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setLineModes(prev => ({ ...prev, [l.id]: "baru" }))}
                      className={`flex-1 h-10 md:h-11 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${lineModes[l.id] === "baru" ? "bg-navy text-gold shadow-lg shadow-navy/20 border-2 border-gold/20 scale-[1.02]" : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100"}`}
                    >
                      ✨ BARU ({l.item.stockNew})
                    </button>
                    <button
                      onClick={() => setLineModes(prev => ({ ...prev, [l.id]: "bekas" }))}
                      className={`flex-1 h-10 md:h-11 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${lineModes[l.id] === "bekas" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20 border-2 border-amber-500/20 scale-[1.02]" : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100"}`}
                    >
                      ♻️ BEKAS ({l.item.stockUsed})
                    </button>
                  </div>
                )}

                {/* Status Indicator (Already Finished) */}
                {(isPicked || isDelivered) && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-navy/30 uppercase tracking-widest shrink-0">DIAMBIL DARI:</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${l.stockMode === "baru" ? "bg-navy/5 text-navy" : "bg-amber-50 text-amber-600"}`}>
                      {l.stockMode === "baru" ? "✨ BARU" : "♻️ BEKAS"}
                    </span>
                  </div>
                )}

                {/* Return Inputs (Only when PICKED or DELIVERED) */}
                {(isPicked || isDelivered) && (
                  <div className="mt-4 pt-4 border-t border-navy/5">
                    {/* View Only Stats */}
                    <div className="flex items-center justify-between text-xs font-bold text-navy/60 bg-navy/5 p-3 rounded-xl mb-3">
                      <div>
                        <span className="block text-[8px] uppercase tracking-widest opacity-60">Digunakan</span>
                        {l.usedQty} {l.item.unit}
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] uppercase tracking-widest opacity-60">Dikembalikan</span>
                        {l.returnedQty} {l.item.unit}
                      </div>
                    </div>

                    {/* Return Action */}
                    <button
                      onClick={() => router.push(`/worker/return?projectId=${picklist.project?.id}&itemName=${encodeURIComponent(l.item.name)}`)}
                      className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>♻️</span>
                      <span>Kembalikan Item Ini</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="space-y-6 pb-20">
          {isReady && (
            <button
              onClick={handleStart}
              className="btn-gold w-full !h-16 md:!h-20 text-lg group relative overflow-hidden active:scale-95 shadow-2xl shadow-gold/30 rounded-2xl"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl">🚀</span>
                <span>MULAI MENGERJAKAN TUGAS</span>
              </div>
            </button>
          )}

          {(isPicking || isPicked || (isDelivered && (existingPickingImages.length > 0))) && (
            <div className="space-y-6">

              {/* Picking Evidence */}
              {(isPicking || existingPickingImages.length > 0) && (
                <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-lg shadow-slate-200/50 border border-slate-100 text-center">
                  <div className="inline-block px-4 py-1.5 bg-navy/5 rounded-full text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] mb-6">
                    Evidence - Pengambilan
                  </div>

                  {/* Grid Display */}
                  {(isPicking ? images : existingPickingImages).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {(isPicking ? images : existingPickingImages).map((url: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
                          <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={`Evidence ${idx}`} />
                          {(isPicking && !submitting) && (
                            <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors">×</button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    isDelivered && <div className="text-xs text-navy/40 italic mb-4">Tidak ada bukti foto</div>
                  )}

                  {/* Upload Button */}
                  {(isPicking && !submitting) && (
                    <label className="block relative cursor-pointer group mb-6">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      />
                      <div className="w-full h-24 md:h-32 rounded-3xl border-2 border-dashed border-navy/10 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-navy/5 transition-all">
                        <div className="text-3xl mb-2">📸</div>
                        <div className="text-xs md:text-sm font-black text-navy/60 uppercase tracking-widest">Tambah Foto (Max 50)</div>
                      </div>
                    </label>
                  )}

                  {isPicking && (images.length > 0) && (
                    <button
                      onClick={handleFinishPicking}
                      disabled={submitting}
                      className="btn-gold w-full !h-16 shadow-2xl shadow-gold/40 active:scale-95 transition-all text-sm md:text-base"
                    >
                      {submitting ? "MENGOLAH DATA..." : `KONFIRMASI SELESAI (${images.length} FOTO)`}
                    </button>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Post-Delivery Actions */}
          {isDelivered && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-black text-navy/40 uppercase tracking-widest text-center mb-2">Tindakan Lanjutan</h4>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => router.push('/worker/scan')} className="bg-white border border-navy/10 p-6 rounded-[24px] shadow-sm active:scale-95 transition-all text-center hover:shadow-lg hover:border-navy/20">
                  <div className="text-3xl mb-2">📦</div>
                  <div className="text-[10px] md:text-xs font-black text-navy uppercase">Ambil Barang</div>
                </button>
                <button onClick={() => router.push('/worker/return')} className="bg-white border border-navy/10 p-6 rounded-[24px] shadow-sm active:scale-95 transition-all text-center hover:shadow-lg hover:border-navy/20">
                  <div className="text-3xl mb-2">♻️</div>
                  <div className="text-[10px] md:text-xs font-black text-navy uppercase">Return Barang</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Status Badge - Only for desktop/large screens to avoid clutter on mobile */}
      <div className="hidden md:block fixed bottom-10 left-10 glass px-6 py-3 rounded-full border-white/20 shadow-2xl z-50 pointer-events-none">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isReady ? 'bg-warning' : isPicking ? 'bg-accent' : isPicked ? 'bg-success' : isDelivered ? 'bg-slate-700' : 'bg-navy'
            }`} />
          <span className="text-[10px] font-black text-navy uppercase tracking-widest">Sistem Operasional Aktif</span>
        </div>
      </div>
    </div>
  );
}
