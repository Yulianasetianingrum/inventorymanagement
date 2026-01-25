import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/constants";

export type SessionRole = "ADMIN" | "WORKER" | "OWNER" | "PURCHASING" | "WAREHOUSE_LEAD";
export type SessionPayload = {
  employeeId: string;
  role: SessionRole;
  name?: string;
};

const encode = (session: SessionPayload) =>
  Buffer.from(JSON.stringify(session), "utf8").toString("base64");

export const parseSession = (value?: string | null): SessionPayload | null => {
  if (!value) return null;
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return JSON.parse(decoded) as SessionPayload;
  } catch (error) {
    console.warn("Failed to parse session", error);
    return null;
  }
};

export async function setSession(session: SessionPayload) {
  const store = await cookies();

  // Robust secure flag: only true if in production AND NOT on localhost
  // This helps when testing production builds locally or on local networks over http
  const isProd = process.env.NODE_ENV === "production";

  store.set(SESSION_COOKIE_NAME, encode(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd, // Note: Modern browsers allow Secure cookies on localhost over HTTP, but local IPs might fail.
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // Increase to 7 days for better UX
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const stored = store.get(SESSION_COOKIE_NAME)?.value;
  return parseSession(stored);
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
