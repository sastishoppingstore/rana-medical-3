import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: createdAt(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 190 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 40 }).notNull().default("receptionist"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeCode: varchar("employee_code", { length: 40 }).notNull().unique(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  designation: varchar("designation", { length: 100 }).notNull(),
  departmentId: integer("department_id").references(() => departments.id, { onDelete: "set null" }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 190 }),
  salary: integer("salary").notNull().default(0),
  status: varchar("status", { length: 24 }).notNull().default("active"),
  isDemo: boolean("is_demo").notNull().default(true),
  createdAt: createdAt(),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  specialty: varchar("specialty", { length: 120 }).notNull(),
  departmentId: integer("department_id").references(() => departments.id, { onDelete: "set null" }),
  qualifications: varchar("qualifications", { length: 240 }).notNull().default("Qualifications to be verified"),
  pmdcRegistration: varchar("pmdc_registration", { length: 100 }).notNull().default("Not supplied"),
  experienceYears: integer("experience_years").notNull().default(0),
  consultationFee: integer("consultation_fee").notNull().default(0),
  opdDays: varchar("opd_days", { length: 160 }).notNull().default("Please confirm with reception"),
  opdTimings: varchar("opd_timings", { length: 120 }).notNull().default("Please confirm with reception"),
  availableSlots: integer("available_slots").notNull().default(6),
  photoUrl: text("photo_url"),
  isDemo: boolean("is_demo").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("doctors_specialty_idx").on(table.specialty)]);

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientRef: varchar("patient_ref", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  gender: varchar("gender", { length: 32 }),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 32 }),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  isDemo: boolean("is_demo").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("patients_phone_idx").on(table.phone), index("patients_ref_idx").on(table.patientRef)]);

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  token: varchar("token", { length: 32 }).notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "restrict" }),
  doctorId: integer("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  departmentId: integer("department_id").references(() => departments.id, { onDelete: "set null" }),
  appointmentDate: date("appointment_date").notNull(),
  timeSlot: varchar("time_slot", { length: 80 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("Waiting"),
  source: varchar("source", { length: 24 }).notNull().default("website"),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("appointments_date_idx").on(table.appointmentDate), index("appointments_status_idx").on(table.status)]);

export const opdVisits = pgTable("opd_visits", {
  id: serial("id").primaryKey(),
  visitRef: varchar("visit_ref", { length: 32 }).notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  appointmentId: integer("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  doctorId: integer("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  chiefComplaint: text("chief_complaint"),
  clinicalNotes: text("clinical_notes"),
  followUpDate: date("follow_up_date"),
  createdAt: createdAt(),
});

export const patientVitals = pgTable("patient_vitals", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  visitId: integer("visit_id").references(() => opdVisits.id, { onDelete: "set null" }),
  bloodPressure: varchar("blood_pressure", { length: 20 }),
  temperatureC: varchar("temperature_c", { length: 12 }),
  pulse: integer("pulse"),
  bloodSugar: varchar("blood_sugar", { length: 20 }),
  weightKg: varchar("weight_kg", { length: 12 }),
  heightCm: varchar("height_cm", { length: 12 }),
  oxygenSaturation: integer("oxygen_saturation"),
  recordedAt: createdAt(),
});

export const diagnoses = pgTable("diagnoses", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").notNull().references(() => opdVisits.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 30 }),
  description: text("description").notNull(),
  createdAt: createdAt(),
});

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  prescriptionRef: varchar("prescription_ref", { length: 32 }).notNull().unique(),
  visitId: integer("visit_id").notNull().references(() => opdVisits.id, { onDelete: "cascade" }),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").references(() => doctors.id),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const prescriptionItems = pgTable("prescription_items", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").notNull().references(() => prescriptions.id, { onDelete: "cascade" }),
  medicineId: integer("medicine_id"),
  medicineName: varchar("medicine_name", { length: 160 }).notNull(),
  strength: varchar("strength", { length: 80 }),
  dosage: varchar("dosage", { length: 100 }),
  frequency: varchar("frequency", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  quantity: integer("quantity").notNull().default(1),
  instructions: text("instructions"),
});

