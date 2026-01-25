/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const ownerPassword = await bcrypt.hash("owner123", 10);
  const workerPin = await bcrypt.hash("1111", 10);

  await prisma.user.upsert({
    where: { employeeId: "OWN-001" },
    update: {},
    create: {
      employeeId: "OWN-001",
      name: "Owner",
      role: Role.ADMIN,
      passwordHash: ownerPassword,
    },
  });

  await prisma.user.upsert({
    where: { employeeId: "WKR-001" },
    update: {},
    create: {
      employeeId: "WKR-001",
      name: "Demo Worker",
      role: Role.WORKER,
      pinHash: workerPin,
    },
  });

  const [hardware, finishing] = await Promise.all([
    prisma.location.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: "Rak Hardware",
        letak: "Gudang Utama",
        itemsCsv:
          "engsel, rel laci, handle/knob, bracket/siku, magnet pintu, push latch, kaki-kaki, paku tembak, paku biasa, staples, sekrup kayu, sekrup gypsum, baut, mur, washer, fisher, dowel",
      },
    }),
    prisma.location.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: "Rak Cat & Finishing",
        letak: "Gudang Utama",
        itemsCsv: "cat duco, wood stain, clear coat, melamic/PU, hardener, thinner, solvent, filler, dempul, pigment",
      },
    }),
  ]);

  const hinge = await prisma.item.upsert({
    where: { name_size: { name: "Engsel Soft Close", size: null } },
    update: {},
    create: {
      name: "Engsel Soft Close",
      brand: "Blum",
      category: "Hardware",
      location: hardware.name,
      size: null,
      unit: "pcs",
      minStock: 20,
      stockNew: 45,
      stockUsed: 10,
    },
  });

  const paint = await prisma.item.upsert({
    where: { name_size: { name: "Cat Duco Putih", size: null } },
    update: {},
    create: {
      name: "Cat Duco Putih",
      brand: "Avian",
      category: "Finishing",
      location: finishing.name,
      unit: "liter",
      minStock: 5,
      stockNew: 18,
      stockUsed: 2,
    },
  });

  await prisma.item.upsert({
    where: { name_size: { name: "Amplas 120", size: null } },
    update: {},
    create: {
      name: "Amplas 120",
      brand: "Bosch",
      category: "Consumable",
      location: hardware.name,
      size: "120",
      unit: "lembar",
      minStock: 50,
      stockNew: 80,
      stockUsed: 0,
    },
  });

  await prisma.stockInBatch.deleteMany({});

  await prisma.stockInBatch.createMany({
    data: [
      {
        itemId: hinge.id,
        date: new Date("2024-12-01"),
        qtyInBase: 40,
        unitCost: 15000,
        qtyRemaining: 25,
        note: "Supplier A - Invoice 001",
      },
      {
        itemId: hinge.id,
        date: new Date("2024-12-20"),
        qtyInBase: 20,
        unitCost: 17000,
        qtyRemaining: 20,
        note: "Supplier B - Invoice 002",
      },
      {
        itemId: paint.id,
        date: new Date("2024-12-15"),
        qtyInBase: 10,
        unitCost: 85000,
        qtyRemaining: 8,
        note: "Cat Duco Putih - Supplier Cat",
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error("Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
