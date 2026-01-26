import crypto from 'crypto';

// Use a consistent key for the project. In production, this should be in process.env
// For this local setup, we'll use a fixed key derived from a secret string.
const SECRET = process.env.ENCRYPTION_KEY || "inventory-management-secret-key-2025";
const ALGORITHM = 'aes-256-cbc';

// Generate a 32-byte key from the secret
const key = crypto.scryptSync(SECRET, 'salt', 32);

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return IV + Encrypted text (IV is needed for decryption)
    return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
    // Basic check for format iv:content
    if (!text || !text.includes(':')) return text;

    try {
        const textParts = text.split(':');
        const ivHex = textParts.shift();

        // IV for aes-256-cbc must be 16 bytes (32 hex characters)
        if (!ivHex || ivHex.length !== 32) return text;

        const iv = Buffer.from(ivHex, 'hex');
        if (iv.length !== 16) return text;

        const encryptedText = textParts.join(':');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        // console.error("Decryption failed:", e);
        return text; // Fallback to returning original text if decryption fails (legacy support)
    }
}
