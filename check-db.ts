import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
    const count = await prisma.picklist.count();
    console.log("TOTAL PICKLISTS:", count);
    const sample = await prisma.picklist.findMany({ take: 5, select: { id: true, code: true } });
    console.log("SAMPLES:", JSON.stringify(sample, null, 2));
}

check().then(() => process.exit());
