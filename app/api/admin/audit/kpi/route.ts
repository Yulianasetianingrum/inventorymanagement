import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "month"; // week, month, year

    let startDate = new Date();
    if (filter === "week") startDate.setDate(startDate.getDate() - 7);
    else if (filter === "month") startDate.setMonth(startDate.getMonth() - 1);
    else startDate.setFullYear(startDate.getFullYear() - 1);

    try {
        // 1. Worker Performance (Picklists completed)
        const workerStats = await prisma.user.findMany({
            where: { role: "WORKER" },
            select: {
                id: true,
                name: true,
                employeeId: true,
                _count: {
                    select: {
                        assignedPicklists: {
                            where: {
                                status: { in: ["PICKED", "DELIVERED"] },
                                OR: [
                                    { pickedAt: { gte: startDate } },
                                    { deliveredAt: { gte: startDate } }
                                ]
                            }
                        }
                    }
                }
            }
        });

        // 2. Admin Performance (Picklists created)
        const adminStats = await prisma.user.findMany({
            where: { role: "ADMIN" },
            select: {
                id: true,
                name: true,
                employeeId: true,
                _count: {
                    select: {
                        createdPicklists: {
                            where: {
                                createdAt: { gte: startDate }
                            }
                        }
                    }
                }
            }
        });

        // TEMPORARY FIX: Force add column if missing
        await prisma.$executeRawUnsafe("ALTER TABLE picklist_lines ADD COLUMN IF NOT EXISTS stockMode VARCHAR(191) NOT NULL DEFAULT 'baru'").catch(() => { });

        // 3. Top Used Items (Traceability) - Using Raw SQL to bypass Prisma Client sync lag
        const topItemsRaw: any[] = await prisma.$queryRaw`
            SELECT 
                pl.itemId, 
                CAST(SUM(pl.usedQty) AS SIGNED) as usedQtySum
            FROM picklist_lines pl
            JOIN picklists p ON pl.picklistId = p.id
            WHERE pl.stockMode = 'baru' 
              AND p.status = 'DELIVERED'
              AND p.deliveredAt >= ${startDate}
            GROUP BY pl.itemId
            ORDER BY usedQtySum DESC
            LIMIT 5
        `;

        // Enrich with Item Details (Name)
        const topItems = await Promise.all(topItemsRaw.map(async (curr) => {
            const item = await prisma.item.findUnique({
                where: { id: curr.itemId },
                select: { name: true, unit: true }
            });
            return {
                id: curr.itemId,
                name: item?.name || "Unknown Item",
                unit: item?.unit || "Unit",
                total: Number(curr.usedQtySum) || 0
            };
        }));

        // 4. Dashboard KPIs -----------------------------------------

        // A. Total Asset Value (Sisa Stock * Unit Cost)
        // Note: unitCost and qtyRemaining are BigInt
        const stockBatches = await prisma.stockInBatch.findMany({
            where: {
                qtyRemaining: { gt: 0 }
            },
            select: {
                qtyRemaining: true,
                unitCost: true
            }
        });

        let totalAssetValue = BigInt(0);
        for (const batch of stockBatches) {
            totalAssetValue += (batch.qtyRemaining * batch.unitCost);
        }

        // Format to IDR (approximated to Number for display)
        const totalValueFormatted = "Rp " + Number(totalAssetValue).toLocaleString('id-ID');

        // B. Low Stock count
        // Fetch minimal fields to calculate status in memory (safest cross-db approach for computed columns)
        const allActiveItems = await prisma.item.findMany({
            where: { isActive: true },
            select: {
                stockNew: true,
                stockUsed: true,
                minStock: true
            }
        });

        let lowStockCount = 0;
        for (const item of allActiveItems) {
            const totalStock = item.stockNew + item.stockUsed;
            if (totalStock <= item.minStock) {
                lowStockCount++;
            }
        }

        // C. Pending Picklists
        const pendingPicklistsCount = await prisma.picklist.count({
            where: {
                status: { in: ["READY", "PICKING"] }
            }
        });

        // D. Total Items (Active)
        const totalItemsCount = allActiveItems.length;


        const kpis = [
            {
                title: "Estimasi Aset",
                value: totalValueFormatted,
                desc: "Total nilai stok tersedia"
            },
            {
                title: "Low Stock",
                value: `${lowStockCount} Item`,
                desc: "Stok di bawah batas minimum"
            },
            {
                title: "Picklist Pending",
                value: `${pendingPicklistsCount} Order`,
                desc: "Menunggu pengerjaan"
            },
            {
                title: "Total Item",
                value: `${totalItemsCount} SKU`,
                desc: "Item aktif terdaftar"
            }
        ];

        // 5. Recent Activity (Recap only - Filtered High Value Actions)
        const recentActivity = await prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            where: {
                action: {
                    in: ["CREATE_PICKLIST", "STOCK_ADJUSTMENT", "DELETE_ITEM", "CREATE_USER", "DELETE_USER"]
                }
            },
            include: {
                user: {
                    select: { name: true, role: true, employeeId: true }
                }
            }
        });

        return NextResponse.json({
            data: {
                workers: workerStats.map(w => ({ id: w.id, name: w.name, employeeId: w.employeeId, count: w._count.assignedPicklists })),
                admins: adminStats.map(a => ({ id: a.id, name: a.name, employeeId: a.employeeId, count: a._count.createdPicklists })),
                topItems: topItems,
                kpis: kpis,
                recentActivity: recentActivity.map(r => ({
                    id: r.id,
                    user: r.user?.employeeId || "System",
                    action: r.action,
                    detail: r.detail,
                    time: r.createdAt
                }))
            }
        });
    } catch (error: any) {
        console.error("Dashboard KPI Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
