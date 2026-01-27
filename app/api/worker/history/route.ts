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

        // 1. Fetch Picklists (Scans & Manifesto)
        // We include PICKED, DELIVERED, CANCELED
        const picklists = await prisma.picklist.findMany({
            where: {
                assigneeId: user.id,
                status: { in: ["PICKED", "DELIVERED", "CANCELED"] }
            },
            include: {
                project: true,
                lines: { select: { reqQty: true, pickedQty: true } }
            },
            orderBy: { updatedAt: "desc" }
        });

        // 2. Fetch Ad-hoc Returns from AuditLog
        const returns = await prisma.auditLog.findMany({
            where: {
                userId: user.id,
                action: "ADHOC_RETURN"
            },
            orderBy: { createdAt: "desc" }
        });

        // 3. Normalize into Unified Activity Feed
        const activities: any[] = [];

        // Map Picklists
        picklists.forEach(p => {
            const isSelfService = p.title?.includes("Self-Service");
            activities.push({
                id: p.id,
                type: isSelfService ? "SCAN" : "MANIFEST",
                title: isSelfService ? "Ambil Barang (Scan)" : p.title,
                status: p.status,
                timestamp: p.updatedAt,
                code: p.code,
                projectName: p.project?.namaProjek || "-",
                itemCount: p.lines.length,
                meta: {
                    projectId: p.projectId,
                    imageUrl: p.pickingImage // Use picking image as sample
                }
            });
        });

        // Map Returns
        returns.forEach(r => {
            let meta: any = {};
            try { meta = JSON.parse(r.metaJson || "{}"); } catch (e) { }

            activities.push({
                id: r.id,
                type: "RETURN",
                title: "Retur Sisa Barang",
                status: "RETURNED",
                timestamp: r.createdAt,
                code: `RET-${new Date(r.createdAt).getTime().toString().slice(-6)}`,
                projectName: "Ad-hoc (Sisa)",
                itemCount: meta.items?.length || 0,
                // Include details for frontend modal
                items: meta.items || [],
                meta: {
                    imageUrl: meta.imageUrl,
                    imageUrls: meta.imageUrls || (meta.imageUrl ? [meta.imageUrl] : [])
                }
            });
        });

        // Sort all by timestamp DESC
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json({ data: activities });
    } catch (error: any) {
        console.error("[API_HISTORY]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
