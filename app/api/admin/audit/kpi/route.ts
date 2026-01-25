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
                                status: "DELIVERED",
                                deliveredAt: { gte: startDate }
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

        // 3. Top Used Items (Traceability)
        // Group by Item ID and Sum usedQty
        const topItemsRaw = await prisma.picklistLine.groupBy({
            by: ['itemId'],
            where: {
                picklist: {
                    status: "DELIVERED",
                    deliveredAt: { gte: startDate }
                }
            },
            _sum: {
                usedQty: true
            },
            orderBy: {
                _sum: {
                    usedQty: 'desc'
                }
            },
            take: 5
        });

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
                total: curr._sum.usedQty || 0
            };
        }));

        return NextResponse.json({
            data: {
                workers: workerStats.map(w => ({ id: w.id, name: w.name, employeeId: w.employeeId, count: w._count.assignedPicklists })),
                admins: adminStats.map(a => ({ id: a.id, name: a.name, employeeId: a.employeeId, count: a._count.createdPicklists })),
                topItems: topItems
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
