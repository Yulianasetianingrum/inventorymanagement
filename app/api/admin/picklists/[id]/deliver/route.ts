import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "OWNER")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const picklist = await prisma.picklist.findUnique({ where: { id } });
        if (!picklist) return NextResponse.json({ error: "Picklist not found" }, { status: 404 });

        if (picklist.status !== "PICKED") {
            return NextResponse.json({ error: "Hanya picklist dengan status PICKED yang bisa diselesaikan." }, { status: 400 });
        }

        const updated = await prisma.picklist.update({
            where: { id },
            data: {
                status: "DELIVERED",
                deliveredAt: new Date(),
                events: {
                    create: {
                        eventType: "MARKED_DELIVERED",
                        actorUserId: (await prisma.user.findUnique({ where: { employeeId: session.employeeId } }))?.id
                    }
                }
            }
        });

        return NextResponse.json({ ok: true, data: updated });
    } catch (error: any) {
        console.error("Deliver failed", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
