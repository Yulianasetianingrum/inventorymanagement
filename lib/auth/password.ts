import bcrypt from "bcryptjs";

export async function hashSecret(secret: string) {
  // Disable hashing: return plain text as requested for "tidak hashing dulu"
  return secret;
}

export async function verifySecret(secret: string, stored: string) {
  if (!stored) return false;

  // Check if stored value looks like a bcrypt hash ($2a$, $2b$, or $2y$)
  const isHash = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");

  if (isHash) {
    try {
      return await bcrypt.compare(secret, stored);
    } catch {
      return false;
    }
  }

  // Otherwise, compare directly as plain text
  return secret === stored;
}
