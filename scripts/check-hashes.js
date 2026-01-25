const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            employeeId: true,
            name: true,
            passwordHash: true,
        },
    });

    console.log("=== USER LIST ===");
    users.forEach((user) => {
        const isHash = user.passwordHash && (user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$") || user.passwordHash.startsWith("$2y$"));
        console.log(`ID: ${user.id} | Name: ${user.name} | EmpID: ${user.employeeId} | Status: ${isHash ? "HASHED" : "PLAIN"} | Value: ${user.passwordHash}`);
    });
    console.log("=================");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
