const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rates = {
  IDR: 1,

};

const tools = [
  { name: "Gerinda", brand: "Bosch", category: "Power Tools", size: "GWS 060 100mm", unit: "pcs", minStock: 3, barcode: "3165140829175", price: 180000, currency: "IDR", priceNote: "Bosch GWS 060" },
  { name: "Gerinda", brand: "Bosch", category: "Power Tools", size: "GWS 18V-11 S 125mm", unit: "pcs", minStock: 2, barcode: "4053423323269", price: 195000, currency: "IDR", priceNote: "Bosch GWS 18V-11 S" },
  { name: "Bor Kombi", brand: "Bosch", category: "Power Tools", size: "GSB 18V-55", unit: "pcs", minStock: 2, barcode: "4059952509396", price: 190000, currency: "IDR", priceNote: "Bosch GSB 18V-55" },
  { name: "Trimmer Router", brand: "Makita", category: "Power Tools", size: "M3700B", unit: "pcs", minStock: 2, barcode: "088381815741", price: 200000, currency: "IDR", priceNote: "Makita M3700B" },
  { name: "Gergaji Ukir", brand: "Makita", category: "Power Tools", size: "4329", unit: "pcs", minStock: 2, barcode: "088381083102", price: 185000, currency: "IDR", priceNote: "Makita 4329" },
  { name: "Amplas Orbit", brand: "Makita", category: "Power Tools", size: "BO5030 5\"", unit: "pcs", minStock: 2, barcode: "088381092715", price: 175000, currency: "IDR", priceNote: "Makita BO5030" },
  { name: "Gergaji Circular", brand: "Makita", category: "Power Tools", size: "HS7600 7-1/4\"", unit: "pcs", minStock: 2, barcode: "088381683593", price: 195000, currency: "IDR", priceNote: "Makita HS7600" },
  { name: "Router", brand: "Bosch", category: "Power Tools", size: "POF 1200 AE", unit: "pcs", minStock: 2, barcode: "3165140451628", price: 180000, currency: "IDR", priceNote: "Bosch POF 1200 AE" },
  { name: "Gerinda", brand: "Makita", category: "Power Tools", size: "GA5030 125mm", unit: "pcs", minStock: 2, barcode: "0088381097031", price: 170000, currency: "IDR", priceNote: "Makita GA5030" },
  { name: "Amplas Orbit", brand: "Bosch", category: "Power Tools", size: "PEX 300 AE", unit: "pcs", minStock: 2, barcode: "3165140594387", price: 165000, currency: "IDR", priceNote: "Bosch PEX 300 AE" },
  { name: "Meteran", brand: "Stanley", category: "Hand Tools", size: "1-33-195 5m", unit: "pcs", minStock: 5, barcode: "3253561331954", price: 45000, currency: "IDR", priceNote: "Stanley 1-33-195" },
  { name: "Meteran", brand: "Stanley", category: "Hand Tools", size: "0-33-720 5m", unit: "pcs", minStock: 5, barcode: "3253560337209", price: 40000, currency: "IDR", priceNote: "Stanley 0-33-720" },
  { name: "Obeng Plus", brand: "Deli Tools", category: "Screwdrivers", size: "PH1 x 75mm Yellow", unit: "pcs", minStock: 0, barcode: "6973107486746", price: 25000, currency: "IDR", priceNote: "Deli Tools Cross Screwdriver" },
  { name: "Obeng Set Bit", brand: "DeWalt", category: "Hand Tools", size: "32 pc", unit: "set", minStock: 0, barcode: "5035048504048", price: 145000, currency: "IDR", priceNote: "Obeng Set Bit 32 pc", fixedQty: 2 },
  { name: "Gerinda", brand: "Bosch", category: "Power Tools", size: "GWS 17-125 CI 125mm", unit: "pcs", minStock: 2, barcode: "3165140820417", price: 199000, currency: "IDR", priceNote: "Bosch GWS 17-125 CI" },
  { name: "Cat Tembok Interior Nippon Q Luc", brand: "Nippon Paint", category: "Cat", size: "4.5 kg", unit: "kaleng", minStock: 0, barcode: null, price: 106000, currency: "IDR", priceNote: "Nippon Q Luc 4.5 kg" },
  { name: "Cat Tembok Interior Nippon Vinilex Pro 1000", brand: "Nippon Paint", category: "Cat", size: "4.5 kg", unit: "kaleng", minStock: 0, barcode: null, price: 135000, currency: "IDR", priceNote: "Nippon Vinilex Pro 1000 4.5 kg" },
  { name: "Cat Duco Nippe 2000", brand: "Nippon Paint", category: "Cat", size: "1 liter", unit: "kaleng", minStock: 0, barcode: null, price: 117000, currency: "IDR", priceNote: "Nippe 2000 1 liter" },
  { name: "Cat Pelapis Anti Bocor Nippon Elastex 3-in-1", brand: "Nippon Paint", category: "Cat", size: "4 kg", unit: "kaleng", minStock: 0, barcode: null, price: 209700, currency: "IDR", priceNote: "Elastex 3-in-1 4 kg" },
  { name: "Cat Eksterior Nippon Weatherbond", brand: "Nippon Paint", category: "Cat", size: "2.5 liter", unit: "kaleng", minStock: 0, barcode: null, price: 315000, currency: "IDR", priceNote: "Weatherbond 2.5 liter" },
  { name: "Lem HPL Taco Active", brand: "TACO", category: "Lem", size: "600 gr", unit: "kaleng", minStock: 0, barcode: null, price: 50000, currency: "IDR", priceNote: "Lem Taco Active HPL 600 gr" },
  { name: "Lem HPL Taco Active", brand: "TACO", category: "Lem", size: "2.5 kg", unit: "galon", minStock: 0, barcode: null, price: 135000, currency: "IDR", priceNote: "Lem Taco Active HPL 2.5 kg" },
  { name: "Lem HPL Polychloroprene Contact Adhesive", brand: "TACO", category: "Lem", size: "2.5 kg", unit: "kaleng", minStock: 0, barcode: null, price: 140959, currency: "IDR", priceNote: "Taco Polychloroprene 2.5 kg" },
  { name: "Paku Beton", brand: "Generic", category: "Paku", size: "100 pcs", unit: "pack", minStock: 0, barcode: null, price: 32000, currency: "IDR", priceNote: "Paku Beton 100 pcs" },
  { name: "Paku Kayu", brand: "Generic", category: "Paku", size: "100 pcs", unit: "pack", minStock: 0, barcode: null, price: 18000, currency: "IDR", priceNote: "Paku Kayu 100 pcs" },
  { name: "Paku Seng", brand: "Generic", category: "Paku", size: "100 pcs", unit: "pack", minStock: 0, barcode: null, price: 12000, currency: "IDR", priceNote: "Paku Seng 100 pcs" },
  { name: "Paku Payung", brand: "Generic", category: "Paku", size: "100 pcs", unit: "pack", minStock: 0, barcode: null, price: 22000, currency: "IDR", priceNote: "Paku Payung 100 pcs" },
  { name: "Paku Gypsum", brand: "Generic", category: "Paku", size: "100 pcs", unit: "pack", minStock: 0, barcode: null, price: 9000, currency: "IDR", priceNote: "Paku Gypsum 100 pcs" },
  { name: "HPL Taco Eco W001 White Gloss", brand: "TACO", category: "HPL", size: "per lembar", unit: "sheet", minStock: 0, barcode: null, price: 110000, currency: "IDR", priceNote: "Taco HPL Eco W001 White Gloss" },
  { name: "HPL Taco TH 002 AA Premier White", brand: "TACO", category: "HPL", size: "per lembar", unit: "sheet", minStock: 0, barcode: null, price: 125000, currency: "IDR", priceNote: "Taco HPL TH 002 AA Premier White" },
  { name: "HPL Taco TH 001 AA Solid Gross", brand: "TACO", category: "HPL", size: "per lembar", unit: "sheet", minStock: 0, barcode: null, price: 132000, currency: "IDR", priceNote: "Taco HPL TH 001 AA Solid Gross" },
  { name: "HPL Taco TH P 061 Frost Teak", brand: "TACO", category: "HPL", size: "per lembar", unit: "sheet", minStock: 0, barcode: null, price: 150000, currency: "IDR", priceNote: "Taco HPL TH P 061 Frost Teak" },
  { name: "HPL Taco TH 006 AA Midnight Grey", brand: "TACO", category: "HPL", size: "per lembar", unit: "sheet", minStock: 0, barcode: null, price: 156000, currency: "IDR", priceNote: "Taco HPL TH 006 AA Midnight Grey" },
  { name: "Triplek Birch Plywood 18mm", brand: "SKANPLY", category: "Plywood", size: "122 x 244 cm", unit: "sheet", minStock: 0, barcode: null, price: 1442000, currency: "IDR", priceNote: "Birch Plywood 18mm" },
  { name: "Triplek Marine Plywood 9mm", brand: "KAPAL MERAH", category: "Plywood", size: "122 x 244 cm", unit: "sheet", minStock: 0, barcode: null, price: 523000, currency: "IDR", priceNote: "Marine Plywood 9mm" },
  { name: "Triplek Marine Plywood 12mm", brand: "KAPAL MERAH", category: "Plywood", size: "122 x 244 cm", unit: "sheet", minStock: 0, barcode: null, price: 653000, currency: "IDR", priceNote: "Marine Plywood 12mm" },
  { name: "Triplek Marine Plywood 15mm", brand: "KAPAL MERAH", category: "Plywood", size: "122 x 244 cm", unit: "sheet", minStock: 0, barcode: null, price: 784000, currency: "IDR", priceNote: "Marine Plywood 15mm" },
  { name: "Triplek Marine Plywood 18mm", brand: "KAPAL MERAH", category: "Plywood", size: "122 x 244 cm", unit: "sheet", minStock: 0, barcode: null, price: 901000, currency: "IDR", priceNote: "Marine Plywood 18mm" },
];

const excelDates = [
  "2025-12-03", "2025-12-07", "2025-12-12", "2025-12-18", "2025-12-22",
  "2025-12-24", "2025-12-26", "2025-12-28", "2025-12-30",
  "2026-01-02", "2026-01-05", "2026-01-09", "2026-01-14", "2026-01-18",
  "2026-01-21", "2026-01-24", "2026-01-26",
];

function qtyForTool(tool) {
  if (tool.fixedQty != null) return tool.fixedQty;
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
          locationLegacy: "Gudang",
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
          locationLegacy: "Gudang",
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
