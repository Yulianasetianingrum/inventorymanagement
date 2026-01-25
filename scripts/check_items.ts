import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
    const items = await prisma.item.findMany({ select: { id: true, name: true, barcode: true } });
    console.log(`TOTAL_ITEMS:${items.length}`);
    items.slice(0, 5).forEach(it => console.log(`ITEM:${it.id}|${it.name}|${it.barcode}`));
    await prisma.$disconnect();
}

check().catch(console.error);
