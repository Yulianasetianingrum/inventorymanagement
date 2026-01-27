const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRaw`SHOW CREATE TABLE supplier`;
        console.log("TABLE DEFINITION:");
        console.log(result[0]['Create Table']);
    } catch (e) {
        console.error("Error fetching table definition:", e);
    }
}

main();
