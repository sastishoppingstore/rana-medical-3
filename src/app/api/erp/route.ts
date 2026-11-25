import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  admissions,
  appointments,
  auditLogs,
  beds,
  departments,
  doctors,
  expenses,
  healthcarePackages,
  faqs,
  inquiries,
  invoiceItems,
  invoices,
  labReports,
  labSamples,
  labTests,
  medicines,
  opdVisits,
  patients,
  patientVitals,
  payments,
  pharmacySaleItems,
  pharmacySales,
  prescriptions,
  prescriptionItems,
  diagnoses,
  wards,
  employees,
  blogPosts,
} from "@/db/schema";
import { getSessionFrom, hasPermission, type Role } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const ref = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
const textValue = (value: unknown, max = 500) => typeof value === "string" ? value.trim().replace(/[<>]/g, "").slice(0, max) : "";
const amountValue = (value: unknown) => Number.isFinite(Number(value)) ? Math.round(Number(value)) : -1;
const dayString = (date = new Date()) => date.toISOString().slice(0, 10);
const localPhone = (value: string) => {
  const normalized = value.replace(/[\s()-]/g, "");
  if (normalized.startsWith("+92")) return `0${normalized.slice(3)}`;
  if (normalized.startsWith("92")) return `0${normalized.slice(2)}`;
  return normalized;
};

function can(role: Role, permission: string) {
  return hasPermission(role, permission);
}

async function audit(role: Role, action: string, entityType: string, entityId?: number | string, details: Record<string, unknown> = {}) {
  await db.insert(auditLogs).values({ actorRole: role, action, entityType, entityId: entityId === undefined ? null : String(entityId), details });
}

async function dashboardData() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const today = dayString();
  const [opd, activeBeds, income, onlineIncome, pendingLab, lowStock, dayExpense, recent, allAppointments, recentInvoices, recentExpenses] = await Promise.all([
    db.select({ value: count() }).from(appointments).where(eq(appointments.appointmentDate, today)),
    db.select({ value: count() }).from(admissions).where(eq(admissions.status, "Admitted")),
    db.select({ value: sql<number>`coalesce(sum(${invoices.total}), 0)::int` }).from(invoices).where(gte(invoices.createdAt, start)),
    db.select({ value: sql<number>`coalesce(sum(${payments.amount}), 0)::int` }).from(payments).where(and(eq(payments.method, "Online"), gte(payments.createdAt, start))),
    db.select({ value: count() }).from(labReports).where(sql`${labReports.status} <> 'Published'`),
    db.select({ value: count() }).from(medicines).where(sql`${medicines.stock} <= ${medicines.lowStockAt}`),
    db.select({ value: sql<number>`coalesce(sum(${expenses.amount}), 0)::int` }).from(expenses).where(gte(expenses.createdAt, start)),
    db.select({ appointment: appointments, patientName: patients.name, patientRef: patients.patientRef, doctorName: doctors.name, departmentName: departments.name })
      .from(appointments).innerJoin(patients, eq(appointments.patientId, patients.id)).leftJoin(doctors, eq(appointments.doctorId, doctors.id)).leftJoin(departments, eq(appointments.departmentId, departments.id)).orderBy(desc(appointments.createdAt)).limit(7),
    db.select({ date: appointments.appointmentDate }).from(appointments).where(gte(appointments.appointmentDate, dayString(new Date(Date.now() - 6 * 86_400_000)))),
    db.select({ createdAt: invoices.createdAt, total: invoices.total }).from(invoices).where(gte(invoices.createdAt, new Date(Date.now() - 7 * 86_400_000))),
    db.select({ createdAt: expenses.createdAt, amount: expenses.amount }).from(expenses).where(gte(expenses.createdAt, new Date(Date.now() - 7 * 86_400_000))),
  ]);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 86_400_000);
    return { key: dayString(date), label: date.toLocaleDateString("en-PK", { weekday: "short" }) };
  });
  const chart = days.map((day) => ({
    ...day,
    patients: allAppointments.filter((item) => String(item.date) === day.key).length,
    income: recentInvoices.filter((item) => dayString(new Date(item.createdAt)) === day.key).reduce((sum, item) => sum + item.total, 0),
    expenses: recentExpenses.filter((item) => dayString(new Date(item.createdAt)) === day.key).reduce((sum, item) => sum + item.amount, 0),
  }));
  const revenue = Number(income[0]?.value ?? 0);
  const expenseTotal = Number(dayExpense[0]?.value ?? 0);
  return {
    kpis: {
      todayOpd: Number(opd[0]?.value ?? 0),
      activeIpd: Number(activeBeds[0]?.value ?? 0),
      todayRevenue: revenue,
      onlineRevenue: Number(onlineIncome[0]?.value ?? 0),
      pendingLab: Number(pendingLab[0]?.value ?? 0),
      lowStock: Number(lowStock[0]?.value ?? 0),
      dailyExpenses: expenseTotal,
      netProfit: revenue - expenseTotal,
    },
    chart,
    queue: recent.map((row) => ({
      id: row.appointment.id,
      token: row.appointment.token,
      reference: row.appointment.reference,
      name: row.patientName,
      patientRef: row.patientRef,
      doctor: row.doctorName || "Unassigned",
      department: row.departmentName || "General",
      date: row.appointment.appointmentDate,
      time: row.appointment.timeSlot,
      status: row.appointment.status,
    })),
  };
}

