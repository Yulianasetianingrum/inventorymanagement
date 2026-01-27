import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

async function ensureAdmin() {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return null;
    return session;
}

export async function GET(req: Request) {
    const admin = await ensureAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // 1. Fetch Items with critical stats
        const items = await prisma.item.findMany({
            where: { isActive: true },
            include: {
                batches: {
                    where: { qtyRemaining: { gt: 0 } },
                    select: { qtyRemaining: true, unitCost: true }
                }
            }
        });

        // 2. High Level KPIs
        const totalItems = items.length;
        let totalValue = BigInt(0);
        let lowStockCount = 0;

        // 3. Detailed Lists
        const itemPerformance = items.map(item => {
            // Calculate Value for this item based on its active batches
            const itemValue = item.batches.reduce((acc, b) => acc + (b.qtyRemaining * b.unitCost), BigInt(0));
            totalValue += itemValue;

            if ((item.stockNew + item.stockUsed) <= item.minStock) lowStockCount++;

            return {
                id: item.id,
                name: item.name,
                brand: item.brand,
                category: item.category || "Uncategorized",
                stockUsed: item.stockUsed,
                stockNew: item.stockNew,
                totalStock: item.stockNew + item.stockUsed, // simplified
                value: Number(itemValue), // Convert to number for JSON (careful with overflow, but usually safe for UI)
                turnoverRate: item.stockNew > 0 ? (item.stockUsed / (item.stockNew + item.stockUsed)) : 0
            };
        });

        // 4. Sort for Fast / Slow / Dead

        // NEW LOGIC: Calculate Consumption based on Picklists (Internal Outgoing)
        const consumption = await prisma.picklistLine.groupBy({
            by: ['itemId'],
            where: {
                picklist: {
                    status: { in: ['PICKED', 'DELIVERED'] },
                    mode: 'INTERNAL'
                }
            },
            _sum: {
                pickedQty: true
            }
        });

        const consumptionMap = new Map<number, number>();
        consumption.forEach(c => {
            consumptionMap.set(c.itemId, c._sum.pickedQty || 0);
        });

        // Fast: Highest Consumption (Real Usage)
        const fastMoving = [...itemPerformance]
            .map(i => ({ ...i, consumption: consumptionMap.get(i.id) || 0 }))
            .sort((a, b) => b.consumption - a.consumption)
            .slice(0, 10);

        // Dead: Zero Consumption & Has Stock (and created a while ago? simplified for now)
        const deadStock = itemPerformance
            .filter(i => (consumptionMap.get(i.id) || 0) === 0 && i.totalStock > 0)
            .sort((a, b) => b.value - a.value) // Most expensive dead stock first
            .slice(0, 10);

        // Slow: Low Usage (>0) but accumulated stock
        const slowMoving = itemPerformance
            .filter(i => i.stockUsed > 0 && i.turnoverRate < 0.1) // <10% turnover
            .sort((a, b) => a.stockUsed - b.stockUsed)
            .slice(0, 100); // Just list candidates

        // 5. Category Distribution
        const categoryMap: Record<string, number> = {};
        itemPerformance.forEach(i => {
            const cat = i.category;
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        const categoryStats = Object.entries(categoryMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        return NextResponse.json({
            data: {
                kpi: {
                    totalItems,
                    totalValue: Number(totalValue),
                    lowStockCount
                },
                fastMoving,
                deadStock,
                slowMovingCount: slowMoving.length,
                categories: categoryStats
            }
        });

    } catch (err: any) {
        console.error("Analysis Error:", err);
        return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
    }
}
