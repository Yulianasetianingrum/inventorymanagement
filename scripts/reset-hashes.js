const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            passwordHash: {
                startsWith: "$2"
            }
        }
    });

    console.log(`Found ${users.length} users with hashed passwords.`);

    for (const user of users) {
        console.log(`Resetting password for: ${user.name} (${user.employeeId})`);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: user.employeeId
            }
        });
    }

    console.log("Password reset completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