export const labTests = pgTable("lab_tests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull().default("General"),
  description: text("description"),
  price: integer("price").notNull().default(0),
  turnaround: varchar("turnaround", { length: 80 }).notNull().default("Same day"),
  parameters: jsonb("parameters").$type<Array<{ name: string; unit: string; range: string }>>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
});

export const labSamples = pgTable("lab_samples", {
  id: serial("id").primaryKey(),
  sampleReference: varchar("sample_reference", { length: 32 }).notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  testId: integer("test_id").notNull().references(() => labTests.id),
  requestedByDoctorId: integer("requested_by_doctor_id").references(() => doctors.id),
  status: varchar("status", { length: 32 }).notNull().default("Collected"),
  sampleDate: date("sample_date").notNull(),
  collectedAt: timestamp("collected_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: createdAt(),
});

export const labReports = pgTable("lab_reports", {
  id: serial("id").primaryKey(),
  reportReference: varchar("report_reference", { length: 32 }).notNull().unique(),
  sampleId: integer("sample_id").notNull().references(() => labSamples.id, { onDelete: "cascade" }),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  testId: integer("test_id").notNull().references(() => labTests.id),
  resultValues: jsonb("result_values").$type<Array<{ name: string; value: string; unit: string; range: string; flag: string }>>().notNull().default([]),
  status: varchar("status", { length: 32 }).notNull().default("Pending"),
  authorized: boolean("authorized").notNull().default(false),
  isDemo: boolean("is_demo").notNull().default(true),
  sampleDate: date("sample_date").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: createdAt(),
}, (table) => [index("lab_reports_ref_idx").on(table.reportReference), index("lab_reports_status_idx").on(table.status)]);

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  contactName: varchar("contact_name", { length: 120 }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 190 }),
  address: text("address"),
  createdAt: createdAt(),
});

export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  genericName: varchar("generic_name", { length: 160 }),
  brandName: varchar("brand_name", { length: 160 }),
  category: varchar("category", { length: 100 }).notNull().default("General"),
  batchNumber: varchar("batch_number", { length: 64 }).notNull().default("DEMO-01"),
  purchasePrice: integer("purchase_price").notNull().default(0),
  salePrice: integer("sale_price").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  lowStockAt: integer("low_stock_at").notNull().default(10),
  expiryDate: date("expiry_date"),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("medicines_stock_idx").on(table.stock)]);

export const pharmacySales = pgTable("pharmacy_sales", {
  id: serial("id").primaryKey(),
  receiptNumber: varchar("receipt_number", { length: 32 }).notNull().unique(),
  patientId: integer("patient_id").references(() => patients.id, { onDelete: "set null" }),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull(),
  paymentMethod: varchar("payment_method", { length: 32 }).notNull().default("Cash"),
  createdAt: createdAt(),
});

export const pharmacySaleItems = pgTable("pharmacy_sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => pharmacySales.id, { onDelete: "cascade" }),
  medicineId: integer("medicine_id").notNull().references(() => medicines.id),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  lineTotal: integer("line_total").notNull(),
});

export const wards = pgTable("wards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  type: varchar("type", { length: 80 }).notNull(),
  dailyRate: integer("daily_rate").notNull().default(0),
});

export const beds = pgTable("beds", {
  id: serial("id").primaryKey(),
  wardId: integer("ward_id").notNull().references(() => wards.id, { onDelete: "cascade" }),
  bedNumber: varchar("bed_number", { length: 32 }).notNull(),
  status: varchar("status", { length: 24 }).notNull().default("Available"),
}, (table) => [uniqueIndex("beds_ward_number_idx").on(table.wardId, table.bedNumber), index("beds_status_idx").on(table.status)]);

export const admissions = pgTable("admissions", {
  id: serial("id").primaryKey(),
  admissionReference: varchar("admission_reference", { length: 32 }).notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  bedId: integer("bed_id").notNull().references(() => beds.id),
  admittedAt: timestamp("admitted_at", { withTimezone: true }).notNull().defaultNow(),
  dischargedAt: timestamp("discharged_at", { withTimezone: true }),
  dailyRoomRate: integer("daily_room_rate").notNull().default(0),
  status: varchar("status", { length: 24 }).notNull().default("Admitted"),
  notes: text("notes"),
});

