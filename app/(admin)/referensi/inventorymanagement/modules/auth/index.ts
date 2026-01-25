import { prisma } from "@/lib/prisma";
import { hashSecret, verifySecret } from "@/lib/auth/password";
import { SessionPayload } from "@/lib/auth/session";

export async function authenticateAdmin(employeeId: string, password: string): Promise<SessionPayload | null> {
  const user = await prisma.user.findUnique({ where: { employeeId } });
  if (!user || user.role !== "ADMIN" || !user.passwordHash || user.isActive === false) return null;
  const ok = await verifySecret(password, user.passwordHash);
  if (!ok) return null;
  return { employeeId: user.employeeId, role: "ADMIN", name: user.name };
}

export async function authenticateWorker(employeeId: string, pin: string): Promise<SessionPayload | null> {
  const user = await prisma.user.findUnique({ where: { employeeId } });
  if (!user || user.role !== "WORKER" || user.isActive === false) return null;
  const hashed = user.pinHash ?? user.passwordHash;
  if (!hashed) return null;
  const ok = await verifySecret(pin, hashed);
  if (!ok) return null;
  return { employeeId: user.employeeId, role: user.role, name: user.name };
}

export async function setInitialSecrets(employeeId: string, password?: string, pin?: string) {
  const passwordHash = password ? await hashSecret(password) : undefined;
  const pinHash = pin ? await hashSecret(pin) : undefined;
  return prisma.user.update({
    where: { employeeId },
    data: {
      passwordHash,
      pinHash,
    },
  });
}
