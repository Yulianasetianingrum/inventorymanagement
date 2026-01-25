import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashSecret } from "@/lib/auth/password";

export async function listUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createUser(input: {
  employeeId: string;
  name: string;
  role: Role;
  password?: string;
  pin?: string;
}) {
  const passwordHash = input.password ? await hashSecret(input.password) : null;
  const pinHash = input.pin ? await hashSecret(input.pin) : null;

  return prisma.user.create({
    data: {
      employeeId: input.employeeId,
      name: input.name,
      role: input.role,
      passwordHash,
      pinHash,
    },
  });
}

export async function updateUser(input: {
  employeeId: string;
  name?: string;
  role?: Role;
  password?: string;
  pin?: string;
}) {
  const passwordHash = input.password ? await hashSecret(input.password) : undefined;
  const pinHash = input.pin ? await hashSecret(input.pin) : undefined;

  return prisma.user.update({
    where: { employeeId: input.employeeId },
    data: {
      name: input.name,
      role: input.role,
      passwordHash,
      pinHash,
    },
  });
}
