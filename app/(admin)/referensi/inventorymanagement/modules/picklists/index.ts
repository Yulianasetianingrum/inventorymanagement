import { prisma } from "@/lib/prisma";

export function listPicklists(fromDate?: Date) {
  return prisma.picklist.findMany({
    where: fromDate ? { createdAt: { gte: fromDate } } : undefined,
    include: {
      assignee: true,
      lines: true,
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getPicklistById(id: string) {
  return prisma.picklist.findUnique({
    where: { id },
    include: {
      lines: { include: { item: true } },
      assignee: true,
      project: true,
      handover: true,
      returns: { include: { lines: { include: { item: true } } } },
      events: { include: { actor: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export function listWorkerPicklists(employeeId: string) {
  return prisma.picklist.findMany({
    where: { assignee: { employeeId } },
    include: { lines: { include: { item: true } } },
    orderBy: { createdAt: "desc" },
  });
}
