// Break-glass script to set a new credential (password or PIN) for a user.
// Usage (run from project root):
//   EMPLOYEE_ID=ADM-001 NEW_SECRET=PasswordBaru AUTH_TYPE=PASSWORD node scripts/reset-user-credential.js
//
// Notes:
// - AUTH_TYPE can be PASSWORD or PIN (default PASSWORD)
// - This overwrites the hash for the user; plaintext is NOT stored.
// - Run only by authorized admin/IT staff.

const { PrismaClient, AuthType } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const employeeId = process.env.EMPLOYEE_ID;
  const secret = process.env.NEW_SECRET;
  const authType = (process.env.AUTH_TYPE || "PASSWORD").toUpperCase();

  if (!employeeId || !secret) {
    console.error("EMPLOYEE_ID and NEW_SECRET are required. Example:");
    console.error("EMPLOYEE_ID=ADM-001 NEW_SECRET=PasswordBaru AUTH_TYPE=PASSWORD node scripts/reset-user-credential.js");
    process.exit(1);
  }
  if (authType !== "PASSWORD") {
    console.error("AUTH_TYPE must be PASSWORD (PIN is no longer supported)");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const hashed = await bcrypt.hash(secret, 10);
    const data = { authType: AuthType.PASSWORD, passwordHash: hashed };
    await prisma.user.upsert({
      where: { employeeId },
      update: data,
      create: {
        employeeId,
        name: "Admin",
        role: "ADMIN",
        authType: AuthType.PASSWORD,
        passwordHash: hashed,
        isActive: true,
      },
    });

    console.log(`Credential set for ${employeeId} with authType=${authType}. (Created if not existed)`);
    console.log("Plaintext is ONLY what you provided in NEW_SECRET; it is not stored.");
  } catch (err) {
    console.error("Failed to reset credential:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
