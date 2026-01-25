// D:\inventorymanagement\app\api\auth\login-worker\route.ts
import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth/session";
import { readJsonOrForm, validateLoginPayload } from "@/lib/validators";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { prisma } from "@/lib/prisma";
import { verifySecret } from "@/lib/auth/password";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ message: "Use POST to sign in as worker" }, { status: 405 });
}

export async function POST(req: Request) {
  const payload = await readJsonOrForm(req);
  const { valid, missing } = validateLoginPayload(payload, ["employeeId", "password"]);

  const contentType = req.headers.get("content-type") || "";
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");
  const accept = req.headers.get("accept") || "";
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  const employeeId = String(payload.employeeId ?? "").trim();
  const password = String(payload.password ?? "").trim();
  const rateKey = `worker-${employeeId || "unknown"}-${ip}`;

  if (!checkRateLimit(rateKey, 8, 5 * 60 * 1000)) {
    const url = new URL("/worker/login?error=rate_limit", req.url);
    if (isForm || accept.includes("text/html")) return NextResponse.redirect(url);
    return NextResponse.json({ error: "Too many attempts, try again later" }, { status: 429 });
  }

  if (!valid) {
    const url = new URL("/worker/login?error=missing", req.url);
    if (isForm || accept.includes("text/html")) return NextResponse.redirect(url);
    return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
  }

  // NOTE: select() to avoid querying removed columns (ex: pinHash)
  const user = await prisma.user.findUnique({
    where: { employeeId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      role: true,
      passwordHash: true,
      isActive: true,
    },
  });

  // Jika akun valid tapi bukan WORKER, beri tahu portal salah.
  if (user && user.role !== "WORKER") {
    const url = new URL("/worker/login?error=wrong_portal", req.url);
    if (isForm || accept.includes("text/html")) return NextResponse.redirect(url);
    return NextResponse.json({ error: "Wrong portal. Gunakan halaman login admin." }, { status: 403 });
  }

  if (!user || !user.passwordHash) {
    const url = new URL("/worker/login?error=unauthorized", req.url);
    if (isForm || accept.includes("text/html")) return NextResponse.redirect(url);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.isActive === false) {
    const url = new URL("/worker/login?error=inactive", req.url);
    if (isForm || accept.includes("text/html")) return NextResponse.redirect(url);
    return NextResponse.json({ error: "Inactive" }, { status: 403 });
  }

  const ok = await verifySecret(password, user.passwordHash);
  if (!ok) {
    const url = new URL("/worker/login?error=unauthorized", req.url);
    if (isForm || accept.includes("text/html")) return NextResponse.redirect(url);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // update last login (best-effort) - also use select() so Prisma won't select pinHash
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: { id: true },
    });
  } catch {}

  const session = { employeeId: user.employeeId, role: "WORKER" as const, name: user.name };
  await setSession(session);

  if (isForm || accept.includes("text/html")) {
    return NextResponse.redirect(new URL("/worker/home", req.url));
  }
  return NextResponse.json({ ok: true, user: session });
}
