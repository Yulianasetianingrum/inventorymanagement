import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { userId } = await params;

        // Fetch recent activities from AuditLog
        const activities = await prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
                action: true,
                detail: true,
                createdAt: true,
                metaJson: true
            }
        });

        // Also fetch picklists this user has worked on (as assignee)
        // We can merge this info if needed, but AuditLog is usually comprehensive if we log events correctly.
        // For now, let's stick to AuditLog as the primary source of truth for "Activity".
        // Ensure that picklist completion logs are present in AuditLog. 
        // If not, we might need to query PicklistEvent as well.

        // Let's also check Picklist Events for more granular task history
        const picklistEvents = await prisma.picklistEvent.findMany({
            where: { actorUserId: userId },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
                picklist: { select: { code: true, project: { select: { namaProjek: true } } } }
            }
        });

        // Merge and sort
        const combined = [
            ...activities.map(a => ({ ...a, type: 'AUDIT' })),
            ...picklistEvents.map(e => ({
                action: e.eventType, // e.g., START_PICKING, FINISH_PICKING
                detail: `Picklist ${e.picklist.code} (${e.picklist.project?.namaProjek || 'No Project'})`,
                createdAt: e.createdAt,
                metaJson: null,
                type: 'EVENT'
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 30); // Limit total shown

        return NextResponse.json({ data: combined });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
