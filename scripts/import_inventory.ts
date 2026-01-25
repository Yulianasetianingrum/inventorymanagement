
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Data Barang & Stok Awal
 * Edit array di bawah ini untuk menambah barang baru.
 * qty: Jumlah stok baru
 * cost: Harga beli per unit
 */
const inventoryData = [
    { barcode: '840214804694', name: 'Multi Tool 12 in 1', brand: 'Gentlemen’s Hardware', category: 'Hand Tools', locationLegacy: 'Gudang', size: '12-in-1', unit: 'pcs', qty: 10, cost: 50000 },
    { barcode: '778862064224', name: 'Home Tool Set', brand: 'TACKLIFE', category: 'Tool Set', locationLegacy: 'Gudang', size: '57 pcs', unit: 'set', qty: 5, cost: 250000 },
    { barcode: '716350797988', name: 'Multi Tool Hammer', brand: 'RAK Pro Tools', category: 'Hand Tools', locationLegacy: 'Gudang', size: '12-in-1', unit: 'pcs', qty: 8, cost: 75000 },
    { barcode: '038728037060', name: 'Home Tool Kit', brand: 'General Tools', category: 'Tool Set', locationLegacy: 'Gudang', size: '39 pcs', unit: 'set', qty: 12, cost: 150000 },
    { barcode: '681035017982', name: 'Precision Tool Set', brand: 'General Tools', category: 'Precision Tools', locationLegacy: 'Gudang', size: '11 pcs', unit: 'set', qty: 20, cost: 45000 },
    { barcode: '711639924451', name: 'Home Repair Tool Kit', brand: 'DEKOPRO', category: 'Tool Set', locationLegacy: 'Gudang', size: '198 pcs', unit: 'set', qty: 3, cost: 450000 },

    { barcode: '313055857810', name: 'Tool Kit Set', brand: 'Trademark Tools', category: 'Tool Set', locationLegacy: 'Gudang', size: '130 pcs', unit: 'set', qty: 4, cost: 350000 },
    { barcode: '850039064586', name: 'Magnetic Screwdriver Set', brand: 'INTERTOOL', category: 'Screwdrivers', locationLegacy: 'Gudang', size: '114 pcs', unit: 'set', qty: 6, cost: 180000 },
    { barcode: '680666946241', name: 'Screwdriver Bit Set', brand: 'TACKLIFE', category: 'Bits', locationLegacy: 'Gudang', size: 'PTA01A', unit: 'set', qty: 10, cost: 120000 },
    { barcode: '680666907860', name: 'Circular Saw', brand: 'TACKLIFE', category: 'Power Tools', locationLegacy: 'Gudang', size: '7-1/2 inch', unit: 'pcs', qty: 2, cost: 1250000 },
    { barcode: '763615763301', name: 'Swiss Army Multitool', brand: 'Victorinox', category: 'Multi Tools', locationLegacy: 'Gudang', size: 'Traveler', unit: 'pcs', qty: 7, cost: 850000 },
    { barcode: '746160715612', name: 'Swiss Army Multitool', brand: 'Victorinox', category: 'Multi Tools', locationLegacy: 'Gudang', size: 'Limited Edition', unit: 'pcs', qty: 2, cost: 1500000 },

    { barcode: '0406381333931', name: 'Multi Purpose Tool Set', brand: 'Generic', category: 'Hand Tools', locationLegacy: 'Gudang', size: 'Assorted', unit: 'set', qty: 15, cost: 100000 },
    { barcode: '728370450088', name: 'Mini Pliers Set', brand: 'Generic', category: 'Pliers', locationLegacy: 'Gudang', size: 'Mini', unit: 'set', qty: 18, cost: 35000 },
    { barcode: '797681946238', name: 'Wire Cutter Pliers', brand: 'Kingsdun', category: 'Pliers', locationLegacy: 'Gudang', size: 'Flush Cutter', unit: 'pcs', qty: 22, cost: 40000 },
    { barcode: '711639924452', name: 'Socket Extension Set', brand: 'DEKOPRO', category: 'Socket Tools', locationLegacy: 'Gudang', size: 'Extension Set', unit: 'set', qty: 9, cost: 95000 },
    { barcode: '711639924453', name: 'Ratchet Handle Set', brand: 'DEKOPRO', category: 'Socket Tools', locationLegacy: 'Gudang', size: 'Ratchet', unit: 'set', qty: 6, cost: 110000 },
    { barcode: '840332391281', name: 'Furniture Assembly Tool Kit', brand: 'YITAHOME', category: 'Furniture Tools', locationLegacy: 'Gudang', size: 'Assembly Kit', unit: 'set', qty: 8, cost: 140000 },

    { barcode: '810081949812', name: 'Compact Multi Tool', brand: 'Gentlemen’s Hardware', category: 'Multi Tools', locationLegacy: 'Gudang', size: 'Compact', unit: 'pcs', qty: 11, cost: 220000 },
    { barcode: '850039064587', name: 'Magnetic Driver Set', brand: 'INTERTOOL', category: 'Screwdrivers', locationLegacy: 'Gudang', size: 'Driver Set', unit: 'set', qty: 7, cost: 160000 },
    { barcode: '778862064225', name: 'Home Tool Set', brand: 'TACKLIFE', category: 'Tool Set', locationLegacy: 'Gudang', size: '60 pcs', unit: 'set', qty: 5, cost: 280000 },
    { barcode: '716350797990', name: 'Mini Tool Kit', brand: 'RAK Pro Tools', category: 'Tool Set', locationLegacy: 'Gudang', size: 'Compact', unit: 'set', qty: 10, cost: 90000 },
    { barcode: '0038728037060', name: 'Basic Home Tool Kit', brand: 'General Tools', category: 'Tool Set', locationLegacy: 'Gudang', size: 'WS-0101', unit: 'set', qty: 14, cost: 130000 },
    { barcode: '08442960668036', name: 'Large Tool Kit', brand: 'Generic', category: 'Tool Set', locationLegacy: 'Gudang', size: '130 pcs', unit: 'set', qty: 4, cost: 320000 },
    { barcode: '731161037559', name: 'Tool Box Organizer', brand: 'Keter', category: 'Storage', locationLegacy: 'Gudang', size: '18 inch', unit: 'pcs', qty: 6, cost: 275000 },

    { barcode: '6973107486746', name: 'Cross Screwdriver', brand: 'Deli Tools', category: 'Screwdrivers', locationLegacy: 'Gudang', size: 'PH1 x 75mm Yellow', unit: 'pcs', qty: 30, cost: 18000 }
];


