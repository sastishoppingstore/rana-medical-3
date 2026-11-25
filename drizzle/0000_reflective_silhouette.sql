CREATE TABLE "admissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"admission_reference" varchar(32) NOT NULL,
	"patient_id" integer NOT NULL,
	"bed_id" integer NOT NULL,
	"admitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"discharged_at" timestamp with time zone,
	"daily_room_rate" integer DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'Admitted' NOT NULL,
	"notes" text,
	CONSTRAINT "admissions_admission_reference_unique" UNIQUE("admission_reference")
);
--> statement-breakpoint
CREATE TABLE "ambulance_dispatches" (
	"id" serial PRIMARY KEY NOT NULL,
	"ambulance_id" integer NOT NULL,
	"patient_id" integer,
	"pickup_address" text NOT NULL,
	"status" varchar(32) DEFAULT 'Requested' NOT NULL,
	"dispatched_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ambulances" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_number" varchar(40) NOT NULL,
	"driver_name" varchar(160),
	"driver_phone" varchar(32),
	"status" varchar(32) DEFAULT 'Unconfirmed' NOT NULL,
	CONSTRAINT "ambulances_vehicle_number_unique" UNIQUE("vehicle_number")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(32) NOT NULL,
	"token" varchar(32) NOT NULL,
	"patient_id" integer NOT NULL,
	"doctor_id" integer,
	"department_id" integer,
	"appointment_date" date NOT NULL,
	"time_slot" varchar(80) NOT NULL,
	"status" varchar(32) DEFAULT 'Waiting' NOT NULL,
	"source" varchar(24) DEFAULT 'website' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_reference_unique" UNIQUE("reference"),
	CONSTRAINT "appointments_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"actor_role" varchar(40),
	"action" varchar(140) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(64),
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beds" (
	"id" serial PRIMARY KEY NOT NULL,
	"ward_id" integer NOT NULL,
	"bed_number" varchar(32) NOT NULL,
	"status" varchar(24) DEFAULT 'Available' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(180) NOT NULL,
	"title" varchar(220) NOT NULL,
	"excerpt" text NOT NULL,
	"body" text NOT NULL,
	"author" varchar(160) DEFAULT 'Rana Medical Hospital editorial team' NOT NULL,
	"image_url" text,
	"published_at" timestamp with time zone,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_demo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "diagnoses" (
	"id" serial PRIMARY KEY NOT NULL,
	"visit_id" integer NOT NULL,
	"code" varchar(30),
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor_rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"admission_id" integer NOT NULL,
	"doctor_id" integer,
	"notes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"specialty" varchar(120) NOT NULL,
	"department_id" integer,
	"qualifications" varchar(240) DEFAULT 'Qualifications to be verified' NOT NULL,
	"pmdc_registration" varchar(100) DEFAULT 'Not supplied' NOT NULL,
	"experience_years" integer DEFAULT 0 NOT NULL,
	"consultation_fee" integer DEFAULT 0 NOT NULL,
	"opd_days" varchar(160) DEFAULT 'Please confirm with reception' NOT NULL,
	"opd_timings" varchar(120) DEFAULT 'Please confirm with reception' NOT NULL,
	"available_slots" integer DEFAULT 6 NOT NULL,
	"photo_url" text,
	"is_demo" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_code" varchar(40) NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"designation" varchar(100) NOT NULL,
	"department_id" integer,
	"phone" varchar(32),
	"email" varchar(190),
	"salary" integer DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"is_demo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_code_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"work_date" date NOT NULL,
	"shift" varchar(60) DEFAULT 'Day' NOT NULL,
	"status" varchar(24) DEFAULT 'Present' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" varchar(220) NOT NULL,
	"category" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"vendor" varchar(160),
	"reference" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" varchar(240) NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "healthcare_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"included_tests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"included_consultations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(190),
	"subject" varchar(200),
	"message" text NOT NULL,
	"status" varchar(24) DEFAULT 'New' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"description" varchar(240) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" integer NOT NULL,
	"line_total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" varchar(32) NOT NULL,
	"patient_id" integer,
	"source" varchar(40) DEFAULT 'OPD' NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"paid" integer DEFAULT 0 NOT NULL,
	"status" varchar(32) DEFAULT 'Unpaid' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "lab_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_reference" varchar(32) NOT NULL,
	"sample_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"test_id" integer NOT NULL,
	"result_values" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'Pending' NOT NULL,
	"authorized" boolean DEFAULT false NOT NULL,
	"is_demo" boolean DEFAULT true NOT NULL,
	"sample_date" date NOT NULL,
	"verified_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_reports_report_reference_unique" UNIQUE("report_reference")
);
--> statement-breakpoint
CREATE TABLE "lab_samples" (
	"id" serial PRIMARY KEY NOT NULL,
	"sample_reference" varchar(32) NOT NULL,
	"patient_id" integer NOT NULL,
	"test_id" integer NOT NULL,
	"requested_by_doctor_id" integer,
	"status" varchar(32) DEFAULT 'Collected' NOT NULL,
	"sample_date" date NOT NULL,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_samples_sample_reference_unique" UNIQUE("sample_reference")
);
--> statement-breakpoint
CREATE TABLE "lab_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"category" varchar(100) DEFAULT 'General' NOT NULL,
	"description" text,
	"price" integer DEFAULT 0 NOT NULL,
	"turnaround" varchar(80) DEFAULT 'Same day' NOT NULL,
	"parameters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_tests_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "medicines" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"generic_name" varchar(160),
	"brand_name" varchar(160),
	"category" varchar(100) DEFAULT 'General' NOT NULL,
	"batch_number" varchar(64) DEFAULT 'DEMO-01' NOT NULL,
	"purchase_price" integer DEFAULT 0 NOT NULL,
	"sale_price" integer DEFAULT 0 NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"low_stock_at" integer DEFAULT 10 NOT NULL,
	"expiry_date" date,
	"supplier_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" varchar(180) NOT NULL,
	"message" text NOT NULL,
	"kind" varchar(32) DEFAULT 'info' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nursing_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"admission_id" integer NOT NULL,
	"employee_id" integer,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opd_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"visit_ref" varchar(32) NOT NULL,
	"patient_id" integer NOT NULL,
	"appointment_id" integer,
	"doctor_id" integer,
	"chief_complaint" text,
	"clinical_notes" text,
	"follow_up_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opd_visits_visit_ref_unique" UNIQUE("visit_ref")
);
--> statement-breakpoint
CREATE TABLE "patient_vitals" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"visit_id" integer,
	"blood_pressure" varchar(20),
	"temperature_c" varchar(12),
	"pulse" integer,
	"blood_sugar" varchar(20),
	"weight_kg" varchar(12),
	"height_cm" varchar(12),
	"oxygen_saturation" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_ref" varchar(32) NOT NULL,
	"name" varchar(160) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"gender" varchar(32),
	"date_of_birth" date,
	"address" text,
	"emergency_contact" varchar(32),
	"allergies" text,
	"medical_history" text,
	"is_demo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patients_patient_ref_unique" UNIQUE("patient_ref")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"method" varchar(32) DEFAULT 'Cash' NOT NULL,
	"payment_reference" varchar(64),
	"received_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"pay_period" varchar(16) NOT NULL,
	"gross_amount" integer NOT NULL,
	"deductions" integer DEFAULT 0 NOT NULL,
	"net_amount" integer NOT NULL,
	"paid_at" timestamp with time zone,
	"status" varchar(24) DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pharmacy_sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"medicine_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"line_total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pharmacy_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"receipt_number" varchar(32) NOT NULL,
	"patient_id" integer,
	"subtotal" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"payment_method" varchar(32) DEFAULT 'Cash' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pharmacy_sales_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "prescription_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"prescription_id" integer NOT NULL,
	"medicine_id" integer,
	"medicine_name" varchar(160) NOT NULL,
	"strength" varchar(80),
	"dosage" varchar(100),
	"frequency" varchar(100),
	"duration" varchar(100),
	"quantity" integer DEFAULT 1 NOT NULL,
	"instructions" text
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"prescription_ref" varchar(32) NOT NULL,
	"visit_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"doctor_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prescriptions_prescription_ref_unique" UNIQUE("prescription_ref")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(120) NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"contact_name" varchar(120),
	"phone" varchar(32),
	"email" varchar(190),
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surgery_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"surgeon_id" integer,
	"procedure_name" varchar(180) NOT NULL,
	"scheduled_at" timestamp with time zone,
	"status" varchar(32) DEFAULT 'Scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"department" varchar(100) NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"feedback" text NOT NULL,
	"review_date" date,
	"is_illustrative" boolean DEFAULT true NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"email" varchar(190) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(40) DEFAULT 'receptionist' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"type" varchar(80) NOT NULL,
	"daily_rate" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "wards_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "website_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"icon" varchar(60) DEFAULT 'heart' NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_bed_id_beds_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."beds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ambulance_dispatches" ADD CONSTRAINT "ambulance_dispatches_ambulance_id_ambulances_id_fk" FOREIGN KEY ("ambulance_id") REFERENCES "public"."ambulances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ambulance_dispatches" ADD CONSTRAINT "ambulance_dispatches_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_visit_id_opd_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."opd_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_rounds" ADD CONSTRAINT "doctor_rounds_admission_id_admissions_id_fk" FOREIGN KEY ("admission_id") REFERENCES "public"."admissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_rounds" ADD CONSTRAINT "doctor_rounds_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_sample_id_lab_samples_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."lab_samples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_test_id_lab_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_samples" ADD CONSTRAINT "lab_samples_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_samples" ADD CONSTRAINT "lab_samples_test_id_lab_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_samples" ADD CONSTRAINT "lab_samples_requested_by_doctor_id_doctors_id_fk" FOREIGN KEY ("requested_by_doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nursing_notes" ADD CONSTRAINT "nursing_notes_admission_id_admissions_id_fk" FOREIGN KEY ("admission_id") REFERENCES "public"."admissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nursing_notes" ADD CONSTRAINT "nursing_notes_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opd_visits" ADD CONSTRAINT "opd_visits_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opd_visits" ADD CONSTRAINT "opd_visits_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opd_visits" ADD CONSTRAINT "opd_visits_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_vitals" ADD CONSTRAINT "patient_vitals_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_vitals" ADD CONSTRAINT "patient_vitals_visit_id_opd_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."opd_visits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sale_items" ADD CONSTRAINT "pharmacy_sale_items_sale_id_pharmacy_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."pharmacy_sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sale_items" ADD CONSTRAINT "pharmacy_sale_items_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales" ADD CONSTRAINT "pharmacy_sales_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_visit_id_opd_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."opd_visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surgery_records" ADD CONSTRAINT "surgery_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surgery_records" ADD CONSTRAINT "surgery_records_surgeon_id_doctors_id_fk" FOREIGN KEY ("surgeon_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_date_idx" ON "appointments" USING btree ("appointment_date");--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "beds_ward_number_idx" ON "beds" USING btree ("ward_id","bed_number");--> statement-breakpoint
CREATE INDEX "beds_status_idx" ON "beds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "doctors_specialty_idx" ON "doctors" USING btree ("specialty");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_employee_day_idx" ON "attendance" USING btree ("employee_id","work_date");--> statement-breakpoint
CREATE INDEX "invoices_created_idx" ON "invoices" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lab_reports_ref_idx" ON "lab_reports" USING btree ("report_reference");--> statement-breakpoint
CREATE INDEX "lab_reports_status_idx" ON "lab_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "medicines_stock_idx" ON "medicines" USING btree ("stock");--> statement-breakpoint
CREATE INDEX "patients_phone_idx" ON "patients" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "patients_ref_idx" ON "patients" USING btree ("patient_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "payroll_employee_period_idx" ON "payroll" USING btree ("employee_id","pay_period");