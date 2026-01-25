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

  // Manual upsert for Items to avoid Type Error with composite keys

  // 1. Hinge
  let hinge = await prisma.item.findFirst({
    where: { name: "Engsel Soft Close", brand: "Blum", size: "" }
  });

  if (!hinge) {
    hinge = await prisma.item.create({
      data: {
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
  }

  // 2. Paint
  let paint = await prisma.item.findFirst({
    where: { name: "Cat Duco Putih", brand: "Avian", size: "" }
  });

  if (!paint) {
    paint = await prisma.item.create({
      data: {
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
  }

  // 3. Sandpaper
  let sandpaper = await prisma.item.findFirst({
    where: { name: "Amplas 120", brand: "Bosch", size: "120" }
  });

  if (!sandpaper) {
    await prisma.item.create({
      data: {
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
  }

  // --- NEW ITEMS ADDED ---
  const newItems = [
    { barcode: '840214804694', name: 'Multi Tool 12 in 1', brand: 'Gentlemen’s Hardware', size: '12-in-1 multitool', unit: 'pcs' },
    { barcode: '778862064224', name: 'Home Tool Set 57 Pcs', brand: 'TACKLIFE', size: '57 pieces tool kit', unit: 'set' },
    { barcode: '716350797988', name: 'Multi Tool Hammer', brand: 'RAK Pro Tools', size: '12-in-1 hammer tool', unit: 'pcs' },
    { barcode: '038728037060', name: 'Home Tool Kit', brand: 'General Tools', size: '39 pieces set', unit: 'set' },
    { barcode: '681035017982', name: 'Precision Tool Set', brand: 'General Tools', size: '11 pcs precision set', unit: 'set' },
    { barcode: '711639924451', name: 'Home Repair Tool Kit', brand: 'DEKOPRO', size: '198 pieces tool kit', unit: 'set' },
    { barcode: '313055857810', name: 'Tool Kit Set', brand: 'Trademark Tools', size: '130 pieces', unit: 'set' },
    { barcode: '850039064586', name: 'Magnetic Screwdriver Set', brand: 'INTERTOOL', size: '114 pcs magnetic bit set', unit: 'set' },
    { barcode: '680666946241', name: 'Screwdriver Bit Set', brand: 'TACKLIFE', size: 'PTA01A bit set', unit: 'set' },
    { barcode: '680666907860', name: 'Circular Saw', brand: 'TACKLIFE', size: '7-1/2 inch, 1800W', unit: 'pcs' },
    { barcode: '763615763301', name: 'Swiss Army Multitool', brand: 'Victorinox', size: 'Traveler model', unit: 'pcs' },
    { barcode: '746160715612', name: 'Swiss Army Multitool', brand: 'Victorinox', size: 'Limited edition', unit: 'pcs' },
    { barcode: '0406381333931', name: 'Multi Purpose Hand Tool Set', brand: 'Generic', size: 'Assorted hand tools', unit: 'set' },
    { barcode: '728370450088', name: 'Mini Pliers Set', brand: 'Generic', size: 'Small pliers set', unit: 'set' },
    { barcode: '797681946238', name: 'Wire Cutter Pliers', brand: 'Kingsdun', size: 'Flush side cutter', unit: 'pcs' },
    { barcode: '711639924452', name: 'Socket Extension Set', brand: 'DEKOPRO', size: 'Socket accessories', unit: 'set' },
    { barcode: '711639924453', name: 'Ratchet Handle Set', brand: 'DEKOPRO', size: 'Ratchet & adapter', unit: 'set' },
    { barcode: '840332391281', name: 'Furniture Assembly Tool Kit', brand: 'YITAHOME', size: 'Wood furniture kit', unit: 'set' },
    { barcode: '810081949812', name: 'Compact Multi Tool', brand: 'Gentlemen’s Hardware', size: 'Compact version', unit: 'pcs' },
    { barcode: '850039064587', name: 'Magnetic Driver Set', brand: 'INTERTOOL', size: 'Driver & bit set', unit: 'set' },
    { barcode: '778862064225', name: 'Home Tool Set', brand: 'TACKLIFE', size: '60 pcs variant', unit: 'set' },
    { barcode: '716350797990', name: 'Mini Tool Kit', brand: 'RAK Pro Tools', size: 'Compact tool kit', unit: 'set' },
    { barcode: '0038728037060', name: 'Basic Home Tool Kit', brand: 'General Tools', size: 'WS-0101 variant', unit: 'set' },
    { barcode: '08442960668036', name: 'Large Tool Kit', brand: 'Generic', size: '130 pcs mixed tools', unit: 'set' },
    { barcode: '731161037559', name: 'Tool Box Organizer', brand: 'Keter', size: '18 inch cantilever toolbox', unit: 'pcs' },
    { barcode: '6973107486746', name: 'Cross Screwdriver', brand: 'Deli Tools', size: 'PH1 x 75mm, Yellow', unit: 'pcs' },
  ];

  for (const item of newItems) {
    const existing = await prisma.item.findUnique({ where: { barcode: item.barcode } });
    if (!existing) {
      await prisma.item.create({
        data: {
          name: item.name,
          brand: item.brand,
          size: item.size,
          unit: item.unit,
          barcode: item.barcode,
          category: 'Tools',
          stockNew: 0,
          minStock: 5,
        }
      });
    }
  }

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
