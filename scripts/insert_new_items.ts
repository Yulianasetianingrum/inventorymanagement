import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const itemsInfo = [
    { barcode: '840214804694', name: 'Multi Tool 12 in 1', brand: 'Gentlemen’s Hardware', size: '12-in-1 multitool', unit: 'pcs' },
    { barcode: '778862064224', name: 'Home Tool Set 57 Pcs', brand: 'TACKLIFE', size: '57 pieces tool kit', unit: 'set' },
    { barcode: '716350797988', name: 'Multi Tool Hammer', brand: 'RAK Pro Tools', size: '12-in-1 hammer tool', unit: 'pcs' },
    { barcode: '038728037060', name: 'Home Tool Kit', brand: 'General Tools', size: '39 pieces set', unit: 'set' },
    { barcode: '681035017982', name: 'Precision Tool Set', brand: 'General Tools', size: '11 pcs precision set', unit: 'set' },
    { barcode: '711639924451', name: 'Home Repair Tool Kit', brand: 'DEKOPRO', size: '198 pieces tool kit', unit: 'set' },
    { barcode: '313055857810', name: 'Tool Kit Set', brand: 'Trademark Tools', size: '130 pieces', unit: 'set' },
    { barcode: '850039064586', name: 'Magnetic Screwdriver Set', brand: 'INTERTOOL', size: '114 pcs magnetic bit set', unit: 'set' },
    { barcode: '680666946241', name: 'Screwdriver Bit Set', brand: 'TACKLIFE', size: 'PTA01A bit set', unit: 'set' },
    { barcode: '680666907860', name: 'Circular Saw', brand: 'TACKLIFE', size: '7-1/2 inch, 1800W', unit: 'pcs' },
    { barcode: '763615763301', name: 'Swiss Army Multitool', brand: 'Victorinox', size: 'Traveler model', unit: 'pcs' },
    { barcode: '746160715612', name: 'Swiss Army Multitool', brand: 'Victorinox', size: 'Limited edition', unit: 'pcs' },
    { barcode: '0406381333931', name: 'Multi Purpose Hand Tool Set', brand: 'Generic', size: 'Assorted hand tools', unit: 'set' },
    { barcode: '728370450088', name: 'Mini Pliers Set', brand: 'Generic', size: 'Small pliers set', unit: 'set' },
    { barcode: '797681946238', name: 'Wire Cutter Pliers', brand: 'Kingsdun', size: 'Flush side cutter', unit: 'pcs' },
    { barcode: '711639924452', name: 'Socket Extension Set', brand: 'DEKOPRO', size: 'Socket accessories', unit: 'set' },
    { barcode: '711639924453', name: 'Ratchet Handle Set', brand: 'DEKOPRO', size: 'Ratchet & adapter', unit: 'set' },
    { barcode: '840332391281', name: 'Furniture Assembly Tool Kit', brand: 'YITAHOME', size: 'Wood furniture kit', unit: 'set' },
    { barcode: '810081949812', name: 'Compact Multi Tool', brand: 'Gentlemen’s Hardware', size: 'Compact version', unit: 'pcs' },
    { barcode: '850039064587', name: 'Magnetic Driver Set', brand: 'INTERTOOL', size: 'Driver & bit set', unit: 'set' },
    { barcode: '778862064225', name: 'Home Tool Set', brand: 'TACKLIFE', size: '60 pcs variant', unit: 'set' },
    { barcode: '716350797990', name: 'Mini Tool Kit', brand: 'RAK Pro Tools', size: 'Compact tool kit', unit: 'set' },
    { barcode: '0038728037060', name: 'Basic Home Tool Kit', brand: 'General Tools', size: 'WS-0101 variant', unit: 'set' },
    { barcode: '08442960668036', name: 'Large Tool Kit', brand: 'Generic', size: '130 pcs mixed tools', unit: 'set' },
    { barcode: '731161037559', name: 'Tool Box Organizer', brand: 'Keter', size: '18 inch cantilever toolbox', unit: 'pcs' },
    { barcode: '6973107486746', name: 'Cross Screwdriver', brand: 'Deli Tools', size: 'PH1 x 75mm, Yellow', unit: 'pcs' },
];

async function main() {
    console.log('Starting insert...');
    for (const item of itemsInfo) {
        try {
            // Check for existing item by barcode
            const existingByBarcode = await prisma.item.findUnique({
                where: { barcode: item.barcode },
            });

            if (existingByBarcode) {
                console.log(`Skipping existing barcode: ${item.barcode} (${item.name})`);
                continue;
            }

            // Check for existing item by composite unique key (name, brand, size)
            const existingByComposite = await prisma.item.findFirst({
                where: {
                    name: item.name,
                    brand: item.brand,
                    size: item.size,
                },
            });

            if (existingByComposite) {
                console.log(`Skipping existing item by composite key: ${item.name} / ${item.brand} / ${item.size}`);
                // Optionally update barcode if missing
                if (!existingByComposite.barcode) {
                    console.log(`Updating barcode for ${item.name}...`);
                    await prisma.item.update({
                        where: { id: existingByComposite.id },
                        data: { barcode: item.barcode }
                    });
                }
                continue;
            }

            // Create new
            await prisma.item.create({
                data: {
                    name: item.name,
                    brand: item.brand,
                    size: item.size,
                    unit: item.unit,
                    category: 'Tools', // Default category
                    barcode: item.barcode,
                    stockNew: 10,
                    minStock: 5,
                },
            });
            console.log(`Created: ${item.name}`);

        } catch (e) {
            console.error(`Error inserting ${item.name}:`, e);
        }
    }
    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
