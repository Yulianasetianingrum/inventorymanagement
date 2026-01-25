import { prisma } from "@/lib/prisma";

export function stockBalances() {
  return prisma.item.findMany({ select: { id: true, name: true, stockNew: true, stockUsed: true } });
}
