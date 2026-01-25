import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    console.log(`[LOOKUP] Starting lookup for: ${code}`);

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
            console.log("[LOOKUP] Found in Local DB");
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
        console.log("[LOOKUP] Trying OpenFoodFacts...");
        const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
        const offData = await offRes.json();

        if (offData.status === 1) {
            console.log("[LOOKUP] Found in OpenFoodFacts");
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

        // 1.5. Try EAN-Search.org (Dedicated Barcode DB)
        console.log("[LOOKUP] Trying EAN-Search...");
        try {
            const eanUrl = `https://www.ean-search.org/?q=${code}`;
            const eanRes = await fetch(eanUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            const html = await eanRes.text();

            // EAN-Search usually puts results in a list or title
            const $ = cheerio.load(html);

            // Look for the product name in the result list (often .searchresult or similar)
            // Or just check page title: "EAN 123456 - Product Name"
            const pageTitle = $("title").text();
            if (pageTitle.includes(code) && !pageTitle.includes("Unknown")) {
                let cleanName = pageTitle.split(code)[1]?.replace(/^[\s\-\:]+/, "").replace(/ - EAN-Search.org/i, "").trim();

                // Fallback: Check for specific result elements if title is generic
                if (!cleanName || cleanName.length < 3) {
                    // Try to find the first link in the main table
                    const firstLink = $("td > a").first().text().trim();
                    if (firstLink && firstLink.length > 5) cleanName = firstLink;
                }

                if (cleanName && cleanName.length > 3) {
                    // Extract metrics
                    const sizeRegex = /\b(\d+(?:[.,]\d+)?)\s*(ml|l|liter|kg|g|gr|gram|mg|pcs|pack|zak|sak|cm|mm|m)\b/i;
                    const sizeMatch = cleanName.match(sizeRegex);
                    let detectedSize = (sizeMatch) ? `${sizeMatch[1]} ${sizeMatch[2]}` : "";

                    let detectedBrand = "";
                    // Basic split inference
                    if (cleanName.includes(" ")) {
                        detectedBrand = cleanName.split(" ")[0];
                    }

                    return NextResponse.json({
                        ok: true,
                        source: "EANSearch_Scrape",
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
        } catch (e) {
            console.warn("EAN-Search failed", e);
        }

        // 2. High Success Rate Lookup: SCRAPE STRATEGY
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
                const sizeRegex = /\b(\d+(?:[.,]\d+)?)\s*(ml|l|liter|kg|g|gr|gram|mg|pcs|pack|zak|sak|cm|mm|m)\b/i;
                const sizeMatch = cleanName.match(sizeRegex);
                let detectedSize = (sizeMatch) ? `${sizeMatch[1]} ${sizeMatch[2]}` : "";

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

            // GOOGLE LITE FALLBACK (Common for programmatic access)
            if (candidates.length === 0) {
                $(".BNeawe").each((i, el) => {
                    if (i >= 5) return false;
                    let text = $(el).text().trim();
                    if (text.length > 10 && !text.includes("Google")) {
                        candidates.push({ name: text, brand: "", size: "", score: 1 });
                    }
                });
            }

            // Sort by score (desc) then name length (desc)
            candidates.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return b.name.length - a.name.length;
            });

            if (candidates.length > 0) {
                console.log(`[LOOKUP] Found in Google (${candidates[0].name})`);
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

        // 3. Fallback: BING SEARCH (Less strict than Google)
        console.log("[LOOKUP] Trying Bing...");
        try {
            const bingUrl = `https://www.bing.com/search?q=${code}`;
            const bingRes = await fetch(bingUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
            });
            const html = await bingRes.text();

            // Only update fallbackHtml if it's currently empty or short (meaning previous fetches failed)
            if (!fallbackHtml || fallbackHtml.length < 500) fallbackHtml = html;

            const $ = cheerio.load(html);
            // Bing results are often in h2 or li.b_algo h2
            const title = $("li.b_algo h2").first().text().trim();

            if (title && title.length > 5) {
                let cleanName = title.replace(/ - Bing/gi, "").trim();
                console.log(`[LOOKUP] Found in Bing (${cleanName})`);
                return NextResponse.json({
                    ok: true,
                    source: "BingScrape",
                    data: {
                        name: cleanName,
                        brand: "",
                        category: "",
                        image: "",
                        size: ""
                    }
                });
            }
        } catch (e) {
            console.warn("Bing failed", e);
        }

        // 4. LAST RESORT: BODY TEXT FALLBACK (Desperate Search)
        // The previous Page Title fallback was useless for SERPs (it just returned the barcode).
        // Instead, we look for ANY widely used title tag (h3, h4, or valid anchors) that looks like a product name.
        try {
            if (fallbackHtml) {
                const $ = cheerio.load(fallbackHtml);
                let bestGuess = "";

                // Collect potential text nodes from common result containers
                const candidates: string[] = [];
                $("h3, h4, a").each((i, el) => {
                    if (candidates.length >= 10) return false;

                    const text = $(el).text().replace(/\s+/g, " ").trim();
                    const lower = text.toLowerCase();

                    // Filter out navigation/junk
                    if (text.length < 10 || text.length > 100) return;
                    if (lower.includes("google") || lower.includes("duckduckgo")) return;
                    if (lower.includes("login") || lower.includes("sign in") || lower.includes("masuk")) return;
                    if (lower.includes("maps") || lower.includes("images") || lower.includes("news")) return;
                    if (lower.includes("privacy") || lower.includes("terms") || lower.includes("settings")) return;
                    if (lower.includes("shopping") || lower.includes("belanja")) return;
                    if (text.includes(code)) return; // Probably just the barcode itself

                    candidates.push(text);
                });

                // Pick the longest unique candidate that triggers a "Product Name" vibe
                // Or simply the first one that passed the filters (most relevant result usually top)
                if (candidates.length > 0) {
                    // Heuristic: The first H3 in main content is usually the first result title.
                    bestGuess = candidates[0];

                    // Try to be smarter: prefer ones with brand-like separators
                    const smartCandidate = candidates.find(c => c.includes("-") || c.includes("|"));
                    if (smartCandidate) bestGuess = smartCandidate;
                }

                if (bestGuess) {
                    // Reuse the cleaner logic
                    let cleanName = bestGuess
                        .replace(/ - Google Search/gi, "")
                        .replace(/ at DuckDuckGo/gi, "")
                        .replace(/ \| Tokopedia/gi, "")
                        .replace(/ \| Shopee/gi, "")
                        .replace(/Jual /gi, "")
                        .trim();

                    // Extract metrics if possible
                    const sizeRegex = /\b(\d+(?:[.,]\d+)?)\s*(ml|l|liter|kg|g|gr|gram|mg|pcs|pack|zak|sak|cm|mm|m)\b/i;
                    const sizeMatch = cleanName.match(sizeRegex);
                    let detectedSize = (sizeMatch) ? `${sizeMatch[1]} ${sizeMatch[2]}` : "";

                    let detectedBrand = "";
                    if (cleanName.includes("-")) {
                        const parts = cleanName.split("-");
                        if (parts[0].trim().length < 15) detectedBrand = parts[0].trim();
                    }

                    return NextResponse.json({
                        ok: true,
                        source: "BodyTextFallback",
                        data: {
                            name: cleanName,
                            brand: detectedBrand, // Best effort
                            category: "",
                            image: "",
                            size: detectedSize
                        }
                    });
                }
            }
        } catch (e) {
            console.warn("Body fallback failed", e);
        }

        // 5. FINAL FALLBACK: Return Placeholder (Do NOT open Google)
        console.log("ALL SCRAPERS FAILED. Returning Placeholder.");
        return NextResponse.json({
            ok: true,
            source: "Placeholder",
            data: {
                name: `Item ${code}`, // Pre-fill with code so user knows to edit it
                brand: "",
                category: "",
                image: "",
                size: ""
            }
        });

    } catch (error) {
        console.error("Lookup CRITICAL FAILURE", error);
        return NextResponse.json({ error: "Internal lookup error" }, { status: 500 });
    }
}
