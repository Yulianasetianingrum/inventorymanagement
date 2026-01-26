
import { prisma } from "../lib/prisma";

async function verify() {
    console.log("--- START VERIFICATION ---");

    // 1. Total Asset Value
    console.log("1. Verifying Asset Value...");
    const stockBatches = await prisma.stockInBatch.findMany({
        where: { qtyRemaining: { gt: 0 } },
        select: { qtyRemaining: true, unitCost: true }
    });

    let totalAssetValue = BigInt(0);
    for (const batch of stockBatches) {
        totalAssetValue += (batch.qtyRemaining * batch.unitCost);
    }
    console.log(`   Batches: ${stockBatches.length}`);
    console.log(`   Total Value: Rp ${Number(totalAssetValue).toLocaleString('id-ID')}`);

    // 2. Low Stock
    console.log("\n2. Verifying Low Stock...");
    const allActiveItems = await prisma.item.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            stockNew: true,
            stockUsed: true,
            minStock: true
        }
    });

    let lowStockCount = 0;
    for (const item of allActiveItems) {
        const totalStock = item.stockNew + item.stockUsed;
        if (totalStock <= item.minStock) {
            lowStockCount++;
        }
    }
    console.log(`   Active Items: ${allActiveItems.length}`);
    console.log(`   Low Stock: ${lowStockCount}`);

    // 3. Pending Picklists
    console.log("\n3. Verifying Pending Picklists...");
    const pendingPicklistsCount = await prisma.picklist.count({
        where: {
            status: { in: ["READY", "PICKING"] }
        }
    });
    console.log(`   Pending: ${pendingPicklistsCount}`);

    console.log("\n--- VERIFICATION COMPLETE ---");
}

verify()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
