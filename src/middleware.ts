import { NextRequest, NextResponse } from "next/server";

const ALLOWED = (process.env.ALLOWED_ORIGINS || "https://wafasmart.tech,https://www.wafasmart.tech")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function permitted(origin: string) {
  if (!origin) return false;
  if (ALLOWED.includes(origin)) return true;
  return /^https:\/\/([a-z0-9-]+\.)*(wafasmart\.tech|web\.app|firebaseapp\.com)$/i.test(origin)
    || /^http:\/\/localhost(:\d+)?$/.test(origin);
}

/* Cross-origin support: the clinic frontends are served from Firebase Hosting
 * while these API routes live on Vercel. Bearer tokens are used for auth. */
export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const allow = permitted(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allow ? origin : ALLOWED[0] || "https://wafasmart.tech",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (allow) headers["Access-Control-Allow-Credentials"] = "true";

  if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers });

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
}

export const config = { matcher: ["/api/:path*"] };
