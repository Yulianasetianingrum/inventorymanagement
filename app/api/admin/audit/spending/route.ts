import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // 1. Get all stock batches for total spending
        const batches = await prisma.stockInBatch.findMany({
            orderBy: { date: "desc" },
            include: {
                item: { select: { name: true, brand: true } },
                supplier: { select: { namaToko: true, noTelp: true } }
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

        const recommendations = Object.entries(itemPrices).map(([key, data]) => {
            const [name, brand] = key.split("|");
            // Sort by price ascending
            const sorted = data.sort((a, b) => a.price - b.price);
            return {
                item: name,
                brand,
                cheapest: sorted[0],
                options: sorted
            };
        });

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
