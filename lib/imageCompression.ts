export async function compressImage(file: File, maxSizeKB: number = 50): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // 1. Initial Resize (Max dimension 1024px to start safe)
                const MAX_DIM = 1024;
                if (width > height) {
                    if (width > MAX_DIM) {
                        height *= MAX_DIM / width;
                        width = MAX_DIM;
                    }
                } else {
                    if (height > MAX_DIM) {
                        width *= MAX_DIM / height;
                        height = MAX_DIM;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Canvas context not available"));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                // 2. Iterative Compression
                let quality = 0.9;
                let dataUrl = canvas.toDataURL("image/jpeg", quality);

                // Helper to get size in KB
                const getSizeKB = (str: string) => Math.round((str.length * 3 / 4) / 1024);

                // Reduce quality loop
                while (getSizeKB(dataUrl) > maxSizeKB && quality > 0.1) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL("image/jpeg", quality);
                }

                // If still too big, brute force scale down
                if (getSizeKB(dataUrl) > maxSizeKB) {
                    while (getSizeKB(dataUrl) > maxSizeKB && width > 100) {
                        width *= 0.7;
                        height *= 0.7;
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        dataUrl = canvas.toDataURL("image/jpeg", 0.5); // Fixed low quality
                    }
                }

                console.log(`Image compressed to ${getSizeKB(dataUrl)}KB (Quality: ${quality.toFixed(1)})`);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
