import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
    try {
        const fields = Object.keys((prisma.item as any).fields || {});
        console.log("Fields in Item model:", fields);

        // Attempt a dry run find
        const item = await prisma.item.findFirst({
            where: { barcode: 'test' } as any
        });
        console.log("Query successful");
    } catch (e: any) {
        console.error("Test failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
