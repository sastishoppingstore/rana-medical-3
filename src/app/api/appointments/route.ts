import { and, eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, departments, doctors, patients } from "@/db/schema";
import { getSessionFrom } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const safeText = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/[<>]/g, "").slice(0, max) : "";
const reference = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowRequest(`appointment:${ip}`, 5, 60_000)) return NextResponse.json({ error: "Too many booking attempts. Please call reception for help." }, { status: 429 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const source = body.source === "walk-in" ? "walk-in" : "website";
    if (source === "walk-in") {
      const session = await getSessionFrom(request);
      if (!session || !["receptionist", "super-admin"].includes(session.role)) return NextResponse.json({ error: "Only Receptionist or Super Admin sessions can register a walk-in queue entry." }, { status: 403 });
    }
    const name = safeText(body.name, 160);
    const mobile = safeText(body.mobile, 24).replace(/[\s()-]/g, "");
    const departmentName = safeText(body.department, 100);
    const dateValue = safeText(body.date, 10);
    const timeSlot = safeText(body.timeSlot, 80);
    const doctorId = Number(body.doctorId) || null;
    if (name.length < 2) return NextResponse.json({ error: "Please enter the patient's full name." }, { status: 400 });
    if (!/^(?:\+?92|0)?3\d{9}$/.test(mobile)) return NextResponse.json({ error: "Enter a valid Pakistani mobile number, for example 03XX-XXXXXXX." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) || Number.isNaN(Date.parse(`${dateValue}T00:00:00`)) || dateValue < new Date().toISOString().slice(0, 10)) {
      return NextResponse.json({ error: "Choose a valid appointment date that is today or later." }, { status: 400 });
    }
    if (!departmentName || !timeSlot) return NextResponse.json({ error: "Choose a department and available time." }, { status: 400 });
    const [department] = await db.select().from(departments).where(eq(departments.name, departmentName)).limit(1);
    if (!department) return NextResponse.json({ error: "That department is not currently available online." }, { status: 400 });
    if (doctorId) {
      const [doctor] = await db.select().from(doctors).where(and(eq(doctors.id, doctorId), eq(doctors.isActive, true))).limit(1);
      if (!doctor) return NextResponse.json({ error: "That doctor is no longer available. Please choose another." }, { status: 400 });
      if (doctor.departmentId && doctor.departmentId !== department.id) return NextResponse.json({ error: "The selected doctor does not belong to this department." }, { status: 400 });
    }
    const localPhone = mobile.startsWith("+92") ? `0${mobile.slice(3)}` : mobile.startsWith("92") ? `0${mobile.slice(2)}` : mobile;
    const appointment = await db.transaction(async (tx) => {
      const [existingPatient] = await tx.select().from(patients).where(eq(patients.phone, localPhone)).limit(1);
      const [patient] = existingPatient ? [existingPatient] : await tx.insert(patients).values({
        patientRef: reference("RMH-P"),
        name,
        phone: localPhone,
        isDemo: false,
      }).returning();
      const referenceCode = reference("RMH");
      const tokenCode = reference("OPD");
      const [created] = await tx.insert(appointments).values({
        reference: referenceCode,
        token: tokenCode,
        patientId: patient.id,
        doctorId,
        departmentId: department.id,
        appointmentDate: dateValue,
        timeSlot,
        status: "Waiting",
        source,
      }).returning();
      return { ...created, patientName: name, departmentName: department.name };
    });

    let whatsapp = {
      status: "fallback",
      url: `https://wa.me/923246627054?text=${encodeURIComponent(`Hello Rana Medical Hospital, I have requested appointment ${appointment.reference} for ${name} on ${dateValue} at ${timeSlot}. Please confirm my booking.`)}`,
    };
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (phoneId && accessToken) {
      try {
        const to = (mobile.startsWith("+") ? mobile.slice(1) : mobile.startsWith("0") ? `92${mobile.slice(1)}` : mobile).replace(/\D/g, "");
        const response = await fetch(`https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || "v21.0"}/${phoneId}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: `Rana Medical Hospital appointment request ${appointment.reference}. Token ${appointment.token}. ${dateValue} at ${timeSlot}. Please contact 0324-6627054 if you need help.` } }),
          cache: "no-store",
        });
        whatsapp = { status: response.ok ? "sent" : "configured_error", url: whatsapp.url };
      } catch {
        whatsapp = { status: "configured_error", url: whatsapp.url };
      }
    }
    return NextResponse.json({ ok: true, appointment, whatsapp }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "We could not save your appointment. Please call 0324-6627054." }, { status: 500 });
  }
}
