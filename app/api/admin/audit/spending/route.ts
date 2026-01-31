import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const startParam = searchParams.get("start");
        const endParam = searchParams.get("end");

        let startDate: Date | null = null;
        let endDate: Date | null = null;
        if (startParam) {
            const parsed = new Date(startParam);
            if (!Number.isNaN(parsed.getTime())) startDate = parsed;
        }
        if (endParam) {
            const parsed = new Date(endParam);
            if (!Number.isNaN(parsed.getTime())) {
                parsed.setHours(23, 59, 59, 999);
                endDate = parsed;
            }
        }

        // 1. Only include "baru" (pembelian/tambah stok) batches for financial audit
        const batches = await prisma.stockInBatch.findMany({
            where: {
                note: { startsWith: "mode:baru" },
                ...(startDate || endDate
                    ? {
                        date: {
                            ...(startDate ? { gte: startDate } : {}),
                            ...(endDate ? { lte: endDate } : {})
                        }
                    }
                    : {})
            },
            orderBy: { date: "desc" },
            include: {
                item: { select: { name: true, brand: true } },
                supplier: { select: { id: true, namaToko: true, noTelp: true } }
            }
        });

        // 2. Automated Supplier Price Benchmarking
        // Group by item name + brand to find variations across suppliers
        const itemPrices: Record<string, any[]> = {};
        batches.forEach(b => {
            const key = `${b.item.name}|${b.item.brand}`;
            if (!itemPrices[key]) itemPrices[key] = [];
            itemPrices[key].push({
                supplier: b.supplier,
                price: Number(b.unitCost),
                date: b.date
            });
        });

        const recommendations = Object.entries(itemPrices)
            .map(([key, data]) => {
                const [name, brand] = key.split("|");

                // FILTER: Only consider suppliers with valid WA/Phone numbers
                const actionableOptions = data.filter(d => d.supplier && d.supplier.noTelp && d.supplier.noTelp.length > 5);

                if (actionableOptions.length === 0) return null;

                // Sort by price ascending
                const sorted = actionableOptions.sort((a, b) => a.price - b.price);
                return {
                    item: name,
                    brand,
                    cheapest: sorted[0],
                    options: sorted
                };
            })
            .filter(Boolean) // Remove items with no actionable suppliers
            .sort((a: any, b: any) => (a.cheapest?.price || 0) - (b.cheapest?.price || 0)); // Cheapest to priciest

        return NextResponse.json({
            data: {
                batches: batches.map(b => ({
                    ...b,
                    unitCost: Number(b.unitCost),
                    total: Number(b.qtyInBase) * Number(b.unitCost)
                })),
                recommendations
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
