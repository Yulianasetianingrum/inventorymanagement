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
        // 0. PRIORITY: Check Local Database
        const localItem = await prisma.item.findFirst({
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
        try {
            const googleUrl = `https://www.google.com/search?q=${code}`;
            const googleRes = await fetch(googleUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            const html = await googleRes.text();
            const $ = cheerio.load(html);

            // Google usually puts the main result title in h3 or within specific containers.
            // But a safer bet for product names is the meta title or specific result snippets.
            // We'll try to get the first organic result's Title.

            // Try explicit product wrappers first (shopping results often appear)
            let possibleName = "";

            // Selector for first standard search result title (h3)
            const firstResult = $("h3").first().text().trim();

            if (firstResult) {
                // Remove garbage text like "Buy ...", "Price..." if possible, but raw title is better than nothing.
                possibleName = firstResult;
            }

            // Fallback: Page Title (often contains "Brand Name - Product Name ...")
            if (!possibleName || possibleName.length < 5) {
                possibleName = $("title").text().replace("- Google Search", "").trim();
            }

            if (possibleName && !possibleName.includes("Robot") && !possibleName.includes("Captcha")) {
                // Heuristic: Try to split by " - " to guess Brand vs Name
                let brandGuess = "";
                let nameGuess = possibleName;

                if (possibleName.includes("-")) {
                    const parts = possibleName.split("-").map(s => s.trim());
                    // Assume shorter part might be brand? or just use full name.
                    // Often "Product Name - Brand" or "Brand - Product Name"
                    // Let's just put full text in Name for safety.
                }

                return NextResponse.json({
                    ok: true,
                    source: "GoogleScrape",
                    data: {
                        name: nameGuess,
                        brand: brandGuess, // Hard to guess accurately without structured data
                        category: "",
                        image: "",
                        size: ""
                    }
                });
            }
        } catch (e) {
            console.warn("Google scrape failed", e);
        }

        // 3. Fallback: DuckDuckGo HTML (Easier to scrape, less CAPTCHA)
        try {
            const ddgUrl = `https://html.duckduckgo.com/html/?q=${code}`;
            const ddgRes = await fetch(ddgUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            const html = await ddgRes.text();
            const $ = cheerio.load(html);

            // DDG HTML class for result title
            const firstResult = $(".result__title").first().text().trim();
            if (firstResult) {
                return NextResponse.json({
                    ok: true,
                    source: "DDGScrape",
                    data: {
                        name: firstResult,
                        brand: "",
                        category: "",
                        image: "",
                        size: ""
                    }
                });
            }
        } catch (e) {
            console.warn("DDG scrape failed", e);
        }

        // 3. Fallback: Google Search Link (We cannot scrape Google directly safely)
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