export const nursingNotes = pgTable("nursing_notes", {
  id: serial("id").primaryKey(),
  admissionId: integer("admission_id").notNull().references(() => admissions.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id").references(() => employees.id),
  note: text("note").notNull(),
  createdAt: createdAt(),
});

export const doctorRounds = pgTable("doctor_rounds", {
  id: serial("id").primaryKey(),
  admissionId: integer("admission_id").notNull().references(() => admissions.id, { onDelete: "cascade" }),
  doctorId: integer("doctor_id").references(() => doctors.id),
  notes: text("notes").notNull(),
  createdAt: createdAt(),
});

export const surgeryRecords = pgTable("surgery_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  surgeonId: integer("surgeon_id").references(() => doctors.id),
  procedureName: varchar("procedure_name", { length: 180 }).notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  status: varchar("status", { length: 32 }).notNull().default("Scheduled"),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 32 }).notNull().unique(),
  patientId: integer("patient_id").references(() => patients.id, { onDelete: "set null" }),
  source: varchar("source", { length: 40 }).notNull().default("OPD"),
  total: integer("total").notNull().default(0),
  paid: integer("paid").notNull().default(0),
  status: varchar("status", { length: 32 }).notNull().default("Unpaid"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("invoices_created_idx").on(table.createdAt)]);

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 240 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(),
  lineTotal: integer("line_total").notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  method: varchar("method", { length: 32 }).notNull().default("Cash"),
  paymentReference: varchar("payment_reference", { length: 64 }),
  receivedBy: integer("received_by").references(() => users.id),
  createdAt: createdAt(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: varchar("description", { length: 220 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: integer("amount").notNull(),
  vendor: varchar("vendor", { length: 160 }),
  reference: varchar("reference", { length: 64 }),
  createdAt: createdAt(),
});

export const employeesAttendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  workDate: date("work_date").notNull(),
  shift: varchar("shift", { length: 60 }).notNull().default("Day"),
  status: varchar("status", { length: 24 }).notNull().default("Present"),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("attendance_employee_day_idx").on(table.employeeId, table.workDate)]);

export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  payPeriod: varchar("pay_period", { length: 16 }).notNull(),
  grossAmount: integer("gross_amount").notNull(),
  deductions: integer("deductions").notNull().default(0),
  netAmount: integer("net_amount").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  status: varchar("status", { length: 24 }).notNull().default("Pending"),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("payroll_employee_period_idx").on(table.employeeId, table.payPeriod)]);

export const healthcarePackages = pgTable("healthcare_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  includedTests: jsonb("included_tests").$type<string[]>().notNull().default([]),
  includedConsultations: jsonb("included_consultations").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const websiteServices = pgTable("website_services", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 60 }).notNull().default("heart"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 220 }).notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  author: varchar("author", { length: 160 }).notNull().default("Rana Medical Hospital editorial team"),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  isPublished: boolean("is_published").notNull().default(false),
  isDemo: boolean("is_demo").notNull().default(true),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  rating: integer("rating").notNull().default(5),
  feedback: text("feedback").notNull(),
  reviewDate: date("review_date"),
  isIllustrative: boolean("is_illustrative").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(false),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: varchar("question", { length: 240 }).notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 190 }),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 24 }).notNull().default("New"),
  createdAt: createdAt(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  kind: varchar("kind", { length: 32 }).notNull().default("info"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: updatedAt(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  actorRole: varchar("actor_role", { length: 40 }),
  action: varchar("action", { length: 140 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: varchar("entity_id", { length: 64 }),
  details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: createdAt(),
}, (table) => [index("audit_logs_created_idx").on(table.createdAt)]);

export const ambulances = pgTable("ambulances", {
  id: serial("id").primaryKey(),
  vehicleNumber: varchar("vehicle_number", { length: 40 }).notNull().unique(),
  driverName: varchar("driver_name", { length: 160 }),
  driverPhone: varchar("driver_phone", { length: 32 }),
  status: varchar("status", { length: 32 }).notNull().default("Unconfirmed"),
});

export const ambulanceDispatches = pgTable("ambulance_dispatches", {
  id: serial("id").primaryKey(),
  ambulanceId: integer("ambulance_id").notNull().references(() => ambulances.id),
  patientId: integer("patient_id").references(() => patients.id),
  pickupAddress: text("pickup_address").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("Requested"),
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
  createdAt: createdAt(),
});
