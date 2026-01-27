const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to create supplier...");
    try {
        const s = await prisma.supplier.create({
            data: {
                namaToko: "Test Supplier " + Date.now(),
                // Mimicking the code in stock-in route
                keperluanItems: "-",
                alamat: "-",
            }
        });
        console.log("Success:", s);
    } catch (e) {
        console.error("FAIL:", e);
    }
}

main();
