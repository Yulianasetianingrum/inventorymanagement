import { prisma } from "@/lib/prisma";

export function stockBalances() {
  return prisma.inventoryItem.findMany({ select: { id: true, sku: true, name: true, quantity: true } });
}

export function stockLedger() {
  return prisma.stockLedger.findMany({
    include: { item: true, createdBy: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
