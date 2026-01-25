
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const items = await prisma.item.findMany({ select: { id: true, name: true, barcode: true } });
    const batches = await prisma.stockInBatch.findMany({ select: { itemId: true, qtyRemaining: true } });
    console.log("ITEMS:", JSON.stringify(items, null, 2));
    console.log("BATCHES:", JSON.stringify(batches, null, 2));
}
main();
