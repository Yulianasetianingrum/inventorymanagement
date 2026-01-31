import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
    const session = await getSession();
    if (!session || (session.role !== "WORKER" && session.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const projects = await prisma.project.findMany({
            where: {
                picklists: {
                    some: {
                        status: { in: ['READY', 'PICKING', 'PICKED'] },
                        neededAt: { gte: now }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                namaProjek: true,
                namaKlien: true,
            },
        });

        return NextResponse.json({ data: projects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
