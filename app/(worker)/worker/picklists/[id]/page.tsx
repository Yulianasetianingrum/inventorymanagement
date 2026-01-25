"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WorkerPicklistDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [picklist, setPicklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Return states
  const [returnLines, setReturnLines] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/admin/picklists/${id}`)
      .then(res => res.json())
      .then(json => {
        setPicklist(json.data);
        if (json.data?.lines) {
          setReturnLines(json.data.lines.map((l: any) => ({
            id: l.id,
            usedQty: l.pickedQty,
            returnedQty: 0,
            addToStock: true
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleStart() {
    const res = await fetch(`/api/worker/picklists/${id}/start`, { method: "POST" });
    if (res.ok) window.location.reload();
  }

  async function handleFinishPicking() {
    if (!image) return alert("Mohon lampirkan foto bukti pengambilan (scan).");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/worker/picklists/${id}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      });
      if (res.ok) window.location.reload();
      else alert("Gagal menyelesaikan picking");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReturn() {
    if (!image) return alert("Mohon lampirkan foto bukti pengembalian (scan).");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/worker/picklists/${id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, lines: returnLines })
      });
      if (res.ok) router.push("/worker/picklists");
      else alert("Gagal menyelesaikan return");
    } finally {
      setSubmitting(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
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

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* Dynamic Header */}
      <header className={`pt-8 pb-12 px-6 rounded-b-[40px] shadow-2xl transition-colors duration-500 ${isReady ? 'bg-warning' : isPicking ? 'bg-accent' : isPicked ? 'bg-success' : 'bg-navy'
        }`}>
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/10 active:scale-95 transition-all text-xl"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white tracking-tight">{picklist.code}</h1>
            <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">{picklist.status} — Operational Task</div>
          </div>
        </div>

        <div className="premium-card p-1 bg-white/10 backdrop-blur-md border-white/20">
          <div className="bg-white/90 p-5 rounded-[19px]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Project / Destinasi</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-tighter ${picklist.mode === 'EXTERNAL' ? 'bg-gold/10 text-gold-deep border-gold/20' : 'bg-navy/5 text-navy/40 border-navy/10'
                }`}>{picklist.mode}</span>
            </div>
            <h2 className="text-lg font-black text-navy leading-tight mb-1">{picklist.project?.namaProjek}</h2>
            <p className="text-xs font-bold text-navy/60">{picklist.project?.namaKlien}</p>
          </div>
        </div>
      </header>

      <main className="px-6 -mt-6 space-y-8">
        {/* Notes Card */}
        {picklist.notes && (
          <div className="premium-card p-4 bg-white/80 border-gold/20 border-l-4 border-l-gold">
            <p className="text-sm font-semibold text-navy/70 italic leading-relaxed">
              " {picklist.notes} "
            </p>
          </div>
        )}

        {/* Item List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-navy uppercase tracking-[0.2em]">Daftar Manifest Barang</h3>
            <span className="text-[10px] font-bold text-navy/30">{picklist.lines?.length} Items</span>
          </div>

          {picklist.lines?.map((l: any) => (
            <div key={l.id} className="premium-card p-1">
              <div className="bg-white p-5 rounded-[19px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-black text-navy text-base leading-tight">{l.item.name}</h4>
                    <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest">{l.item.brand} • {l.item.size}</p>
                  </div>
                  <div className="bg-navy text-gold p-2 rounded-xl text-center min-w-[50px] shadow-lg shadow-navy/10">
                    <div className="text-xl font-black leading-none">{l.reqQty}</div>
                    <div className="text-[7px] font-black uppercase tracking-tighter opacity-70">{l.item.unit}</div>
                  </div>
                </div>

                {/* Rack Location Highlight */}
                <div className="bg-gold/5 border border-gold/20 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg grayscale-0">📍</span>
                    <span className="text-xs font-black text-gold-deep uppercase tracking-widest">LOKASI GUDANG:</span>
                  </div>
                  <span className="bg-gold text-navy font-black text-xs px-3 py-1 rounded-lg shadow-sm">
                    {l.item.storageLocation?.name || "RAK TIDAK TERDATA"}
                  </span>
                </div>

                {/* Return Inputs (Only when PICKED) */}
                {isPicked && (
                  <div className="mt-6 pt-6 border-t border-navy/5 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Digunakan (Pcs)</label>
                        <input
                          type="number"
                          className="w-full h-12 bg-navy/5 border border-navy/10 rounded-xl text-center font-black text-navy focus:ring-2 focus:ring-gold focus:outline-none"
                          value={returnLines.find(rl => rl.id === l.id)?.usedQty}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setReturnLines(returnLines.map(rl => rl.id === l.id ? { ...rl, usedQty: val, returnedQty: l.pickedQty - val } : rl));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Sisa / Return</label>
                        <div className="w-full h-12 bg-success/5 border border-dashed border-success/30 rounded-xl flex items-center justify-center font-black text-success">
                          {returnLines.find(rl => rl.id === l.id)?.returnedQty}
                        </div>
                      </div>
                    </div>

                    {/* Stock Back Toggle */}
                    {returnLines.find(rl => rl.id === l.id)?.returnedQty > 0 && (
                      <div className="flex items-center justify-between p-4 bg-navy/5 rounded-2xl border border-navy/10 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">♻️</span>
                          <div>
                            <div className="text-[10px] font-black text-navy uppercase tracking-widest">Masuk Stok Bekas?</div>
                            <div className="text-[9px] font-bold text-navy/40 uppercase tracking-tighter leading-none">Kembalikan ke rak gudang</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReturnLines(returnLines.map(rl => rl.id === l.id ? { ...rl, addToStock: !rl.addToStock } : rl));
                          }}
                          className={`w-14 h-8 rounded-full transition-all relative ${returnLines.find(rl => rl.id === l.id)?.addToStock ? 'bg-success' : 'bg-navy/20'
                            }`}
                        >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${returnLines.find(rl => rl.id === l.id)?.addToStock ? 'left-7' : 'left-1'
                            }`} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Center */}
        <div className="space-y-6">
          {isReady && (
            <button
              onClick={handleStart}
              className="btn-gold w-full !h-16 group relative overflow-hidden active:scale-95 shadow-2xl shadow-gold/30"
            >
              <div className="relative z-10 flex items-center gap-3">
                <span className="text-xl">🚀</span>
                <span>MULAI MENGERJAKAN TUGAS</span>
              </div>
            </button>
          )}

          {(isPicking || isPicked) && (
            <div className="space-y-6">
              <div className="premium-card p-1">
                <div className="bg-white p-6 rounded-[19px] text-center">
                  <div className="inline-block px-3 py-1 bg-navy/5 rounded-full text-[9px] font-black text-navy/40 uppercase tracking-[0.2em] mb-4">
                    Evidence Mandatory Stage
                  </div>
                  <h4 className="text-base font-black text-navy mb-6 tracking-tight">Lampirkan Bukti Foto (Scan)</h4>

                  <label className="block relative cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    <div className={`w-full h-40 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${image ? 'border-success bg-success/5' : 'border-navy/10 bg-off-white group-hover:bg-navy/5'
                      }`}>
                      {image ? (
                        <img src={image} alt="Preview" className="w-full h-full object-cover rounded-[22px]" />
                      ) : (
                        <>
                          <div className="text-3xl mb-2">📸</div>
                          <div className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Klik untuk Ambil Foto</div>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {isPicking && (
                <button
                  onClick={handleFinishPicking}
                  disabled={submitting || !image}
                  className={`btn-gold w-full !h-16 shadow-2xl transition-all ${!image ? 'opacity-30 grayscale' : 'shadow-gold/40 active:scale-95'
                    }`}
                >
                  {submitting ? "MENGOLAH DATA..." : "KONFIRMASI SELESAI AMBIL"}
                </button>
              )}

              {isPicked && (
                <button
                  onClick={handleReturn}
                  disabled={submitting || !image}
                  className={`btn-primary w-full !h-16 !bg-success shadow-2xl transition-all ${!image ? 'opacity-30 grayscale' : 'shadow-success/40 active:scale-95'
                    }`}
                >
                  {submitting ? "MENGOLAH DATA..." : "SELESAIKAN PROJEK & RETURN"}
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Status Badge at very bottom mobile behavior */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full border-white/20 shadow-2xl z-50 pointer-events-none">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isReady ? 'bg-warning' : isPicking ? 'bg-accent' : isPicked ? 'bg-success' : 'bg-navy'
            }`} />
          <span className="text-[10px] font-black text-navy uppercase tracking-widest">Sistem Operasional Aktif</span>
        </div>
      </div>
    </div>
  );
}
