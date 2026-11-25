import { NextRequest, NextResponse } from "next/server";
import { getSessionFrom } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSessionFrom(request);
  return NextResponse.json(session ? { authenticated: true, ...session } : { authenticated: false }, { headers: { "Cache-Control": "no-store" } });
}
