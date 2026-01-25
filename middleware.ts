import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { parseSession } from "@/lib/auth/session";

const adminPaths = [
  "/dashboard",
  "/karyawan",
  "/items",
  "/locations",
  "/stock",
  "/picklists",
  "/projects",
  "/audit",
];

const workerPrefix = "/worker";
const publicPaths = ["/login", "/worker/login"];

function isAdminPath(pathname: string) {
  return adminPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isWorkerPath(pathname: string) {
  return pathname === workerPrefix || pathname.startsWith(`${workerPrefix}/`);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicPaths.includes(pathname)) {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy", "geolocation=(), camera=(self), microphone=()");
    return res;
  }

  const raw = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = parseSession(raw);

  if (isAdminPath(pathname)) {
    if (!session || session.role !== "ADMIN") {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.headers.set("X-Frame-Options", "SAMEORIGIN");
      res.headers.set("X-Content-Type-Options", "nosniff");
      res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      res.headers.set("Permissions-Policy", "geolocation=(), camera=(self), microphone=()");
      return res;
    }
  } else if (isWorkerPath(pathname)) {
    if (!session || (session.role !== "WORKER" && session.role !== "ADMIN")) {
      const res = NextResponse.redirect(new URL("/worker/login", req.url));
      res.headers.set("X-Frame-Options", "SAMEORIGIN");
      res.headers.set("X-Content-Type-Options", "nosniff");
      res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      res.headers.set("Permissions-Policy", "geolocation=(), camera=(self), microphone=()");
      return res;
    }
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), camera=(self), microphone=()");
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/karyawan/:path*",
    "/items/:path*",
    "/locations/:path*",
    "/stock/:path*",
    "/picklists/:path*",
    "/projects/:path*",
    "/audit/:path*",
    "/worker/:path*",
  ],
};
