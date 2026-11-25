import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts, departments, doctors, faqs, healthcarePackages, labTests, testimonials, websiteServices } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [departmentRows, doctorRows, serviceRows, packageRows, testRows, articleRows, faqRows, reviewRows] = await Promise.all([
      db.select().from(departments).orderBy(asc(departments.name)),
      db.select({ id: doctors.id, name: doctors.name, specialty: doctors.specialty, departmentId: doctors.departmentId, qualifications: doctors.qualifications, pmdcRegistration: doctors.pmdcRegistration, experienceYears: doctors.experienceYears, consultationFee: doctors.consultationFee, opdDays: doctors.opdDays, opdTimings: doctors.opdTimings, availableSlots: doctors.availableSlots, photoUrl: doctors.photoUrl, isDemo: doctors.isDemo }).from(doctors).where(eq(doctors.isActive, true)).orderBy(asc(doctors.name)),
      db.select().from(websiteServices).where(eq(websiteServices.isActive, true)).orderBy(asc(websiteServices.sortOrder)),
      db.select().from(healthcarePackages).where(eq(healthcarePackages.isActive, true)).orderBy(asc(healthcarePackages.id)),
      db.select().from(labTests).where(eq(labTests.isActive, true)).orderBy(asc(labTests.name)),
      db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(asc(blogPosts.id)),
      db.select().from(faqs).where(eq(faqs.isPublished, true)).orderBy(asc(faqs.sortOrder)),
      db.select().from(testimonials).where(eq(testimonials.isPublished, true)).orderBy(asc(testimonials.id)),
    ]);
    return NextResponse.json({ departments: departmentRows, doctors: doctorRows, services: serviceRows, packages: packageRows, tests: testRows, articles: articleRows, faqs: faqRows, testimonials: reviewRows }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Public content is temporarily unavailable." }, { status: 503 });
  }
}
