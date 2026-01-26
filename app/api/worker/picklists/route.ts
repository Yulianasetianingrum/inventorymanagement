import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== "WORKER" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab");

  try {
    const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const picklists = await prisma.picklist.findMany({
      where: {
        assigneeId: user.id,
        ...(tab === "active" ? { status: { in: ["READY", "PICKING"] } } : {}),
        ...(tab === "picked" ? { status: "PICKED" } : {}),
        ...(tab === "history" ? { status: { in: ["DELIVERED", "CANCELED"] } } : {}),
        ...(!tab ? { status: { not: "CANCELED" } } : {}), // Default behavior if no tab
      },
      orderBy: { createdAt: "desc" },
      include: {
        project: true,
        lines: {
          select: {
            reqQty: true,
            pickedQty: true
          }
        }
      },
    });

    const enriched = picklists.map(p => {
      const progressTotal = p.lines.length;
      const progressDone = p.lines.filter(l => l.pickedQty >= l.reqQty).length;
      const shortage = p.lines.filter(l => l.pickedQty < l.reqQty).length;

      // Omit lines from the response to keep it light
      const { lines, ...rest } = p;
      return {
        ...rest,
        progressTotal,
        progressDone,
        shortage
      };
    });

    return NextResponse.json({ data: enriched });
  } catch (error: any) {
    console.error("[API_PICKLISTS]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
