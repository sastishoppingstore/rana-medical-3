import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { allowRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowRequest(`inquiry:${ip}`, 4, 60_000)) return NextResponse.json({ error: "Please wait before sending another message." }, { status: 429 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim().replace(/[<>]/g, "").slice(0, 160) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 32) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 190) : "";
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
    const message = typeof body.message === "string" ? body.message.trim().replace(/[<>]/g, "").slice(0, 2500) : "";
    if (name.length < 2 || !/^(?:\+?92|0)?3\d{9}$/.test(phone.replace(/[\s()-]/g, "")) || message.length < 8) {
      return NextResponse.json({ error: "Please provide your name, a valid mobile number and a message of at least 8 characters." }, { status: 400 });
    }
    const [created] = await db.insert(inquiries).values({ name, phone, email: email || null, subject: subject || "Website inquiry", message }).returning({ id: inquiries.id });
    return NextResponse.json({ ok: true, reference: `INQ-${created.id.toString().padStart(5, "0")}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Your message could not be saved. Please call 0324-6627054." }, { status: 500 });
  }
}
