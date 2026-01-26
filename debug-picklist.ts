import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
    const id = "cmkuja45k000but54t1hzhb7c";
    const p = await prisma.picklist.findUnique({
        where: { id },
        include: { assignee: true }
    });
    console.log("PICKLIST:", JSON.stringify(p, null, 2));
}

check().then(() => process.exit());
