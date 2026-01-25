import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

    try {
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
        try {
            const lookupUrl = `https://www.upcitemdb.com/upc/${code}`;
            const scrapeRes = await fetch(lookupUrl, { headers: { "User-Agent": USER_AGENT } });
            const html = await scrapeRes.text();
            const $ = cheerio.load(html);

            const title = $("h1.detail-title").text().trim(); // Selector specific to upcitemdb
            if (title && !title.includes("Excessive Access")) {
                // Try to parse brand/category from table
                const brand = $("td:contains('Brand')").next().text().trim();
                const category = $("td:contains('Category')").next().text().trim();

                return NextResponse.json({
                    ok: true,
                    source: "WebLookup",
                    data: {
                        name: title,
                        brand: brand,
                        category: category,
                        image: "",
                        size: ""
                    }
                });
            }
        } catch (e) {
            console.warn("Scrape failed", e);
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
