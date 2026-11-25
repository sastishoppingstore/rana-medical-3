import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db, pool } from "@/db";
import {
  admissions,
  appointments,
  beds,
  blogPosts,
  departments,
  doctors,
  expenses,
  faqs,
  healthcarePackages,
  invoices,
  labReports,
  labSamples,
  labTests,
  medicines,
  patients,
  payments,
  pharmacySales,
  wards,
  testimonials,
  users,
  websiteServices,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";

const today = new Date().toISOString().slice(0, 10);
const samplePatientRef = "DEMO-P-0001";
const departmentsSeed = [
  ["General Medicine", "Primary and internal medicine"],
  ["General Surgery", "General and minimally invasive surgery"],
  ["Gynecology & Maternity", "Women's health and maternity care"],
  ["Pediatrics", "Child health services"],
  ["Cardiology", "Heart health and diagnostics"],
  ["Orthopedics", "Bone, joint and movement care"],
  ["Emergency", "Emergency and trauma services"],
  ["Laboratory", "Pathology and diagnostic testing"],
] as const;

async function main() {
  for (const [name, description] of departmentsSeed) {
    await db.insert(departments).values({ name, description }).onConflictDoNothing();
  }
  const departmentRows = await db.select().from(departments);
  const departmentByName = new Map(departmentRows.map((row) => [row.name, row.id]));

  const doctorSeed = [
    { name: "Sample Dr. Ayesha Rahman", specialty: "Medicine", department: "General Medicine", qualifications: "Sample profile · qualifications to be verified", fee: 1800, days: "Mon · Wed · Fri", time: "09:00 AM – 01:00 PM", experience: 12 },
    { name: "Sample Dr. Hamza Malik", specialty: "General Surgery", department: "General Surgery", qualifications: "Sample profile · qualifications to be verified", fee: 2200, days: "Tue · Thu · Sat", time: "04:00 PM – 08:00 PM", experience: 15 },
    { name: "Sample Dr. Zainab Shah", specialty: "Gynecology", department: "Gynecology & Maternity", qualifications: "Sample profile · qualifications to be verified", fee: 2000, days: "Mon · Tue · Thu", time: "10:00 AM – 02:00 PM", experience: 10 },
    { name: "Sample Dr. Bilal Ahmed", specialty: "Child Specialist", department: "Pediatrics", qualifications: "Sample profile · qualifications to be verified", fee: 1600, days: "Mon · Wed · Sat", time: "05:00 PM – 09:00 PM", experience: 9 },
    { name: "Sample Dr. Sara Qureshi", specialty: "Cardiology", department: "Cardiology", qualifications: "Sample profile · qualifications to be verified", fee: 2500, days: "Tue · Thu · Sat", time: "11:00 AM – 03:00 PM", experience: 14 },
    { name: "Sample Dr. Omar Farooq", specialty: "Orthopedics", department: "Orthopedics", qualifications: "Sample profile · qualifications to be verified", fee: 2000, days: "Mon · Wed · Fri", time: "03:00 PM – 07:00 PM", experience: 11 },
  ];
  for (const item of doctorSeed) {
    await db.insert(doctors).values({ name: item.name, specialty: item.specialty, departmentId: departmentByName.get(item.department), qualifications: item.qualifications, pmdcRegistration: "Not supplied · verification required", experienceYears: item.experience, consultationFee: item.fee, opdDays: item.days, opdTimings: item.time, availableSlots: 6, isDemo: true }).onConflictDoNothing();
  }

  const testsSeed = [
    { name: "Complete Blood Count", category: "Hematology", price: 1200, turnaround: "Same day", parameters: [{ name: "Hemoglobin", unit: "g/dL", range: "12.0–16.0" }, { name: "WBC", unit: "10⁹/L", range: "4.0–11.0" }, { name: "Platelets", unit: "10⁹/L", range: "150–400" }] },
    { name: "Fasting Blood Glucose", category: "Biochemistry", price: 550, turnaround: "Same day", parameters: [{ name: "Fasting glucose", unit: "mg/dL", range: "70–99" }] },
    { name: "HbA1c", category: "Biochemistry", price: 1800, turnaround: "Same day", parameters: [{ name: "HbA1c", unit: "%", range: "<5.7" }] },
    { name: "Lipid Profile", category: "Biochemistry", price: 2100, turnaround: "Same day", parameters: [{ name: "Total cholesterol", unit: "mg/dL", range: "<200" }, { name: "LDL", unit: "mg/dL", range: "<100" }] },
    { name: "Liver Function Tests", category: "Biochemistry", price: 1900, turnaround: "Same day", parameters: [{ name: "ALT", unit: "U/L", range: "7–56" }, { name: "AST", unit: "U/L", range: "10–40" }] },
    { name: "Renal Function Tests", category: "Biochemistry", price: 1800, turnaround: "Same day", parameters: [{ name: "Creatinine", unit: "mg/dL", range: "0.6–1.3" }] },
    { name: "Urine Complete Examination", category: "Pathology", price: 450, turnaround: "Same day", parameters: [{ name: "Appearance", unit: "—", range: "Clear" }] },
    { name: "Thyroid Profile", category: "Endocrinology", price: 2600, turnaround: "24 hours", parameters: [{ name: "TSH", unit: "mIU/L", range: "0.4–4.0" }] },
  ];
  for (const test of testsSeed) await db.insert(labTests).values(test).onConflictDoNothing();

  const samplePatient = await db.select().from(patients).where(eq(patients.patientRef, samplePatientRef)).limit(1);
  let patient = samplePatient[0];
  if (!patient) {
    [patient] = await db.insert(patients).values({ patientRef: samplePatientRef, name: "Sample patient · fictional", phone: "03246627054", gender: "Not specified", isDemo: true }).returning();
  }
  const doctorRows = await db.select().from(doctors).where(eq(doctors.isActive, true));
  const medicineSeed = [
    { name: "Paracetamol 500mg", genericName: "Paracetamol", brandName: "Sample brand", category: "Analgesic", batchNumber: "DEMO-PAR-01", purchasePrice: 5, salePrice: 8, stock: 240, lowStockAt: 30, expiryDate: "2027-05-31" },
    { name: "Amoxicillin 500mg", genericName: "Amoxicillin", brandName: "Sample brand", category: "Antibiotic", batchNumber: "DEMO-AMX-02", purchasePrice: 22, salePrice: 32, stock: 65, lowStockAt: 20, expiryDate: "2027-02-28" },
    { name: "ORS Sachet", genericName: "Oral rehydration salts", brandName: "Sample brand", category: "Rehydration", batchNumber: "DEMO-ORS-03", purchasePrice: 18, salePrice: 25, stock: 8, lowStockAt: 15, expiryDate: "2026-12-31" },
    { name: "Cetirizine 10mg", genericName: "Cetirizine", brandName: "Sample brand", category: "Allergy", batchNumber: "DEMO-CET-04", purchasePrice: 7, salePrice: 12, stock: 112, lowStockAt: 20, expiryDate: "2027-08-31" },
  ];
  for (const item of medicineSeed) {
    const found = await db.select({ id: medicines.id }).from(medicines).where(eq(medicines.batchNumber, item.batchNumber)).limit(1);
    if (!found.length) await db.insert(medicines).values(item);
  }

  const wardSeed = [
    { name: "General Ward", type: "General", dailyRate: 3500, beds: ["G-01", "G-02", "G-03", "G-04"] },
    { name: "Semi-Private", type: "Semi-private", dailyRate: 6500, beds: ["SP-01", "SP-02"] },
    { name: "Private Rooms", type: "Private", dailyRate: 11000, beds: ["P-01", "P-02"] },
    { name: "Intensive Care", type: "ICU", dailyRate: 18000, beds: ["ICU-01", "ICU-02"] },
  ];
  for (const item of wardSeed) {
    await db.insert(wards).values({ name: item.name, type: item.type, dailyRate: item.dailyRate }).onConflictDoNothing();
    const ward = (await db.select().from(wards).where(eq(wards.name, item.name)).limit(1))[0];
    for (const bedNumber of item.beds) await db.insert(beds).values({ wardId: ward.id, bedNumber, status: "Available" }).onConflictDoNothing();
  }

  const serviceCount = (await db.select({ id: websiteServices.id }).from(websiteServices).limit(1)).length;
  if (!serviceCount) {
    const serviceSeed = [
      ["OPD Clinics", "Thoughtful outpatient consultations across core specialties.", "Clinics", "stethoscope"],
      ["24/7 Emergency", "Urgent assessment and emergency support. Please confirm operational coverage.", "Emergency", "siren"],
      ["General Surgery", "Surgical consultations and coordinated peri-operative care.", "Surgery", "scissors"],
      ["Laparoscopic Surgery", "Minimally invasive surgical assessment and care.", "Surgery", "activity"],
      ["Gynecology & Maternity", "Personalized women's health and maternity consultations.", "Women's health", "baby"],
      ["Pediatrics", "Family-centred clinical care for infants and children.", "Child health", "baby"],
      ["Cardiology", "Heart health reviews and diagnostic pathways.", "Specialty", "heart"],
      ["Orthopedics", "Bone, joint and mobility assessment.", "Specialty", "bone"],
      ["Dental Care", "Preventive and restorative oral health consultations.", "Specialty", "smile"],
      ["Physiotherapy", "Individualized movement and rehabilitation support.", "Rehabilitation", "move"],
    ];
    await db.insert(websiteServices).values(serviceSeed.map(([title, description, category, icon], sortOrder) => ({ title, description, category, icon, sortOrder })));
  }

  const packageCount = (await db.select({ id: healthcarePackages.id }).from(healthcarePackages).limit(1)).length;
  if (!packageCount) {
    await db.insert(healthcarePackages).values([
      { name: "Executive Full Body Checkup", description: "A coordinated, broad baseline screening. Sample price; confirm inclusions before purchase.", price: 14500, includedTests: ["CBC", "LFT", "RFT", "Lipid profile", "ECG"], includedConsultations: ["Physician review"] },
      { name: "Diabetes Care Package", description: "A focused metabolic check-in with clinician follow-up.", price: 6200, includedTests: ["Fasting glucose", "HbA1c", "Urine examination"], includedConsultations: ["Medicine consultation"] },
      { name: "Mother & Child Package", description: "A sample antenatal wellness pathway. Clinical plan varies by patient.", price: 9800, includedTests: ["CBC", "Blood group", "Urine examination", "Ultrasound review"], includedConsultations: ["Gynecology consultation"] },
      { name: "Cardiac Screening", description: "A sample heart-health screening with risk review.", price: 7800, includedTests: ["ECG", "Lipid profile", "Blood pressure"], includedConsultations: ["Cardiology consultation"] },
      { name: "Basic Health Screening", description: "Essential baseline checks at an illustrative rate.", price: 3900, includedTests: ["CBC", "Fasting glucose", "Urine examination"], includedConsultations: ["Physician review"] },
      { name: "Pre-Surgery Assessment", description: "A sample pre-operative assessment, tailored by the treating team.", price: 8500, includedTests: ["CBC", "RFT", "ECG", "Coagulation screen"], includedConsultations: ["Anaesthesia review"] },
    ]);
  }

  const faqCount = (await db.select({ id: faqs.id }).from(faqs).limit(1)).length;
  if (!faqCount) {
    await db.insert(faqs).values([
      ["What are the OPD timings?", "Doctor schedules vary by specialty. Please check the current directory or call reception at 0324-6627054 before travelling."],
      ["How do I book an appointment?", "Use the online booking form or call 0324-6627054. An online request is confirmed by the hospital team."],
      ["How does the digital token work?", "A token is generated when a booking is recorded. Please wait for staff confirmation before relying on a queue time."],
      ["Can I get laboratory home sampling?", "Home sampling availability has not been confirmed. Please contact the laboratory to ask about current arrangements."],
      ["How can I access my lab report?", "Use the secure verification form with your report reference and registered mobile number. Only authorized published reports are returned."],
      ["How do I get emergency admission?", "For urgent concerns call 0324-6627054 or go to the nearest emergency department. Confirm local emergency availability directly."],
      ["What payment methods are accepted?", "Payment methods can change; contact reception for current accepted options."],
      ["How can I contact the hospital?", "Call 0324-6627054 or use the contact form. WhatsApp opens a message to the hospital number."],
    ].map(([question, answer], sortOrder) => ({ question, answer, sortOrder, isPublished: true })));
  }

  const articleSeed = [
    { slug: "diabetes-prevention-healthy-lifestyle", title: "Diabetes prevention starts with small, steady habits", excerpt: "Practical, evidence-informed ways to support blood sugar health over time.", body: "Healthy routines can support wellbeing, but personal advice depends on your history and current health. A balanced eating pattern, regular movement, adequate sleep and check-ups can all play a role. People at increased risk should discuss screening with a qualified clinician. Never stop or change prescribed treatment based on an online article.", imageUrl: "https://images.pexels.com/photos/8413162/pexels-photo-8413162.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
    { slug: "regular-heart-checkups", title: "Why regular heart-health conversations matter", excerpt: "A check-up can help you understand your risk factors and next steps.", body: "Blood pressure, cholesterol, family history, activity, smoking and diabetes are among the factors clinicians may review. Screening is individualized: ask a qualified healthcare professional which checks are appropriate for you. Seek urgent care for severe chest pain or sudden breathing difficulty.", imageUrl: "https://images.pexels.com/photos/6627926/pexels-photo-6627926.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
    { slug: "pregnancy-care-maternal-health", title: "A calmer guide to pregnancy care and maternal health", excerpt: "What to discuss at antenatal visits and how to prepare your questions.", body: "Antenatal schedules and tests should follow guidance from your own clinician. Bring your medicines list, note new symptoms and ask when to seek urgent assessment. Individual care varies; information here is educational and is not a substitute for medical advice.", imageUrl: "https://images.pexels.com/photos/8460124/pexels-photo-8460124.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  ];
  for (const article of articleSeed) await db.insert(blogPosts).values({ ...article, author: "Rana Medical Hospital editorial team · sample content", isPublished: true, isDemo: true, publishedAt: new Date() }).onConflictDoNothing();

  const reviewCount = (await db.select({ id: testimonials.id }).from(testimonials).limit(1)).length;
  if (!reviewCount) {
    await db.insert(testimonials).values([
      { displayName: "Illustrative patient", department: "Outpatient care", rating: 5, feedback: "Sample review only. Replace with feedback shared with consent before publication.", reviewDate: today, isIllustrative: true, isPublished: true },
      { displayName: "Illustrative family member", department: "Pediatrics", rating: 5, feedback: "Demonstration content — not an authentic patient testimonial.", reviewDate: today, isIllustrative: true, isPublished: true },
      { displayName: "Illustrative visitor", department: "Diagnostics", rating: 4, feedback: "Demo content; no Google or third-party verification is claimed.", reviewDate: today, isIllustrative: true, isPublished: true },
    ]);
  }

  const todayAppointments = await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.appointmentDate, today)).limit(1);
  if (!todayAppointments.length && doctorRows.length) {
    await db.insert(appointments).values([
      { reference: "DEMO-APT-0001", token: "DEMO-OPD-001", patientId: patient.id, doctorId: doctorRows[0].id, departmentId: doctorRows[0].departmentId, appointmentDate: today, timeSlot: "09:30 AM", status: "Waiting", source: "demo" },
      { reference: "DEMO-APT-0002", token: "DEMO-OPD-002", patientId: patient.id, doctorId: doctorRows[1]?.id ?? doctorRows[0].id, departmentId: doctorRows[1]?.departmentId ?? doctorRows[0].departmentId, appointmentDate: today, timeSlot: "10:15 AM", status: "Waiting", source: "demo" },
    ]).onConflictDoNothing();
  }

  const reportExists = await db.select({ id: labReports.id }).from(labReports).where(eq(labReports.reportReference, "RMH-DEMO-2401")).limit(1);
  if (!reportExists.length) {
    const test = (await db.select().from(labTests).where(eq(labTests.name, "Fasting Blood Glucose")).limit(1))[0];
    const [sample] = await db.insert(labSamples).values({ sampleReference: "SAMPLE-DEMO-2401", patientId: patient.id, testId: test.id, status: "Completed", sampleDate: today }).returning();
    await db.insert(labReports).values({ reportReference: "RMH-DEMO-2401", sampleId: sample.id, patientId: patient.id, testId: test.id, status: "Published", authorized: true, isDemo: true, sampleDate: today, verifiedAt: new Date(), publishedAt: new Date(), resultValues: [{ name: "Fasting glucose", value: "92", unit: "mg/dL", range: "70–99", flag: "Normal" }] });
  }

  const existingInvoice = await db.select({ id: invoices.id }).from(invoices).where(eq(invoices.invoiceNumber, "DEMO-INV-0001")).limit(1);
  if (!existingInvoice.length) {
    const [invoice] = await db.insert(invoices).values({ invoiceNumber: "DEMO-INV-0001", patientId: patient.id, source: "OPD", total: 1800, paid: 1200, status: "Partially paid" }).returning();
    await db.insert(payments).values({ invoiceId: invoice.id, amount: 1200, method: "Cash", paymentReference: "DEMO-PAY-0001" });
    await db.insert(expenses).values({ description: "Sample medical supplies", category: "Medical supplies", amount: 450, vendor: "Demonstration supplier", reference: "DEMO-EXP-0001" });
  }

  const admissionExists = await db.select({ id: admissions.id }).from(admissions).where(eq(admissions.admissionReference, "DEMO-IPD-0001")).limit(1);
  if (!admissionExists.length) {
    const ward = (await db.select().from(wards).where(eq(wards.name, "General Ward")).limit(1))[0];
    const bed = (await db.select().from(beds).where(and(eq(beds.wardId, ward.id), eq(beds.bedNumber, "G-01"))).limit(1))[0];
    await db.update(beds).set({ status: "Occupied" }).where(eq(beds.id, bed.id));
    await db.insert(admissions).values({ admissionReference: "DEMO-IPD-0001", patientId: patient.id, bedId: bed.id, dailyRoomRate: ward.dailyRate, status: "Admitted", notes: "Synthetic sample admission" });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword && adminPassword.length >= 12) {
    await db.insert(users).values({ fullName: "Hospital Administrator", email: adminEmail, passwordHash: hashPassword(adminPassword), role: "super-admin", isActive: true }).onConflictDoNothing();
  }

  const saleExists = await db.select({ id: pharmacySales.id }).from(pharmacySales).where(eq(pharmacySales.receiptNumber, "DEMO-RX-0001")).limit(1);
  if (!saleExists.length) await db.insert(pharmacySales).values({ receiptNumber: "DEMO-RX-0001", subtotal: 240, total: 240, discount: 0, paymentMethod: "Cash" });

  console.info("Rana Medical Hospital demo seed completed.");
  console.info(`Departments: ${departmentRows.length} · demo patient: ${patient.patientRef} · demo lab report: RMH-DEMO-2401`);
  console.info("All sample people, figures, appointments, and reports are fictional demonstration records.");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
}).finally(async () => {
  await pool.end();
});
