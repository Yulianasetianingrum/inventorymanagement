import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

    try {
        // SHARED HTML CONTENT for Fallback
        let fallbackHtml = "";

        // 0. PRIORITY: Check Local Database
        const localItem = await prisma.item.findUnique({
            // @ts-ignore - Prisma client out of sync with schema
            where: { barcode: code }
        });

        if (localItem) {
            return NextResponse.json({
                ok: true,
                source: "LocalDB",
                data: {
                    name: localItem.name,
                    brand: localItem.brand || "",
                    category: localItem.category || "",
                    size: localItem.size || "",
                    unit: localItem.unit,
                    // We don't need stock info for just auto-filling the form identity
                }
            });
        }

        // 1. Try OpenFoodFacts (Good for food/groceries)
        const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
        const offData = await offRes.json();

        if (offData.status === 1) {
            const p = offData.product;
            return NextResponse.json({
                ok: true,
                source: "OpenFoodFacts",
                data: {
                    name: p.product_name || p.product_name_en || "",
                    brand: p.brands || "",
                    category: p.categories?.split(",")?.[0] || "",
                    image: p.image_url || "",
                    size: p.quantity || ""
                }
            });
        }

        // 2. Fallback: Try a generic lookup via simulated scraping (UPCitemdb or similar public catalog)
        // Note: Scraping is flaky. We use it as a best-effort.
        // 2. High Success Rate Lookup: Google Search Scraping
        // Since accurate APIs are paid, we scrape Google Search title meta.
        // 2. High Success Rate Lookup: Google Search Scraping
        // Intelligent "Top 5" Analysis
        try {
            const googleUrl = `https://www.google.com/search?q=${code}`;
            const googleRes = await fetch(googleUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            const html = await googleRes.text();
            fallbackHtml = html; // Save for fallback
            const $ = cheerio.load(html);

            // Analyzed candidates
            let candidates: any[] = [];

            // Loop through first 5 results (h3 usually contains the title)
            $("h3").each((i, el) => {
                if (i >= 5) return false; // Limit to top 5

                let rawTitle = $(el).text().trim();

                // Aggressive cleaning
                let cleanName = rawTitle
                    .replace(/ - Google Search/gi, "")
                    .replace(/ – Google Search/gi, "")
                    .replace(/ \| Google/gi, "")
                    .replace(/ \| Tokopedia/gi, "")
                    .replace(/ \| Shopee Indonesia/gi, "")
                    .replace(/ \| Shopee/gi, "")
                    .replace(/ \| Bukalapak/gi, "")
                    .replace(/ \| Blibli/gi, "")
                    .replace(/ \| Lazada/gi, "")
                    .replace(/Jual /gi, "")
                    .replace(/\.\.\.$/, "") // Remove ellipses
                    .trim();

                if (!cleanName || cleanName.length < 5) return;

                // Extraction Logic
                // 1. Size / Dimension (e.g. 200ml, 1kg, 500 gr, 2.5 Liter)
                const sizeRegex = /\b(\d+(?:[.,]\d+)?)\s*(ml|l|liter|kg|g|gr|gram|mg|pcs|pack|zak|sak|cm|mm|m)\b/i;
                const sizeMatch = cleanName.match(sizeRegex);
                let detectedSize = "";
                if (sizeMatch) {
                    detectedSize = `${sizeMatch[1]} ${sizeMatch[2]}`; // e.g. "200 ml"
                }

                // 2. Brand Heuristics
                // Strategy: Look for "Merk: X" or assume text BEFORE the first hyphen/pipe is Brand, or text AFTER if it looks like a suffix.
                let detectedBrand = "";

                // Common separator split
                if (cleanName.includes("-")) {
                    const parts = cleanName.split("-");
                    // Often: "Product Name - Brand" OR "Brand - Product Name"
                    // If part[0] is short (< 15 chars), assume Brand.
                    if (parts[0].trim().length < 15) detectedBrand = parts[0].trim();
                    else if (parts[parts.length - 1].trim().length < 15) detectedBrand = parts[parts.length - 1].trim();
                }

                candidates.push({
                    name: cleanName,
                    brand: detectedBrand,
                    size: detectedSize,
                    score: (detectedSize ? 2 : 0) + (detectedBrand ? 1 : 0) // Prefer results with extracted data
                });
            });

            // Sort by score (desc) then name length (desc)
            candidates.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return b.name.length - a.name.length;
            });

            if (candidates.length > 0) {
                const best = candidates[0];
                return NextResponse.json({
                    ok: true,
                    source: "GoogleScrape_Smart",
                    data: {
                        name: best.name,
                        brand: best.brand,
                        category: "",
                        image: "",
                        size: best.size
                    }
                });
            }

        } catch (e) {
            console.warn("Google scrape failed", e);
        }

        // 3. Fallback: DuckDuckGo HTML (Easier to scrape, less CAPTCHA)
        // 3. Fallback: DuckDuckGo HTML (Easier to scrape, less CAPTCHA)
        // SMART DDG SCRAPER
        try {
            const ddgUrl = `https://html.duckduckgo.com/html/?q=${code}`;
            const ddgRes = await fetch(ddgUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            const html = await ddgRes.text();
            fallbackHtml = html; // Save for fallback
            const $ = cheerio.load(html);

            let candidates: any[] = [];

            // Loop through first 5 results (.result__title)
            $(".result__title").each((i, el) => {
                if (i >= 5) return false;

                let rawTitle = $(el).text().trim();

                // Aggressive cleaning
                let cleanName = rawTitle
                    .replace(/ - Google Search/gi, "")
                    // DDG specific noise
                    .replace(/ at DuckDuckGo/gi, "")
                    .replace(/ \| Tokopedia/gi, "")
                    .replace(/ \| Shopee/gi, "")
                    .replace(/Jual /gi, "")
                    .trim();

                if (!cleanName || cleanName.length < 5) return;

                // 1. Size Extraction
                const sizeRegex = /\b(\d+(?:[.,]\d+)?)\s*(ml|l|liter|kg|g|gr|gram|mg|pcs|pack|zak|sak|cm|mm|m)\b/i;
                const sizeMatch = cleanName.match(sizeRegex);
                let detectedSize = "";
                if (sizeMatch) detectedSize = `${sizeMatch[1]} ${sizeMatch[2]}`;

                // 2. Brand Heuristics
                let detectedBrand = "";
                if (cleanName.includes("-")) {
                    const parts = cleanName.split("-");
                    if (parts[0].trim().length < 15) detectedBrand = parts[0].trim();
                    else if (parts[parts.length - 1].trim().length < 15) detectedBrand = parts[parts.length - 1].trim();
                }

                candidates.push({
                    name: cleanName,
                    brand: detectedBrand,
                    size: detectedSize,
                    score: (detectedSize ? 2 : 0) + (detectedBrand ? 1 : 0)
                });
            });

            // Sort by score
            candidates.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return b.name.length - a.name.length;
            });

            if (candidates.length > 0) {
                const best = candidates[0];
                return NextResponse.json({
                    ok: true,
                    source: "DDGScrape_Smart",
                    data: {
                        name: best.name,
                        brand: best.brand,
                        category: "",
                        image: "",
                        size: best.size
                    }
                });
            }
        } catch (e) {
            console.warn("DDG scrape failed", e);
        }

        // 4. LAST RESORT: PAGE TITLE FALLBACK
        // If everything else fails, just grab the page title.
        // Google/DDG titles are usually "Query - Google Search" or "Query at DuckDuckGo".
        // Using shared 'fallbackHtml' (with structured extraction)
        try {
            if (fallbackHtml) {
                const $ = cheerio.load(fallbackHtml);
                const pageTitle = $("title").text().trim();

                if (pageTitle && pageTitle.length > 5) {
                    let cleanName = pageTitle
                        .replace(/ - Google Search/gi, "")
                        .replace(/ at DuckDuckGo/gi, "")
                        .replace(/ \| Tokopedia/gi, "")
                        .replace(/ \| Shopee/gi, "")
                        .trim();

                    if (cleanName && cleanName !== "DuckDuckGo" && cleanName !== "Google") {

                        // Apply Regex Extraction to Title to satisfy User Requirement
                        const sizeRegex = /\b(\d+(?:[.,]\d+)?)\s*(ml|l|liter|kg|g|gr|gram|mg|pcs|pack|zak|sak|cm|mm|m)\b/i;
                        const sizeMatch = cleanName.match(sizeRegex);
                        let detectedSize = (sizeMatch) ? `${sizeMatch[1]} ${sizeMatch[2]}` : "";

                        let detectedBrand = "";
                        if (cleanName.includes("-")) {
                            const parts = cleanName.split("-");
                            if (parts[0].trim().length < 15) detectedBrand = parts[0].trim();
                            else if (parts[parts.length - 1].trim().length < 15) detectedBrand = parts[parts.length - 1].trim();
                        }

                        return NextResponse.json({
                            ok: true,
                            source: "TitleFallback_Smart",
                            data: {
                                name: cleanName,
                                brand: detectedBrand,
                                category: "",
                                image: "",
                                size: detectedSize
                            }
                        });
                    }
                }
            }
        } catch (e) { }

        // 5. Fallback: Google Search Link (We cannot scrape Google directly safely)
        return NextResponse.json({
            ok: false,
            error: "Product not found automatically",
            googleLink: `https://www.google.com/search?q=${code}`
        });

    } catch (error) {
        console.error("Lookup failed", error);
        return NextResponse.json({ error: "Internal lookup error" }, { status: 500 });
    }
}
