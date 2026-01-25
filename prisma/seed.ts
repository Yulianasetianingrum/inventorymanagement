import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
      role: "ADMIN" as any,
      passwordHash: ownerPassword,
      phone: "081214239373",
    },
  });

  await prisma.user.upsert({
    where: { employeeId: "WKR-001" },
    update: {},
    create: {
      employeeId: "WKR-001",
      name: "Demo Worker",
      role: "WORKER" as any,
      passwordHash: workerPin, // Using passwordHash instead of pinHash as per new schema
    },
  });

  const rakData = [
    { code: "RAK01", name: "Rak01 - gudang utama", letak: "Gudang Utama", itemsCsv: "paku, baut, fastener" },
    { code: "RAK02", name: "Rak02 - gudang utama", letak: "Gudang Utama", itemsCsv: "lem, cat, finishing, cairan kaleng" },
    { code: "RAK03", name: "Rak03 - gudang utama", letak: "Gudang Utama", itemsCsv: "meteran, APD, gergaji, palu, mesin kabel" },
    { code: "RAK04", name: "Rak04 - gudang utama", letak: "Gudang Utama", itemsCsv: "kayu lembaran, plywood, MDF" },
  ];

  const raks: any[] = [];
  for (const r of rakData) {
    const loc = await prisma.location.upsert({
      where: { code: r.code },
      update: r,
      create: r,
    });
    raks.push(loc);
  }

  const hinge = await prisma.item.upsert({
    where: { name_brand_size: { name: "Engsel Soft Close", brand: "Blum", size: "" } },
    update: {},
    create: {
      name: "Engsel Soft Close",
      brand: "Blum",
      category: "Hardware",
      storageLocation: { connect: { id: raks[0].id } },
      size: "",
      unit: "pcs",
      minStock: 20,
      stockNew: 45,
      stockUsed: 10,
    },
  });

  const paint = await prisma.item.upsert({
    where: { name_brand_size: { name: "Cat Duco Putih", brand: "Avian", size: "" } },
    update: {},
    create: {
      name: "Cat Duco Putih",
      brand: "Avian",
      category: "Finishing",
      storageLocation: { connect: { id: raks[1].id } },
      size: "",
      unit: "liter",
      minStock: 5,
      stockNew: 18,
      stockUsed: 2,
    },
  });

  await prisma.item.upsert({
    where: { name_brand_size: { name: "Amplas 120", brand: "Bosch", size: "120" } },
    update: {},
    create: {
      name: "Amplas 120",
      brand: "Bosch",
      category: "Consumable",
      storageLocation: { connect: { id: raks[1].id } },
      size: "120",
      unit: "lembar",
      minStock: 50,
      stockNew: 80,
      stockUsed: 0,
    },
  });

  console.log("Seed data created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
