const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rates = {
  USD: 16760,
  EUR: 20030,
  GBP: 23020,
  MYR: 4230,
  AED: 4576,
  ZAR: 1049,
};

const tools = [
  { name: "Angle Grinder", brand: "Bosch", category: "Power Tools", size: "GWS 060 100mm", unit: "pcs", minStock: 3, barcode: "3165140829175", price: 122.0, currency: "MYR", priceNote: "Bosch GWS 060 (RM122)" },
  { name: "Angle Grinder", brand: "Bosch", category: "Power Tools", size: "GWS 18V-11 S 125mm", unit: "pcs", minStock: 2, barcode: "4053423323269", price: 185.19, currency: "EUR", priceNote: "Bosch GWS 18V-11 S (€185.19)" },
  { name: "Combi Drill", brand: "Bosch", category: "Power Tools", size: "GSB 18V-55", unit: "pcs", minStock: 2, barcode: "4059952509396", price: 67.34, currency: "GBP", priceNote: "Bosch GSB 18V-55 (£67.34)" },
  { name: "Router Trimmer", brand: "Makita", category: "Power Tools", size: "M3700B", unit: "pcs", minStock: 2, barcode: "088381815741", price: 1905.42, currency: "ZAR", priceNote: "Makita M3700B (R 1,905.42)" },
  { name: "Jigsaw", brand: "Makita", category: "Power Tools", size: "4329", unit: "pcs", minStock: 2, barcode: "088381083102", price: 335.0, currency: "AED", priceNote: "Makita 4329 (AED 335)" },
  { name: "Random Orbit Sander", brand: "Makita", category: "Power Tools", size: "BO5030 5\"", unit: "pcs", minStock: 2, barcode: "088381092715", price: 89.0, currency: "USD", priceNote: "Makita BO5030 ($89)" },
  { name: "Circular Saw", brand: "Makita", category: "Power Tools", size: "HS7600 7-1/4\"", unit: "pcs", minStock: 2, barcode: "088381683593", price: 139.99, currency: "USD", priceNote: "Makita HS7600 ($139.99)" },
  { name: "Router", brand: "Bosch", category: "Power Tools", size: "POF 1200 AE", unit: "pcs", minStock: 2, barcode: "3165140451628", price: 130.45, currency: "EUR", priceNote: "Bosch POF 1200 AE (€130.45)" },
  { name: "Angle Grinder", brand: "Makita", category: "Power Tools", size: "GA5030 125mm", unit: "pcs", minStock: 2, barcode: "0088381097031", price: 73.0, currency: "GBP", priceNote: "Makita GA5030 (£73)" },
  { name: "Random Orbit Sander", brand: "Bosch", category: "Power Tools", size: "PEX 300 AE", unit: "pcs", minStock: 2, barcode: "3165140594387", price: 95.0, currency: "EUR", priceNote: "Bosch PEX 300 AE (€95)" },
  { name: "Tape Measure", brand: "Stanley", category: "Hand Tools", size: "1-33-195 5m", unit: "pcs", minStock: 5, barcode: "3253561331954", price: 24.02, currency: "GBP", priceNote: "Stanley 1-33-195 (£24.02)" },
  { name: "Tape Measure", brand: "Stanley", category: "Hand Tools", size: "0-33-720 5m", unit: "pcs", minStock: 5, barcode: "3253560337209", price: 18.99, currency: "GBP", priceNote: "Stanley 0-33-720 (£18.99)" },
  { name: "Angle Grinder", brand: "Bosch", category: "Power Tools", size: "GWS 17-125 CI 125mm", unit: "pcs", minStock: 2, barcode: "3165140820417", price: 205.0, currency: "EUR", priceNote: "Bosch GWS 17-125 CI (€205)" },
];

const excelDates = [
  "2025-12-03", "2025-12-07", "2025-12-12", "2025-12-18", "2025-12-22",
  "2026-01-02", "2026-01-05", "2026-01-09", "2026-01-14", "2026-01-18",
  "2026-01-21", "2026-01-24", "2026-01-26",
];

function qtyForTool(tool) {
  // Heavy tools (power tools) must be < 3
  if (tool.category === "Power Tools") return Math.floor(Math.random() * 2) + 1; // 1..2
  return Math.floor(Math.random() * 8) + 1; // 1..8
}

async function main() {
  const suppliers = await prisma.supplier.findMany({ select: { id: true, namaToko: true } });
  if (!suppliers.length) throw new Error("No suppliers found.");

  const results = [];
  for (let i = 0; i < tools.length; i++) {
    const t = tools[i];
    const excelDate = excelDates[i % excelDates.length];
    const batchDate = new Date(`2026-01-${27 + (i % 3)}`);
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const qty = qtyForTool(t);

    const rate = rates[t.currency];
    if (!rate) throw new Error(`Missing rate for ${t.currency}`);
    const unitCostIdr = Math.round(t.price * rate);

    let item = await prisma.item.findFirst({
      where: { name: t.name, brand: t.brand, size: t.size }
    });

    if (!item) {
      item = await prisma.item.create({
        data: {
          name: t.name,
          brand: t.brand,
          category: t.category,
          locationLegacy: `R-TOOL-${String(i + 1).padStart(2, "0")}`,
          size: t.size,
          unit: t.unit,
          minStock: t.minStock,
          barcode: t.barcode,
          defaultSupplierId: supplier.id,
          stockNew: 0,
          stockUsed: 0,
        },
      });
    } else {
      await prisma.item.update({
        where: { id: item.id },
        data: {
          category: t.category,
          locationLegacy: `R-TOOL-${String(i + 1).padStart(2, "0")}`,
          unit: t.unit,
          minStock: t.minStock,
          barcode: t.barcode,
          defaultSupplierId: supplier.id,
        },
      });
    }

    await prisma.stockInBatch.deleteMany({ where: { itemId: item.id } });

    await prisma.stockInBatch.create({
      data: {
        itemId: item.id,
        supplierId: supplier.id,
        date: batchDate,
        qtyInBase: BigInt(qty),
        qtyRemaining: BigInt(qty),
        unitCost: BigInt(unitCostIdr),
        note: `mode:baru||Catatan: Excel ${excelDate}||${t.priceNote}`,
      },
    });

    await prisma.item.update({
      where: { id: item.id },
      data: { stockNew: { increment: qty } },
    });

    results.push({ id: item.id, name: `${t.brand} ${t.name} ${t.size}`, supplier: supplier.namaToko, qty, unitCostIdr });
  }

  console.log("Seeded items/batches:", results.length);
  console.log(results.map((r) => `${r.id} | ${r.name} | supplier ${r.supplier} | qty ${r.qty} | unitCostIDR ${r.unitCostIdr}`).join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
