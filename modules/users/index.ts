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
}) {
  const passwordHash = input.password ? await hashSecret(input.password) : null;

  return prisma.user.create({
    data: {
      employeeId: input.employeeId,
      name: input.name,
      role: input.role,
      passwordHash,
    },
  });
}

export async function updateUser(input: {
  employeeId: string;
  name?: string;
  role?: Role;
  password?: string;
}) {
  const passwordHash = input.password ? await hashSecret(input.password) : undefined;

  return prisma.user.update({
    where: { employeeId: input.employeeId },
    data: {
      name: input.name,
      role: input.role,
      passwordHash,
    },
  });
}
