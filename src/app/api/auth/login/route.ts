import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, isRole, sessionCookieName, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowRequest(`login:${address}`, 8, 60_000)) return NextResponse.json({ error: "Too many sign-in attempts. Please try again in a minute." }, { status: 429 });
  try {
    const body = await request.json() as { role?: unknown; email?: unknown; password?: unknown };
    const demoEnabled = process.env.ENABLE_DEMO_ACCESS !== "false";
    if (demoEnabled && isRole(body.role)) {
      const token = createSessionToken(body.role, true);
      const response = NextResponse.json({ ok: true, role: body.role, demo: true, token });
      response.cookies.set(sessionCookieName, token, sessionCookieOptions);
      return response;
    }
    if (typeof body.email !== "string" || typeof body.password !== "string" || body.password.length > 200) {
      return NextResponse.json({ error: demoEnabled ? "Choose a demo role or enter your staff credentials." : "Enter your staff email and password." }, { status: 400 });
    }
    const email = body.email.trim().toLowerCase();
    const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.isActive, true))).limit(1);
    if (!user || !verifyPassword(body.password, user.passwordHash)) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    const token = createSessionToken(isRole(user.role) ? user.role : "receptionist", false, user.email);
    const response = NextResponse.json({ ok: true, role: user.role, demo: false, token });
    response.cookies.set(sessionCookieName, token, sessionCookieOptions);
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
