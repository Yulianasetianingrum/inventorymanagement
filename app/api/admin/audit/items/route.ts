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
        await prisma.$executeRawUnsafe("ALTER TABLE picklist_lines ADD COLUMN IF NOT EXISTS stockMode VARCHAR(191) NOT NULL DEFAULT 'baru'").catch(() => { });

        // Fetch using raw SQL to bypass Prisma Client sync issues with 'stockMode' field
        const lines: any[] = await prisma.$queryRaw`
            SELECT 
                pl.*,
                i.name as itemName, i.unit as itemUnit, i.brand as itemBrand,
                p.code as picklistCode, 
                p.deliveredAt as picklistDeliveredAt,
                p.pickedAt as picklistPickedAt,
                pr.namaProjek as projectNamaProjek, pr.namaKlien as projectNamaKlien,
                u.name as assigneeName
            FROM picklist_lines pl
            JOIN items i ON pl.itemId = i.id
            JOIN picklists p ON pl.picklistId = p.id
            LEFT JOIN project pr ON p.projectId = pr.id
            LEFT JOIN user u ON p.assigneeId = u.id
            WHERE p.status IN ('PICKED', 'DELIVERED')
              AND COALESCE(p.deliveredAt, p.pickedAt) >= ${dateLimit}
              AND pl.pickedQty > 0
            ORDER BY COALESCE(p.deliveredAt, p.pickedAt) DESC
        `;

        // Map raw results to the format the UI expects
        const mappedLines = lines.map(l => ({
            id: l.id,
            itemId: l.itemId,
            reqQty: l.reqQty,
            pickedQty: l.pickedQty,
            usedQty: l.pickedQty, // Use pickedQty as the base usage
            returnedQty: l.returnedQty,
            stockMode: l.stockMode,
            item: { name: l.itemName, unit: l.itemUnit, brand: l.itemBrand },
            picklist: {
                code: l.picklistCode,
                deliveredAt: l.picklistDeliveredAt || l.picklistPickedAt, // Fallback to pickedAt if deliveredAt is null
                project: { namaProjek: l.projectNamaProjek, namaKlien: l.projectNamaKlien },
                assignee: { name: l.assigneeName }
            }
        }));

        return NextResponse.json({ data: mappedLines });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