export async function GET(request: NextRequest) {
  const session = await getSessionFrom(request);
  if (!session) return NextResponse.json({ error: "Sign in to access hospital records." }, { status: 401 });
  const resource = request.nextUrl.searchParams.get("resource") || "dashboard";
  const permissionMap: Record<string, string> = {
    dashboard: "dashboard", appointments: "opd", patients: "patients", doctors: "doctors", admissions: "admissions", beds: "admissions",
    lab: "lab", pharmacy: "pharmacy", accounts: "accounts", employees: "hr", inquiries: "inquiries", cms: "cms", audit: "audit",
  };
  const permission = permissionMap[resource];
  if (!permission || !can(session.role, permission)) return NextResponse.json({ error: "Your staff role does not have access to this module." }, { status: 403 });
  try {
    if (resource === "dashboard") return NextResponse.json(await dashboardData(), { headers: { "Cache-Control": "no-store" } });
    if (resource === "appointments") {
      const rows = await db.select({ appointment: appointments, patient: patients, doctor: doctors, department: departments }).from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id)).leftJoin(doctors, eq(appointments.doctorId, doctors.id)).leftJoin(departments, eq(appointments.departmentId, departments.id)).orderBy(desc(appointments.createdAt)).limit(150);
      return NextResponse.json({ rows: rows.map((row) => ({ ...row.appointment, patient: { id: row.patient.id, patientRef: row.patient.patientRef, name: row.patient.name, phone: row.patient.phone }, doctor: row.doctor?.name ?? "Unassigned", department: row.department?.name ?? "General" })) }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "patients") {
      const rows = await db.select().from(patients).orderBy(desc(patients.createdAt)).limit(150);
      return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "doctors") {
      const rows = await db.select({ doctor: doctors, department: departments.name }).from(doctors).leftJoin(departments, eq(doctors.departmentId, departments.id)).orderBy(asc(doctors.name));
      return NextResponse.json({ rows: rows.map((row) => ({ ...row.doctor, department: row.department })) }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "lab") {
      const [reports, tests] = await Promise.all([
        db.select({ report: labReports, patient: patients, test: labTests }).from(labReports).innerJoin(patients, eq(labReports.patientId, patients.id)).innerJoin(labTests, eq(labReports.testId, labTests.id)).orderBy(desc(labReports.createdAt)).limit(100),
        db.select().from(labTests).where(eq(labTests.isActive, true)).orderBy(asc(labTests.name)),
      ]);
      return NextResponse.json({ rows: reports.map((row) => ({ ...row.report, patient: { id: row.patient.id, patientRef: row.patient.patientRef, name: row.patient.name, phone: row.patient.phone }, test: row.test })), tests }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "pharmacy") {
      const [stock, sales] = await Promise.all([
        db.select().from(medicines).orderBy(asc(medicines.name)),
        db.select().from(pharmacySales).orderBy(desc(pharmacySales.createdAt)).limit(30),
      ]);
      return NextResponse.json({ rows: stock, sales }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "admissions" || resource === "beds") {
      const [admissionRows, bedRows, patientChoices] = await Promise.all([
        db.select({ admission: admissions, patient: patients, bed: beds, ward: wards }).from(admissions).innerJoin(patients, eq(admissions.patientId, patients.id)).innerJoin(beds, eq(admissions.bedId, beds.id)).innerJoin(wards, eq(beds.wardId, wards.id)).orderBy(desc(admissions.admittedAt)).limit(100),
        db.select({ bed: beds, ward: wards }).from(beds).innerJoin(wards, eq(beds.wardId, wards.id)).orderBy(asc(wards.name), asc(beds.bedNumber)),
        db.select({ id: patients.id, patientRef: patients.patientRef, name: patients.name, phone: patients.phone }).from(patients).orderBy(asc(patients.name)).limit(250),
      ]);
      return NextResponse.json({ rows: admissionRows.map((row) => ({ ...row.admission, patient: { id: row.patient.id, patientRef: row.patient.patientRef, name: row.patient.name, phone: row.patient.phone }, bed: row.bed.bedNumber, ward: row.ward.name })), beds: bedRows.map((row) => ({ ...row.bed, ward: row.ward.name, dailyRate: row.ward.dailyRate })), patients: patientChoices }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "accounts") {
      const [invoiceRows, expenseRows, totals] = await Promise.all([
        db.select({ invoice: invoices, patientName: patients.name }).from(invoices).leftJoin(patients, eq(invoices.patientId, patients.id)).orderBy(desc(invoices.createdAt)).limit(100),
        db.select().from(expenses).orderBy(desc(expenses.createdAt)).limit(100),
        db.select({ income: sql<number>`coalesce(sum(${invoices.total}), 0)::int`, paid: sql<number>`coalesce(sum(${invoices.paid}), 0)::int` }).from(invoices),
      ]);
      return NextResponse.json({ invoices: invoiceRows.map((row) => ({ ...row.invoice, patientName: row.patientName || "Walk-in" })), expenses: expenseRows, totals: totals[0] }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "employees") {
      const rows = await db.select({ employee: employees, department: departments.name }).from(employees).leftJoin(departments, eq(employees.departmentId, departments.id)).orderBy(asc(employees.fullName));
      return NextResponse.json({ rows: rows.map((row) => ({ ...row.employee, department: row.department })) }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "inquiries") {
      const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(100);
      return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "cms") {
      const [packageRows, articles, faqs] = await Promise.all([
        db.select().from(healthcarePackages).orderBy(asc(healthcarePackages.id)),
        db.select().from(blogPosts).orderBy(desc(blogPosts.id)),
        db.select().from((await import("@/db/schema")).faqs).orderBy(asc((await import("@/db/schema")).faqs.sortOrder)),
      ]);
      return NextResponse.json({ packages: packageRows, articles, faqs }, { headers: { "Cache-Control": "no-store" } });
    }
    if (resource === "audit") {
      const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
      return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "Unknown module." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "The requested module is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowRequest(`erp-write:${address}`, 60, 60_000)) return NextResponse.json({ error: "Too many changes in a short time. Please try again." }, { status: 429 });
  const session = await getSessionFrom(request);
  if (!session) return NextResponse.json({ error: "Sign in to make hospital record changes." }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = textValue(body.action, 60);
    const required: Record<string, string> = {
      register_patient: "patients", update_appointment: "opd", add_doctor: "doctors", create_lab_order: "lab", publish_lab_report: "lab",
      add_medicine: "pharmacy", sell_medicine: "pharmacy", admit_patient: "admissions", discharge_patient: "admissions",
      record_payment: "accounts", create_expense: "accounts", save_consultation: "prescriptions", publish_article: "cms", update_package: "cms", update_inquiry: "inquiries",
    };
    const permission = required[action];
    if (!permission || !can(session.role, permission)) return NextResponse.json({ error: "Your staff role is not authorized to perform this action." }, { status: 403 });

    if (action === "register_patient") {
      const name = textValue(body.name, 160);
      const phone = localPhone(textValue(body.phone, 32));
      if (name.length < 2 || !/^(?:\+?92|0)?3\d{9}$/.test(phone)) return NextResponse.json({ error: "Enter a patient name and valid Pakistani mobile number." }, { status: 400 });
      const [created] = await db.insert(patients).values({ patientRef: ref("RMH-P"), name, phone, gender: textValue(body.gender, 32) || null, address: textValue(body.address, 500) || null, emergencyContact: textValue(body.emergencyContact, 32) || null, allergies: textValue(body.allergies, 500) || null, medicalHistory: textValue(body.medicalHistory, 1200) || null, isDemo: true }).returning();
      await audit(session.role, "Patient registered", "patient", created.id);
      return NextResponse.json({ ok: true, patient: created }, { status: 201 });
    }

    if (action === "update_appointment") {
      const id = amountValue(body.id);
      const status = textValue(body.status, 32);
      if (id < 1 || !["Waiting", "With Doctor", "Completed", "Cancelled"].includes(status)) return NextResponse.json({ error: "Choose a valid appointment and queue status." }, { status: 400 });
      const [updated] = await db.update(appointments).set({ status, updatedAt: new Date() }).where(eq(appointments.id, id)).returning();
      if (!updated) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
      await audit(session.role, `Appointment ${status.toLowerCase()}`, "appointment", updated.id, { token: updated.token });
      return NextResponse.json({ ok: true, appointment: updated });
    }

    if (action === "add_doctor") {
      if (session.role !== "super-admin") return NextResponse.json({ error: "Only the Super Admin can add doctors." }, { status: 403 });
      const name = textValue(body.name, 160);
      const specialty = textValue(body.specialty, 120);
      const qualifications = textValue(body.qualifications, 240);
      const fee = amountValue(body.consultationFee);
      if (!name || !specialty || !qualifications || fee < 0) return NextResponse.json({ error: "Name, specialty, qualifications and a valid consultation fee are required." }, { status: 400 });
      const departmentName = textValue(body.department, 100) || specialty;
      const [newDept] = await db.insert(departments).values({ name: departmentName }).onConflictDoNothing().returning();
      const department = newDept ?? (await db.select().from(departments).where(eq(departments.name, departmentName)).limit(1))[0];
      const [created] = await db.insert(doctors).values({ name, specialty, qualifications, departmentId: department?.id ?? null, pmdcRegistration: textValue(body.pmdcRegistration, 100) || "Not supplied — verification required", experienceYears: Math.max(0, Number(body.experienceYears) || 0), consultationFee: fee, opdDays: textValue(body.opdDays, 160) || "Confirm with reception", opdTimings: textValue(body.opdTimings, 120) || "Confirm with reception", isDemo: true }).returning();
      await audit(session.role, "Doctor added to directory", "doctor", created.id, { specialty });
      return NextResponse.json({ ok: true, doctor: created }, { status: 201 });
    }

    if (action === "create_lab_order") {
      const patientId = amountValue(body.patientId);
      const testId = amountValue(body.testId);
      if (patientId < 1 || testId < 1) return NextResponse.json({ error: "Choose a patient and laboratory test." }, { status: 400 });
      const [patient] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
      const [test] = await db.select().from(labTests).where(and(eq(labTests.id, testId), eq(labTests.isActive, true))).limit(1);
      if (!patient || !test) return NextResponse.json({ error: "Patient or laboratory test was not found." }, { status: 404 });
      const report = await db.transaction(async (tx) => {
        const sampleRef = ref("LAB-S");
        const reportRef = ref("LAB");
        const [sample] = await tx.insert(labSamples).values({ sampleReference: sampleRef, patientId, testId, sampleDate: dayString(), status: "Collected" }).returning();
        const [created] = await tx.insert(labReports).values({ reportReference: reportRef, sampleId: sample.id, patientId, testId, status: "Pending", authorized: false, isDemo: true, sampleDate: dayString() }).returning();
        return created;
      });
      await audit(session.role, "Laboratory sample registered", "lab_report", report.id, { reportReference: report.reportReference });
      return NextResponse.json({ ok: true, report }, { status: 201 });
    }

    if (action === "publish_lab_report") {
      const id = amountValue(body.id);
      const results = Array.isArray(body.results) ? body.results.slice(0, 30) as Array<Record<string, unknown>> : [];
      if (id < 1 || results.length === 0) return NextResponse.json({ error: "Enter at least one result value before publishing." }, { status: 400 });
      const cleaned = results.map((item) => ({ name: textValue(item.name, 100), value: textValue(item.value, 80), unit: textValue(item.unit, 40), range: textValue(item.range, 80), flag: ["High", "Low", "Normal", "Review"].includes(textValue(item.flag, 16)) ? textValue(item.flag, 16) : "Review" }));
      if (cleaned.some((item) => !item.name || !item.value)) return NextResponse.json({ error: "Every result needs a parameter name and value." }, { status: 400 });
      const updated = await db.transaction(async (tx) => {
        const [row] = await tx.select().from(labReports).where(eq(labReports.id, id)).for("update").limit(1);
        if (!row) return null;
        const [report] = await tx.update(labReports).set({ resultValues: cleaned, status: "Published", authorized: true, verifiedAt: new Date(), publishedAt: new Date() }).where(eq(labReports.id, id)).returning();
        await tx.update(labSamples).set({ status: "Completed" }).where(eq(labSamples.id, row.sampleId));
        return report;
      });
      if (!updated) return NextResponse.json({ error: "Laboratory report not found." }, { status: 404 });
      await audit(session.role, "Lab result verified and published", "lab_report", updated.id, { reportReference: updated.reportReference });
      return NextResponse.json({ ok: true, report: updated });
    }

    if (action === "add_medicine") {
      const name = textValue(body.name, 160);
      const stock = amountValue(body.stock);
      const salePrice = amountValue(body.salePrice);
      if (!name || stock < 0 || salePrice < 0) return NextResponse.json({ error: "Medicine name, non-negative stock and a valid sale price are required." }, { status: 400 });
      const [created] = await db.insert(medicines).values({ name, genericName: textValue(body.genericName, 160) || null, brandName: textValue(body.brandName, 160) || null, category: textValue(body.category, 100) || "General", batchNumber: textValue(body.batchNumber, 64) || ref("BATCH"), salePrice, purchasePrice: Math.max(0, amountValue(body.purchasePrice)), stock, lowStockAt: Math.max(1, Number(body.lowStockAt) || 10), expiryDate: /^\d{4}-\d{2}-\d{2}$/.test(textValue(body.expiryDate, 10)) ? textValue(body.expiryDate, 10) : null }).returning();
      await audit(session.role, "Medicine inventory item added", "medicine", created.id, { name });
      return NextResponse.json({ ok: true, medicine: created }, { status: 201 });
    }

    if (action === "sell_medicine") {
      const medicineId = amountValue(body.medicineId);
      const quantity = amountValue(body.quantity);
      const discount = Math.max(0, amountValue(body.discount));
      if (medicineId < 1 || quantity < 1 || quantity > 999 || discount < 0) return NextResponse.json({ error: "Choose a medicine and a positive quantity." }, { status: 400 });
      const sale = await db.transaction(async (tx) => {
        const [medicine] = await tx.select().from(medicines).where(eq(medicines.id, medicineId)).for("update").limit(1);
        if (!medicine || medicine.stock < quantity) throw new Error("INSUFFICIENT_STOCK");
        const subtotal = medicine.salePrice * quantity;
        const total = Math.max(0, subtotal - discount);
        await tx.update(medicines).set({ stock: medicine.stock - quantity, updatedAt: new Date() }).where(eq(medicines.id, medicine.id));
        const [createdSale] = await tx.insert(pharmacySales).values({ receiptNumber: ref("RX"), subtotal, discount, total, paymentMethod: textValue(body.paymentMethod, 32) || "Cash" }).returning();
        await tx.insert(pharmacySaleItems).values({ saleId: createdSale.id, medicineId: medicine.id, quantity, unitPrice: medicine.salePrice, lineTotal: subtotal });
        const [invoice] = await tx.insert(invoices).values({ invoiceNumber: ref("INV"), source: "Pharmacy", total, paid: total, status: "Paid" }).returning();
        await tx.insert(invoiceItems).values({ invoiceId: invoice.id, description: `${medicine.name} × ${quantity}`, quantity, unitPrice: medicine.salePrice, lineTotal: total });
        if (total > 0) await tx.insert(payments).values({ invoiceId: invoice.id, amount: total, method: textValue(body.paymentMethod, 32) || "Cash", paymentReference: createdSale.receiptNumber });
        return { sale: createdSale, invoice, medicine: { id: medicine.id, name: medicine.name, stock: medicine.stock - quantity }, total };
      });
      await audit(session.role, "Pharmacy sale completed", "pharmacy_sale", sale.sale.id, { total: sale.total, medicineId });
      return NextResponse.json({ ok: true, ...sale }, { status: 201 });
    }

    if (action === "admit_patient") {
      const patientId = amountValue(body.patientId);
      const bedId = amountValue(body.bedId);
      if (patientId < 1 || bedId < 1) return NextResponse.json({ error: "Choose a patient and an available bed." }, { status: 400 });
      const admission = await db.transaction(async (tx) => {
        const [patient] = await tx.select().from(patients).where(eq(patients.id, patientId)).limit(1);
        const [bed] = await tx.select().from(beds).where(eq(beds.id, bedId)).for("update").limit(1);
        if (!patient) throw new Error("PATIENT_NOT_FOUND");
        if (!bed || bed.status !== "Available") throw new Error("BED_UNAVAILABLE");
        const [ward] = await tx.select().from(wards).where(eq(wards.id, bed.wardId)).limit(1);
        await tx.update(beds).set({ status: "Occupied" }).where(eq(beds.id, bed.id));
        const [created] = await tx.insert(admissions).values({ admissionReference: ref("IPD"), patientId, bedId, dailyRoomRate: ward?.dailyRate ?? 0, status: "Admitted" }).returning();
        return created;
      });
      await audit(session.role, "Patient admitted and bed assigned", "admission", admission.id, { admissionReference: admission.admissionReference });
      return NextResponse.json({ ok: true, admission }, { status: 201 });
    }

    if (action === "discharge_patient") {
      const id = amountValue(body.id);
      const result = await db.transaction(async (tx) => {
        const [admission] = await tx.select().from(admissions).where(eq(admissions.id, id)).for("update").limit(1);
        if (!admission || admission.status !== "Admitted") return null;
        const [updated] = await tx.update(admissions).set({ status: "Discharged", dischargedAt: new Date() }).where(eq(admissions.id, id)).returning();
        await tx.update(beds).set({ status: "Available" }).where(eq(beds.id, admission.bedId));
        return updated;
      });
      if (!result) return NextResponse.json({ error: "Active admission not found." }, { status: 404 });
      await audit(session.role, "Patient discharged and bed released", "admission", result.id);
      return NextResponse.json({ ok: true, admission: result });
    }

    if (action === "record_payment") {
      const invoiceId = amountValue(body.invoiceId);
      const amount = amountValue(body.amount);
      const result = await db.transaction(async (tx) => {
        const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, invoiceId)).for("update").limit(1);
        if (!invoice || amount < 1 || amount > invoice.total - invoice.paid) return null;
        const [payment] = await tx.insert(payments).values({ invoiceId, amount, method: textValue(body.method, 32) || "Cash", paymentReference: textValue(body.reference, 64) || null }).returning();
        const paid = invoice.paid + amount;
        await tx.update(invoices).set({ paid, status: paid >= invoice.total ? "Paid" : "Partially paid", updatedAt: new Date() }).where(eq(invoices.id, invoiceId));
        return { payment, paid, outstanding: invoice.total - paid };
      });
      if (!result) return NextResponse.json({ error: "Payment must be positive and cannot exceed the outstanding balance." }, { status: 400 });
      await audit(session.role, "Patient payment recorded", "invoice", invoiceId, { amount });
      return NextResponse.json({ ok: true, ...result }, { status: 201 });
    }

    if (action === "create_expense") {
      const description = textValue(body.description, 220);
      const category = textValue(body.category, 100);
      const amount = amountValue(body.amount);
      if (description.length < 3 || !category || amount < 1) return NextResponse.json({ error: "Description, expense category and a positive amount are required." }, { status: 400 });
      const [created] = await db.insert(expenses).values({ description, category, amount, vendor: textValue(body.vendor, 160) || null, reference: textValue(body.reference, 64) || null }).returning();
      await audit(session.role, "Expense recorded", "expense", created.id, { amount, category });
      return NextResponse.json({ ok: true, expense: created }, { status: 201 });
    }

    if (action === "save_consultation") {
      const patientId = amountValue(body.patientId);
      const appointmentId = amountValue(body.appointmentId);
      const patient = (await db.select().from(patients).where(eq(patients.id, patientId)).limit(1))[0];
      if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
      const visit = await db.transaction(async (tx) => {
        const [createdVisit] = await tx.insert(opdVisits).values({ visitRef: ref("VIS"), patientId, appointmentId: appointmentId > 0 ? appointmentId : null, chiefComplaint: textValue(body.chiefComplaint, 1000) || null, clinicalNotes: textValue(body.clinicalNotes, 2500) || null, followUpDate: /^\d{4}-\d{2}-\d{2}$/.test(textValue(body.followUpDate, 10)) ? textValue(body.followUpDate, 10) : null }).returning();
        if (body.diagnosis && textValue(body.diagnosis, 500)) await tx.insert(diagnoses).values({ visitId: createdVisit.id, description: textValue(body.diagnosis, 500) });
        const vitals = (body.vitals && typeof body.vitals === "object" ? body.vitals : {}) as Record<string, unknown>;
        if (Object.values(vitals).some((value) => textValue(value, 32))) await tx.insert(patientVitals).values({ patientId, visitId: createdVisit.id, bloodPressure: textValue(vitals.bloodPressure, 20) || null, temperatureC: textValue(vitals.temperature, 12) || null, pulse: amountValue(vitals.pulse) >= 0 ? amountValue(vitals.pulse) : null, bloodSugar: textValue(vitals.bloodSugar, 20) || null, weightKg: textValue(vitals.weight, 12) || null, heightCm: textValue(vitals.height, 12) || null, oxygenSaturation: amountValue(vitals.oxygen) >= 0 ? amountValue(vitals.oxygen) : null });
        const items = Array.isArray(body.prescription) ? body.prescription.slice(0, 20) as Array<Record<string, unknown>> : [];
        if (items.length) {
          const [prescription] = await tx.insert(prescriptions).values({ prescriptionRef: ref("RX"), visitId: createdVisit.id, patientId, notes: textValue(body.prescriptionNotes, 600) || null }).returning();
          await tx.insert(prescriptionItems).values(items.map((item) => ({ prescriptionId: prescription.id, medicineName: textValue(item.medicineName, 160) || "Medicine", strength: textValue(item.strength, 80) || null, dosage: textValue(item.dosage, 100) || null, frequency: textValue(item.frequency, 100) || null, duration: textValue(item.duration, 100) || null, quantity: Math.max(1, Number(item.quantity) || 1), instructions: textValue(item.instructions, 300) || null })));
        }
        return createdVisit;
      });
      if (appointmentId > 0) await db.update(appointments).set({ status: "Completed", updatedAt: new Date() }).where(eq(appointments.id, appointmentId));
      await audit(session.role, "Clinical visit saved", "opd_visit", visit.id, { patientId });
      return NextResponse.json({ ok: true, visit }, { status: 201 });
    }

    if (action === "update_package") {
      if (session.role !== "super-admin") return NextResponse.json({ error: "Only the Super Admin can edit public package pricing." }, { status: 403 });
      const id = amountValue(body.id);
      const name = textValue(body.name, 180);
      const description = textValue(body.description, 1500);
      const price = amountValue(body.price);
      const includedTests = Array.isArray(body.includedTests) ? body.includedTests.map((item) => textValue(item, 120)).filter(Boolean).slice(0, 20) : [];
      const includedConsultations = Array.isArray(body.includedConsultations) ? body.includedConsultations.map((item) => textValue(item, 160)).filter(Boolean).slice(0, 10) : [];
      if (id < 1 || name.length < 3 || description.length < 8 || price < 0 || price > 10_000_000) return NextResponse.json({ error: "Provide a valid package, description and PKR price." }, { status: 400 });
      const [updated] = await db.update(healthcarePackages).set({ name, description, price, includedTests, includedConsultations, updatedAt: new Date() }).where(eq(healthcarePackages.id, id)).returning();
      if (!updated) return NextResponse.json({ error: "Healthcare package not found." }, { status: 404 });
      await audit(session.role, "Healthcare package updated", "package", id, { price });
      return NextResponse.json({ ok: true, package: updated });
    }

    if (action === "publish_article") {
      if (session.role !== "super-admin") return NextResponse.json({ error: "Only the Super Admin can publish website content." }, { status: 403 });
      const title = textValue(body.title, 220);
      const slug = textValue(body.slug, 180).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
      const excerpt = textValue(body.excerpt, 800);
      const articleBody = textValue(body.body, 6000);
      if (title.length < 4 || slug.length < 3 || excerpt.length < 8 || articleBody.length < 30) return NextResponse.json({ error: "Provide an article title, URL slug, summary and full article." }, { status: 400 });
      const [created] = await db.insert(blogPosts).values({ title, slug, excerpt, body: articleBody, author: textValue(body.author, 160) || "Rana Medical Hospital editorial team", isPublished: body.publish === true, publishedAt: body.publish === true ? new Date() : null, isDemo: true }).returning();
      await audit(session.role, "Website article saved", "blog_post", created.id, { published: created.isPublished });
      return NextResponse.json({ ok: true, article: created }, { status: 201 });
    }

    if (action === "update_inquiry") {
      const id = amountValue(body.id);
      const status = textValue(body.status, 24);
      if (id < 1 || !["New", "In progress", "Responded", "Closed"].includes(status)) return NextResponse.json({ error: "Choose a valid inquiry and status." }, { status: 400 });
      const [updated] = await db.update(inquiries).set({ status }).where(eq(inquiries.id, id)).returning();
      if (!updated) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
      await audit(session.role, `Inquiry marked ${status.toLowerCase()}`, "inquiry", id);
      return NextResponse.json({ ok: true, inquiry: updated });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") return NextResponse.json({ error: "Not enough stock is available for this sale." }, { status: 409 });
    if (error instanceof Error && error.message === "BED_UNAVAILABLE") return NextResponse.json({ error: "That bed was just assigned. Refresh and choose another available bed." }, { status: 409 });
    if (error instanceof Error && error.message === "PATIENT_NOT_FOUND") return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    if (error instanceof Error && error.message.includes("duplicate key")) return NextResponse.json({ error: "That record already exists. Please use a unique reference." }, { status: 409 });
    return NextResponse.json({ error: "The change could not be completed. Please refresh and try again." }, { status: 500 });
  }
}
