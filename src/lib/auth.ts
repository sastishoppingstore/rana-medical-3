import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const roles = ["super-admin", "doctor", "receptionist", "lab-technician", "pharmacist", "accountant"] as const;
export type Role = (typeof roles)[number];

const sessionCookie = "rana_session";
const sessionSecret = () => process.env.SESSION_SECRET || process.env.DATABASE_URL || "local-rana-demo-session-secret";

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (roles as readonly string[]).includes(value);
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(role: Role, demo: boolean, subject?: string) {
  const payload = Buffer.from(JSON.stringify({ role, demo, subject: subject ?? null, expires: Date.now() + 1000 * 60 * 60 * 10 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token?: string | null): { role: Role; demo: boolean; subject: string | null } | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: unknown; demo?: unknown; subject?: unknown; expires?: unknown };
    if (!isRole(data.role) || typeof data.expires !== "number" || data.expires < Date.now()) return null;
    return { role: data.role, demo: data.demo === true, subject: typeof data.subject === "string" ? data.subject : null };
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return readSessionToken(store.get(sessionCookie)?.value);
}

/* Reads a stateless bearer token first (cross-origin hosting), then the cookie. */
export async function getSessionFrom(request?: Request) {
  if (request) {
    const header = request.headers.get("authorization") || "";
    if (header.startsWith("Bearer ")) {
      const fromHeader = readSessionToken(header.slice(7));
      if (fromHeader) return fromHeader;
    }
  }
  return getSession();
}

export const sessionCookieName = sessionCookie;
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  path: "/",
  maxAge: 60 * 60 * 10,
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  try {
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

export const rolePermissions: Record<Role, string[]> = {
  "super-admin": ["dashboard", "opd", "patients", "doctors", "admissions", "lab", "pharmacy", "accounts", "hr", "cms", "inquiries", "operations", "audit"],
  doctor: ["dashboard", "opd", "patients", "lab", "prescriptions"],
  receptionist: ["dashboard", "opd", "patients", "admissions", "inquiries"],
  "lab-technician": ["dashboard", "lab"],
  pharmacist: ["dashboard", "pharmacy"],
  accountant: ["dashboard", "accounts", "reports", "hr", "inquiries"],
};

export function hasPermission(role: Role, permission: string) {
  return rolePermissions[role].includes(permission);
}
