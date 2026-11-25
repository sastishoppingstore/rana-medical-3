import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { labReports, labTests, patients } from "@/db/schema";
import { allowRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowRequest(`report-lookup:${ip}`, 8, 60_000)) return NextResponse.json({ error: "Too many attempts. Please wait before trying again." }, { status: 429 });
  try {
    const body = await request.json() as { reference?: unknown; mobile?: unknown };
    const reference = typeof body.reference === "string" ? body.reference.trim().slice(0, 40) : "";
    const mobile = typeof body.mobile === "string" ? body.mobile.trim().replace(/[\s()-]/g, "") : "";
    if (!reference || !/^(?:\+?92|0)?3\d{9}$/.test(mobile)) return NextResponse.json({ error: "Enter a lab reference and valid registered mobile number." }, { status: 400 });
    const localPhone = mobile.startsWith("+92") ? `0${mobile.slice(3)}` : mobile.startsWith("92") ? `0${mobile.slice(2)}` : mobile;
    const [report] = await db.select({
      report: labReports,
      patientName: patients.name,
      patientPhone: patients.phone,
      testName: labTests.name,
    }).from(labReports).innerJoin(patients, eq(labReports.patientId, patients.id)).innerJoin(labTests, eq(labReports.testId, labTests.id)).where(and(
      eq(labReports.reportReference, reference),
      eq(patients.phone, localPhone),
      eq(labReports.authorized, true),
      eq(labReports.status, "Published"),
    )).limit(1);
    if (!report) return NextResponse.json({ error: "No published report matched both details. Check the reference and registered mobile, or contact the laboratory." }, { status: 404 });
    return NextResponse.json({
      report: {
        reference: report.report.reportReference,
        patientName: report.patientName,
        testName: report.testName,
        sampleDate: report.report.sampleDate,
        status: report.report.status,
        authorized: report.report.authorized,
        isDemo: report.report.isDemo,
        results: report.report.resultValues,
      },
    }, { headers: { "Cache-Control": "no-store", "Pragma": "no-cache" } });
  } catch {
    return NextResponse.json({ error: "Report verification is temporarily unavailable." }, { status: 503 });
  }
}
