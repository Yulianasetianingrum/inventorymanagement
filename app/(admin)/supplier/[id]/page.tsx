import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const id = Number(resolvedParams?.id);

    if (!id) return notFound();

    const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: {
            stockInBatches: {
                orderBy: { date: "desc" },
                take: 50,
                include: {
                    item: true,
                },
            },
            _count: {
                select: { stockInBatches: true },
            },
        },
    });

    if (!supplier) return notFound();

    // Fetch all batches for accurate totals (lightweight select)
    const allBatches = await prisma.stockInBatch.findMany({
        where: { supplierId: id },
        select: { qtyInBase: true, unitCost: true }
    });

    // Calculate totals from full history
    const totalSpend = allBatches.reduce((sum, b) => sum + (Number(b.qtyInBase) * Number(b.unitCost)), 0);
    const totalItems = allBatches.reduce((sum, b) => sum + Number(b.qtyInBase), 0);

    // Formatter for currency
    const formatMoney = (amount: number) => {
        if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}jt`;
        if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}rb`;
        return `Rp ${amount.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24">
            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-navy text-white rounded-lg flex items-center justify-center shadow-lg shadow-navy/20">
                        <img src="/logo/apix.png" alt="Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xs md:text-sm font-black text-navy uppercase tracking-wider leading-none">Apix Interior</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Supplier Profile</div>
                    </div>
                </div>
                <Link href="/supplier">
                    <Button className="bg-white hover:bg-gray-50 text-navy text-[10px] md:text-xs font-bold uppercase tracking-wider h-8 md:h-9 px-3 md:px-4 border border-gray-200 rounded-lg shadow-sm">
                        ← Directory
                    </Button>
                </Link>
            </header>

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-navy/5 overflow-hidden mb-8">
                    <div className="bg-navy p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gold opacity-10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                        Trusted Supplier
                                    </span>
                                    {supplier.noTelp && (
                                        <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20 flex items-center gap-1">
                                            Verified WA
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2">
                                    {supplier.namaToko}
                                </h1>
                                <p className="text-white/60 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
                                    {supplier.alamat}
                                </p>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                {supplier.mapsUrl && (
                                    <a
                                        href={supplier.mapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 md:flex-none h-12 px-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-wide text-xs transition-all backdrop-blur-sm"
                                    >
                                        <span>🗺️</span> Maps
                                    </a>
                                )}
                                {supplier.noTelp && (
                                    <a
                                        href={`https://wa.me/${supplier.noTelp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 md:flex-none h-12 px-6 bg-[#25d366] text-white rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-wide text-xs transition-all shadow-lg hover:brightness-105"
                                    >
                                        <span>💬</span> Chat WA
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                        <div className="p-6 text-center">
                            <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-1">Total Transaksi</div>
                            <div className="text-2xl font-black text-navy">{supplier._count.stockInBatches}x</div>
                        </div>
                        <div className="p-6 text-center">
                            <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-1">Total Belanja</div>
                            <div className="text-2xl font-black text-navy">{formatMoney(totalSpend)}</div>
                        </div>
                        <div className="p-6 text-center">
                            <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-1">Total Item</div>
                            <div className="text-2xl font-black text-navy">{totalItems}</div>
                        </div>
                        <div className="p-6 text-center bg-gold/5">
                            <div className="text-[10px] font-black text-gold-deep/60 uppercase tracking-widest mb-1">Status</div>
                            <div className="text-2xl font-black text-gold-deep">Active</div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-navy tracking-tight">Riwayat Supply</h2>
                        {/* <button className="text-[10px] font-bold text-navy/50 uppercase tracking-widest hover:text-navy">View All</button> */}
                    </div>

                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                        {supplier.stockInBatches.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-navy/5 border-b border-navy/5">
                                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Tanggal</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">Item</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest text-center">Qty</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest text-right">Harga Satuan</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-navy/40 uppercase tracking-widest text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {supplier.stockInBatches.map((b) => (
                                            <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-navy/70 whitespace-nowrap">
                                                    {new Date(b.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-navy">{b.item.name}</td>
                                                <td className="px-6 py-4 font-black text-navy text-center bg-navy/5 rounded-lg">{Number(b.qtyInBase)}</td>
                                                <td className="px-6 py-4 font-medium text-navy/60 text-right">Rp {Number(b.unitCost).toLocaleString()}</td>
                                                <td className="px-6 py-4 font-black text-navy text-right">Rp {(Number(b.qtyInBase) * Number(b.unitCost)).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <div className="text-4xl mb-4">📦</div>
                                <div className="text-navy/30 font-black uppercase tracking-widest text-xs">Belum ada riwayat transaksi</div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
