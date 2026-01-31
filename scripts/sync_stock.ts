
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔄 Sinkronisasi stok dari batches ke tabel items...");

    // 1. Ambil semua item
    const items = await prisma.item.findMany();

    for (const item of items) {
        // 2. Ambil semua batch untuk item ini
        const batches = await prisma.stockInBatch.findMany({
            where: { itemId: item.id }
        });

        let totalBaru = 0;
        let totalBekas = 0;

        for (const b of batches) {
            const qty = Number(b.qtyRemaining);
            const note = b.note ?? "";

            // Logika penentuan baru/bekas sesuai API original
            if (note.includes("mode:bekas")) {
                totalBekas += qty;
            } else {
                // Default dianggap baru jika tidak ada note bekas
                totalBaru += qty;
            }
        }

        const totalBaruSafe = Math.max(0, totalBaru);\n        const stockUsed = Math.min(Math.max(0, totalBekas), totalBaruSafe);\n        const stockNew = Math.max(0, totalBaruSafe - stockUsed);

        // 3. Update tabel items
        await prisma.item.update({
            where: { id: item.id },
            data: {
                stockNew,
                stockUsed
            }
        });

        console.log(`? ${item.name}: Updated (Baru: ${stockNew}, Bekas: ${stockUsed})`);    console.log(`✅ ${item.name}: Updated (Baru: ${totalBaru}, Bekas: ${totalBekas})`);
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


