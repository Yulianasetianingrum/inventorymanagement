import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔄 Sinkronisasi stok dari batches ke tabel items...");

    const items = await prisma.item.findMany();

    for (const item of items) {
        const batches = await prisma.stockInBatch.findMany({
            where: { itemId: item.id }
        });

        let totalBaru = 0;
        let totalBekas = 0;

        for (const b of batches) {
            const qty = Number(b.qtyRemaining);
            const note = b.note ?? "";

            if (note.includes("mode:bekas")) {
                totalBekas += qty;
            } else {
                totalBaru += qty;
            }
        }

        const stockNew = Math.max(0, totalBaru);
        const stockUsed = Math.max(0, totalBekas);

        await prisma.item.update({
            where: { id: item.id },
            data: {
                stockNew,
                stockUsed
            }
        });

        console.log(`✅ ${item.name}: Updated (Baru: ${stockNew}, Bekas: ${stockUsed})`);
    }

    console.log("\n✨ Sinkronisasi selesai!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
