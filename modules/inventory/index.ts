import { prisma } from "@/lib/prisma";

export function listLocations() {
  return prisma.location.findMany({ orderBy: { code: "asc" } });
}

export function listInventoryItems() {
  return prisma.item.findMany({
    include: { storageLocation: true },
    orderBy: { createdAt: "desc" },
  });
}
