import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { departments, doctors } from "@/db/schema";
import { getSessionFrom } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select({
      id: doctors.id,
      name: doctors.name,
      specialty: doctors.specialty,
      departmentId: doctors.departmentId,
      department: departments.name,
      qualifications: doctors.qualifications,
      pmdcRegistration: doctors.pmdcRegistration,
      experienceYears: doctors.experienceYears,
      consultationFee: doctors.consultationFee,
      opdDays: doctors.opdDays,
      opdTimings: doctors.opdTimings,
      availableSlots: doctors.availableSlots,
      photoUrl: doctors.photoUrl,
      isDemo: doctors.isDemo,
    }).from(doctors).leftJoin(departments, eq(doctors.departmentId, departments.id)).where(eq(doctors.isActive, true)).orderBy(asc(doctors.name));
    return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Doctor directory is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowRequest(`doctor-write:${ip}`, 8)) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429 });
  const session = await getSessionFrom(request);
  if (!session || session.role !== "super-admin") return NextResponse.json({ error: "Only an authorized administrator can manage the doctor directory." }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
    const specialty = typeof body.specialty === "string" ? body.specialty.trim().slice(0, 120) : "";
    const qualifications = typeof body.qualifications === "string" ? body.qualifications.trim().slice(0, 240) : "";
    const consultationFee = Number(body.consultationFee);
    if (!name || !specialty || !qualifications || !Number.isFinite(consultationFee) || consultationFee < 0 || consultationFee > 1_000_000) {
      return NextResponse.json({ error: "Name, specialty, qualifications and a valid PKR consultation fee are required." }, { status: 400 });
    }
    const departmentName = typeof body.department === "string" ? body.department.trim() : specialty;
    const [department] = await db.insert(departments).values({ name: departmentName }).onConflictDoNothing().returning();
    const existingDepartment = department ?? (await db.select().from(departments).where(eq(departments.name, departmentName)).limit(1))[0];
    const [created] = await db.insert(doctors).values({
      name,
      specialty,
      departmentId: existingDepartment?.id ?? null,
      qualifications,
      pmdcRegistration: typeof body.pmdcRegistration === "string" && body.pmdcRegistration.trim() ? body.pmdcRegistration.trim().slice(0, 100) : "Not supplied — verification required",
      experienceYears: Math.max(0, Math.min(70, Number(body.experienceYears) || 0)),
      consultationFee: Math.round(consultationFee),
      opdDays: typeof body.opdDays === "string" ? body.opdDays.trim().slice(0, 160) : "Confirm with reception",
      opdTimings: typeof body.opdTimings === "string" ? body.opdTimings.trim().slice(0, 120) : "Confirm with reception",
      availableSlots: Math.max(0, Math.min(99, Number(body.availableSlots) || 0)),
      isDemo: true,
    }).returning();
    return NextResponse.json({ ok: true, doctor: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save this doctor. Check that the department name is valid." }, { status: 500 });
  }
}