async function main() {
    console.log("🚀 Memulai proses import barang & stok...");

    for (const data of inventoryData) {
        const { qty, cost, ...itemInfo } = data;

        // 1. Upsert Item (Cari berdasarkan barcode)
        const item = await prisma.item.upsert({
            where: { barcode: itemInfo.barcode },
            update: itemInfo,
            create: itemInfo,
        });

        // 2. Jika ada qty > 0, buat batch stok baru
        if (qty > 0) {
            await prisma.$transaction([
                prisma.stockInBatch.create({
                    data: {
                        itemId: item.id,
                        date: new Date(),
                        qtyInBase: BigInt(qty),
                        qtyRemaining: BigInt(qty),
                        unitCost: BigInt(cost),
                        note: "mode:baru||Import Awal",
                    },
                }),
                prisma.item.update({
                    where: { id: item.id },
                    data: { stockNew: { increment: qty } }
                })
            ]);
            console.log(`✅ ${item.name}: Terdaftar dengan stok ${qty}`);
        } else {
            console.log(`✅ ${item.name}: Terdaftar (Stok 0)`);
        }
    }

    console.log("\n✨ Selesai! Semua data sudah masuk ke 'items' dan 'stock_in_batches'.");
}

main()
    .catch((e) => {
        console.error("❌ Error saat import:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
