
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const items = [
    { barcode: '840214804694', name: 'Multi Tool 12 in 1', brand: 'Gentlemen’s Hardware', category: 'Hand Tools', locationLegacy: 'Gudang', size: '12-in-1', unit: 'pcs', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '778862064224', name: 'Home Tool Set', brand: 'TACKLIFE', category: 'Tool Set', locationLegacy: 'Gudang', size: '57 pcs', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '716350797988', name: 'Multi Tool Hammer', brand: 'RAK Pro Tools', category: 'Hand Tools', locationLegacy: 'Gudang', size: '12-in-1', unit: 'pcs', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '038728037060', name: 'Home Tool Kit', brand: 'General Tools', category: 'Tool Set', locationLegacy: 'Gudang', size: '39 pcs', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '681035017982', name: 'Precision Tool Set', brand: 'General Tools', category: 'Precision Tools', locationLegacy: 'Gudang', size: '11 pcs', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '711639924451', name: 'Home Repair Tool Kit', brand: 'DEKOPRO', category: 'Tool Set', locationLegacy: 'Gudang', size: '198 pcs', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '313055857810', name: 'Tool Kit Set', brand: 'Trademark Tools', category: 'Tool Set', locationLegacy: 'Gudang', size: '130 pcs', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '850039064586', name: 'Magnetic Screwdriver Set', brand: 'INTERTOOL', category: 'Screwdrivers', locationLegacy: 'Gudang', size: '114 pcs', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '680666946241', name: 'Screwdriver Bit Set', brand: 'TACKLIFE', category: 'Bits', locationLegacy: 'Gudang', size: 'PTA01A', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '680666907860', name: 'Circular Saw', brand: 'TACKLIFE', category: 'Power Tools', locationLegacy: 'Gudang', size: '7-1/2 inch', unit: 'pcs', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '763615763301', name: 'Swiss Army Multitool', brand: 'Victorinox', category: 'Multi Tools', locationLegacy: 'Gudang', size: 'Traveler', unit: 'pcs', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '746160715612', name: 'Swiss Army Multitool', brand: 'Victorinox', category: 'Multi Tools', locationLegacy: 'Gudang', size: 'Limited Edition', unit: 'pcs', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '0406381333931', name: 'Multi Purpose Tool Set', brand: 'Generic', category: 'Hand Tools', locationLegacy: 'Gudang', size: 'Assorted', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '728370450088', name: 'Mini Pliers Set', brand: 'Generic', category: 'Pliers', locationLegacy: 'Gudang', size: 'Mini', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '797681946238', name: 'Wire Cutter Pliers', brand: 'Kingsdun', category: 'Pliers', locationLegacy: 'Gudang', size: 'Flush Cutter', unit: 'pcs', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '711639924452', name: 'Socket Extension Set', brand: 'DEKOPRO', category: 'Socket Tools', locationLegacy: 'Gudang', size: 'Extension Set', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '711639924453', name: 'Ratchet Handle Set', brand: 'DEKOPRO', category: 'Socket Tools', locationLegacy: 'Gudang', size: 'Ratchet', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '840332391281', name: 'Furniture Assembly Tool Kit', brand: 'YITAHOME', category: 'Furniture Tools', locationLegacy: 'Gudang', size: 'Assembly Kit', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '810081949812', name: 'Compact Multi Tool', brand: 'Gentlemen’s Hardware', category: 'Multi Tools', locationLegacy: 'Gudang', size: 'Compact', unit: 'pcs', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '850039064587', name: 'Magnetic Driver Set', brand: 'INTERTOOL', category: 'Screwdrivers', locationLegacy: 'Gudang', size: 'Driver Set', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '778862064225', name: 'Home Tool Set', brand: 'TACKLIFE', category: 'Tool Set', locationLegacy: 'Gudang', size: '60 pcs', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '716350797990', name: 'Mini Tool Kit', brand: 'RAK Pro Tools', category: 'Tool Set', locationLegacy: 'Gudang', size: 'Compact', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '0038728037060', name: 'Basic Home Tool Kit', brand: 'General Tools', category: 'Tool Set', locationLegacy: 'Gudang', size: 'WS-0101', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '08442960668036', name: 'Large Tool Kit', brand: 'Generic', category: 'Tool Set', locationLegacy: 'Gudang', size: '130 pcs', unit: 'set', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '731161037559', name: 'Tool Box Organizer', brand: 'Keter', category: 'Storage', locationLegacy: 'Gudang', size: '18 inch', unit: 'pcs', stockNew: 0, stockUsed: 0, minStock: 0 },
    { barcode: '6973107486746', name: 'Cross Screwdriver', brand: 'Deli Tools', category: 'Screwdrivers', locationLegacy: 'Gudang', size: 'PH1 x 75mm Yellow', unit: 'pcs', stockNew: 0, stockUsed: 0, minStock: 0 },
];

async function main() {
    console.log("Starting seeding...");
    for (const item of items) {
        await prisma.item.upsert({
            where: { barcode: item.barcode },
            update: item,
            create: item,
        });
    }
    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
