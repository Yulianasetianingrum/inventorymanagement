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

        // Fetch all picklist lines assigned to this user where they have picked items
        // but haven't fully used or returned them.
        const lines = await prisma.picklistLine.findMany({
            where: {
                picklist: { assigneeId: user.id },
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
                        project: {
                            select: { namaProjek: true }
                        }
                    }
                }
            }
        });

        // Calculate balance and format for frontend
        const heldItems = lines
            .map(line => {
                const balance = line.pickedQty - line.usedQty - line.returnedQty;
                return {
                    id: line.id, // PicklistLine ID
                    itemId: line.itemId,
                    name: line.item.name,
                    brand: line.item.brand,
                    size: line.item.size,
                    unit: line.item.unit,
                    stockUsed: line.item.stockUsed, // For legacy display if needed
                    balance,
                    projectName: line.picklist.project?.namaProjek || "Self-Service / Other",
                    picklistCode: line.picklist.code,
                    picklistTitle: line.picklist.title
                };
            })
            .filter(item => item.balance > 0);

        return NextResponse.json({ data: heldItems });
    } catch (error: any) {
        console.error("[HELD_ITEMS_API]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
