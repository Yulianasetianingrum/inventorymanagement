import { PrismaClient } from "@prisma/client";

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

    console.log("Current Users and Password Status:");
    users.forEach((user) => {
        const isHash = user.passwordHash?.startsWith("$2a$") || user.passwordHash?.startsWith("$2b$") || user.passwordHash?.startsWith("$2y$");
        console.log(`- ${user.name} (${user.employeeId}): ${isHash ? "HASHED" : "PLAIN TEXT"} (Data: ${user.passwordHash})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
