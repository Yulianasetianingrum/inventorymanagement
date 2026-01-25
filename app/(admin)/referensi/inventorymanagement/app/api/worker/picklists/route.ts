import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PicklistStatus } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const tab = url.searchParams.get("tab") || "active";
  const search = url.searchParams.get("search")?.toLowerCase() ?? "";
  const shortageOnly = url.searchParams.get("shortage") === "1";
  const statusFilter =
    tab === "done"
      ? { in: [PicklistStatus.PICKED, PicklistStatus.DELIVERED] }
      : { in: [PicklistStatus.READY, PicklistStatus.PICKING] };

  const picklists = await prisma.picklist.findMany({
    where: {
      assignee: { employeeId: session.employeeId },
      status: statusFilter,
    },
    include: { lines: true, project: true },
    orderBy: { neededAt: "asc" },
  });

  const filtered = picklists.filter((p) => {
    const matchesSearch =
      !search ||
      p.code.toLowerCase().includes(search) ||
      (p.title ?? "").toLowerCase().includes(search) ||
      (p.project?.name ?? "").toLowerCase().includes(search);
    const shortage = p.lines.filter((l) => l.pickedQty < l.reqQty).length;
    const matchesShortage = shortageOnly ? shortage > 0 : true;
    return matchesSearch && matchesShortage;
  });

  const data = filtered.map((p) => {
    const progressDone = p.lines.filter((l) => l.pickedQty >= l.reqQty).length;
    const progressTotal = p.lines.length || 1;
    const shortage = p.lines.filter((l) => l.pickedQty < l.reqQty).length;
    return {
      id: p.id,
      code: p.code,
      title: p.title ?? p.project?.name ?? "",
      status: p.status,
      neededAt: p.neededAt ? p.neededAt.toISOString().slice(0, 10) : "",
      progressDone,
      progressTotal,
      shortage,
    };
  });

  return NextResponse.json({ data });
}
