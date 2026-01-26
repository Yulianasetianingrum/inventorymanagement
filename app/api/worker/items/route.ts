import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
    const session = await getSession();
    if (!session || (session.role !== "WORKER" && session.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const items = await prisma.item.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                brand: true,
                size: true,
                unit: true,
                stockNew: true,
                stockUsed: true,
                locationLegacy: true,
                storageLocation: {
                    select: { name: true }
                }
            },
            orderBy: { name: "asc" }
        });

        // Simple enrichment
        const enriched = items.map(it => ({
            ...it,
            location: it.storageLocation?.name || it.locationLegacy || "???"
        }));

        return NextResponse.json({ data: enriched });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
