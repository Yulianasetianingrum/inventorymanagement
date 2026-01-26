"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
    upsertSupplier: (formData: FormData) => Promise<void>;
    editing: any;
    editingItems: string;
};

export function SupplierForm({ upsertSupplier, editing, editingItems }: Props) {
    const [showMaps, setShowMaps] = useState(false);
    const [showAddress, setShowAddress] = useState(false);
    const [showPhone, setShowPhone] = useState(false);

    return (
        <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-xl md:text-2xl font-black text-navy mb-6">
                {editing ? "Update Info Supplier" : "Rekam Supplier Baru"}
            </h2>

            <form action={upsertSupplier} className="space-y-5">
                <input type="hidden" name="id" value={editing?.id ?? ""} />

                <div>
                    <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Nama Toko / Supplier</label>
                    <input
                        name="namaToko"
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all text-sm md:text-base"
                        defaultValue={editing?.namaToko ?? ""}
                        required
                        placeholder="Contoh: TB. Makmur Jaya"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-2">Kategori Barang (Pisahkan Koma)</label>
                    <input
                        name="keperluanItems"
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all text-sm md:text-base"
                        defaultValue={editingItems}
                        placeholder="HPL, Plywood, Fitting..."
                        required
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest">Alamat Lengkap</label>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => setShowAddress(!showAddress)}
                                className="text-xs text-navy/40 font-bold hover:text-navy transition-colors flex items-center gap-1"
                            >
                                {showAddress ? "🙈 Sembunyikan" : "👁️ Lihat"}
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <textarea
                            name="alamat"
                            className={`w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10 resize-none transition-all text-sm md:text-base ${!showAddress && editing ? "blur-sm select-none pointer-events-none opacity-50" : ""}`}
                            defaultValue={editing?.alamat ?? ""}
                        />
                        {!showAddress && editing && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="bg-navy/10 px-3 py-1 rounded-full text-xs font-bold text-navy/60">Tersembunyi</span>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest">Link Google Maps</label>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => setShowMaps(!showMaps)}
                                className="text-xs text-navy/40 font-bold hover:text-navy transition-colors flex items-center gap-1"
                            >
                                {showMaps ? "🙈 Sembunyikan" : "👁️ Lihat"}
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            name="mapsUrl"
                            className={`w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all text-sm md:text-base ${!showMaps && editing ? "text-transparent bg-slate-100 select-none" : ""}`}
                            defaultValue={editing?.mapsUrl ?? ""}
                        />
                        {!showMaps && editing && (
                            <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                                <span className="text-slate-400 tracking-widest">••••••••••••••••••••••••••••</span>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest">No. Telp / WhatsApp</label>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => setShowPhone(!showPhone)}
                                className="text-xs text-navy/40 font-bold hover:text-navy transition-colors flex items-center gap-1"
                            >
                                {showPhone ? "🙈 Sembunyikan" : "👁️ Lihat"}
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            name="noTelp"
                            className={`w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all text-sm md:text-base ${!showPhone && editing ? "text-transparent bg-slate-100 select-none" : ""}`}
                            defaultValue={editing?.noTelp ?? ""}
                        />
                        {!showPhone && editing && (
                            <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                                <span className="text-slate-400 tracking-widest">•••••••••••</span>
                            </div>
                        )}
                    </div>
                </div>

                <Button type="submit" className="bg-gold hover:bg-gold-light text-navy w-full !h-14 font-black uppercase tracking-widest mt-4 shadow-xl shadow-gold/20 rounded-xl text-sm md:text-base">
                    {editing ? "SIMPAN PERUBAHAN" : "AMANKAN DATA SUPPLIER"}
                </Button>

                {editing && (
                    <Link href="/supplier" className="block text-center mt-4 text-xs font-bold text-navy/40 hover:text-navy uppercase tracking-widest transition-colors py-2">
                        Batalkan Edit
                    </Link>
                )}
            </form>
        </div>
    );
}
