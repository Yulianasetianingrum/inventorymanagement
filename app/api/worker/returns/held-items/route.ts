import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
    const session = await getSession();
    if (!session || (session.role !== "WORKER" && session.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const now = new Date();

        // Fetch picklist lines assigned to this user with picked items
        const lines = await prisma.picklistLine.findMany({
            where: {
                picklist: {
                    OR: [
                        { assigneeId: user.id },
                        { createdById: user.id }
                    ]
                },
                pickedQty: { gt: 0 }
            },
            include: {
                item: {
                    select: {
                        id: true,
                        name: true,
                        brand: true,
                        size: true,
                        unit: true,
                        stockUsed: true
                    }
                },
                picklist: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        neededAt: true,
                        createdById: true,
                        project: {
                            select: { namaProjek: true }
                        }
                    }
                }
            }
        });

        // Calculate balance and group by picklist
        const grouped: Record<string, any> = {};
        for (const line of lines) {
            const balance = line.pickedQty - line.returnedQty;
            if (balance <= 0) continue;

            const neededAt = line.picklist.neededAt;
            const isSelfScan = line.picklist.createdById === user.id;
            if (!isSelfScan) {
                if (!neededAt) continue; // no deadline = not eligible for return
                if (neededAt < now) continue; // deadline passed, no return
            }

            const picklistId = line.picklist.id;
            if (!grouped[picklistId]) {
                grouped[picklistId] = {
                    picklistId,
                    picklistCode: line.picklist.code,
                    picklistTitle: line.picklist.title,
                    neededAt,
                    projectName: line.picklist.project?.namaProjek || "Self-Service / Other",
                    items: []
                };
            }

            grouped[picklistId].items.push({
                id: line.id, // PicklistLine ID
                itemId: line.itemId,
                name: line.item.name,
                brand: line.item.brand,
                size: line.item.size,
                unit: line.item.unit,
                stockUsed: line.item.stockUsed,
                balance
            });
        }

        const data = Object.values(grouped).sort((a: any, b: any) => {
            const aTime = a.neededAt ? new Date(a.neededAt).getTime() : 0;
            const bTime = b.neededAt ? new Date(b.neededAt).getTime() : 0;
            return aTime - bTime;
        });

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("[HELD_ITEMS_API]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
