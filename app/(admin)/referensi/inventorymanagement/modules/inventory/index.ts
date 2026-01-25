import { prisma } from "@/lib/prisma";

export function listLocations() {
  return prisma.location.findMany({ orderBy: { code: "asc" } });
}

export function listInventoryItems() {
  return prisma.inventoryItem.findMany({
    include: { location: true },
    orderBy: { createdAt: "desc" },
  });
}
