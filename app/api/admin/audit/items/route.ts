import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const filter = url.searchParams.get("filter") || "month";

    let dateLimit = new Date();
    if (filter === "week") dateLimit.setDate(dateLimit.getDate() - 7);
    else if (filter === "year") dateLimit.setFullYear(dateLimit.getFullYear() - 1);
    else dateLimit.setMonth(dateLimit.getMonth() - 1);

    try {
        const lines = await prisma.picklistLine.findMany({
            orderBy: { picklist: { deliveredAt: "desc" } },
            where: {
                picklist: {
                    status: "DELIVERED",
                    deliveredAt: { gte: dateLimit }
                }
            },
            include: {
                item: { select: { name: true, unit: true, brand: true } },
                picklist: {
                    select: {
                        code: true,
                        deliveredAt: true,
                        project: { select: { namaProjek: true, namaKlien: true } },
                        assignee: { select: { name: true } }
                    }
                }
            }
        });

        return NextResponse.json({ data: lines });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
