import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function saveBase64Image(base64Data: string): Promise<string> {
    // 1. Strip prefix (e.g. "data:image/jpeg;base64,")
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 string");
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], "base64");

    // 2. Determine extension
    let ext = "jpg";
    if (type === "image/png") ext = "png";
    if (type === "image/jpeg") ext = "jpg";
    if (type === "image/webp") ext = "webp";
    // add more if needed

    // 3. Ensure dir exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "evidence");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 4. Save file
    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    // 5. Return public URL
    return `/uploads/evidence/${filename}`;
}
