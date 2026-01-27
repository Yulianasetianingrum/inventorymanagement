// Refactored to store Base64 directly in DB for reliability in cloud environments
// This avoids filesystem persistence issues on ephemeral deployments (Vercel, Docker, etc.)

export async function saveBase64Image(base64Data: string): Promise<string> {
    // 1. Basic validation
    if (!base64Data.startsWith("data:image")) {
        // If it's already a URL or invalid, just return it (fallback)
        if (base64Data.startsWith("http") || base64Data.startsWith("/")) return base64Data;
        throw new Error("Invalid base64 image data");
    }

    // 2. Return the data URI directly
    // The database column is LongText, which can hold ~4GB of data.
    // Compressed images (~50KB-100KB) fit easily.
    return base64Data;
}
