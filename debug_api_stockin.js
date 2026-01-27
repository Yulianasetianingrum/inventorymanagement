const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    console.log("Starting debug...");

    // 1. Get an item
    const item = await prisma.item.findFirst();
    if (!item) {
        console.error("No item found to test stock-in");
        return;
    }
    console.log("Found item:", item.id, item.name);

    const supplierName = "Debug Bulk Supplier " + Date.now();
    let finalSupplierId = null;

    try {
        // LOGIC FROM stock-in route
        console.log("Creating supplier...");
        const newSupplier = await prisma.supplier.create({
            data: {
                namaToko: supplierName,
                keperluanItems: JSON.stringify(["General Supply"]), // The suspect
                alamat: "Alamat debug"
            }
        });
        finalSupplierId = newSupplier.id;
        console.log("Created supplier:", finalSupplierId);

        console.log("Creating StockInBatch...");
        await prisma.stockInBatch.create({
            data: {
                itemId: item.id,
                supplierId: finalSupplierId,
                date: new Date(),
                qtyInBase: 10n,
                unitCost: 100n,
                qtyRemaining: 10n,
                note: "Debug Note"
            }
        });
        console.log("Success!");

    } catch (e) {
        console.error("FAILURE:", e);
    }
}

main();
