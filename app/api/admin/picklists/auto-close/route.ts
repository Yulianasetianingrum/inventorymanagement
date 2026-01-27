import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
    const session = await getSession();
    // Allow any auth user to trigger this for consistency, or restrict to ADMIN.
    // Since it's harmless state maintenance, safe to run if logged in.
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const now = new Date();

        // Find picked items that are past their neededAt date
        const overdue = await prisma.picklist.updateMany({
            where: {
                status: "PICKED",
                neededAt: {
                    lt: now
                }
            },
            data: {
                status: "DELIVERED",
                deliveredAt: now
            }
        });

        // We can't easily log events for updateMany, but since it's system auto-close, 
        // we can skip granular event logging or accept that "deliveredAt" timestamp is enough.
        // If we really need events, we'd have to findMany then loop update, which is slower.
        // Given user sentiment "cukup picked saja", implicit delivery is fine.

        return NextResponse.json({ processed: overdue.count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
