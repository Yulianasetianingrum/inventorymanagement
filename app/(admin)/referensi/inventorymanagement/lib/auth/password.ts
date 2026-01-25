import bcrypt from "bcryptjs";

export async function hashSecret(secret: string) {
  return bcrypt.hash(secret, 10);
}

export async function verifySecret(secret: string, hash: string) {
  if (!hash) return false;
  return bcrypt.compare(secret, hash);
}
