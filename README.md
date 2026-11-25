# Rana Medical Hospital · connected care platform

A Next.js App Router application with a public hospital experience, an authenticated staff workspace, a shared PostgreSQL database (Drizzle ORM), and transactional APIs for core hospital workflows.

## What is included

- Public hospital website with 17 ordered experience areas, responsive navigation, a four-face CSS 3D medical cube, appointment finder, searchable doctor directory, PKR package/test menus, secure report lookup, editorial content, FAQ and contact form.
- Staff portal at `/erp` with six role-scoped workspaces and clearly marked demonstration role switching.
- Shared Drizzle schema for identity, appointments, patients, clinicians, visits, vitals, prescriptions, diagnostics, pharmacy, wards/beds, admissions, invoices, payments, expenses, staff, CMS, inquiries, notifications and audit records.
- Persisted booking/token flow, public doctor directory, contact inquiry inbox, and authorized report verification.
- ERP transactional workflows for OPD status changes, patient registration, consultation/prescription capture, lab result publication, medicine sales/stock reduction, bed assignment/discharge, partial payments and expense recording.
- Printed OPD/appointment, lab, pharmacy, invoice and daily summary layouts.
- Synthetic seed data and a setup guide below.

The data model and application are a foundation for a hospital platform, not a substitute for clinical governance, operational readiness, compliance review or a security assessment. No accreditation, real hospital employee, ambulance dispatch, panel coverage, clinical result or patient review is asserted by the demo content.

## Requirements

- Node.js 20+
- npm
- PostgreSQL 14+

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and a unique `SESSION_SECRET`.
2. Start PostgreSQL and create the configured database.
3. Install dependencies with `npm install`.
4. Apply the Drizzle schema:

   ```bash
   npx drizzle-kit push
   ```

5. Seed fictional review data:

   ```bash
   npx tsx scripts/seed.ts
   ```

   To create a real initial administrator, set `SEED_ADMIN_EMAIL` and a strong `SEED_ADMIN_PASSWORD` before running the seed. The password is stored as a salted scrypt hash. The seed does not create a shared default staff password.
6. Run locally with `npm run dev` and open `http://localhost:3000`.

The Drizzle CLI configuration is in `drizzle.config.json`. It targets the local sandbox database. Update its credentials for your deployment process or configure an environment-specific Drizzle config before running schema changes in another environment.

## ERP access and security boundaries

- Open `/erp` and choose one of the six roles to enter **demonstration mode**. Demo access is enabled by default for evaluation and intentionally allows role switching. Seeded patients, doctors, reviews, invoices, appointments and report results are synthetic.
- For staff credentials, choose **Staff credentials**. The sign-in API verifies a provisioned user's salted scrypt hash and issues a signed, HTTP-only, `SameSite=Lax` session cookie. An initial Super Admin can be created through the seed script's environment variables.
- Set `ENABLE_DEMO_ACCESS=false` in production. Do not expose the demo role selector to staff or patients. Configure a high-entropy `SESSION_SECRET` independent of the database password, enforce HTTPS, use an environment-specific database account, and review role permissions before handling patient records.
- ERP records are returned only after a signed session and server-side role check. The public laboratory endpoint returns only authorized/published reports that match both report reference and registered mobile number; lookup is rate-limited and responses are not cacheable. Keep all production medical records out of demo mode.
- The included in-process rate limiter is a single-instance abuse guard, not a distributed production limiter. Use Redis or an API gateway, review CSRF protections and origin policy for your deployment, add session revocation/rotation, establish backup/restore drills, audit retention and encryption-at-rest policy, and complete an independent security/privacy review.
- No security certification or healthcare regulatory compliance is claimed.

## Optional integrations

### WhatsApp Cloud API

Set `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, and optionally `WHATSAPP_API_VERSION` on the server. The appointment handler calls the configured Graph API using server-side credentials. If no credentials are configured, it returns a `wa.me` deep-link fallback; the interface does not claim a message was sent.

### Map

Set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` only after Rana Medical Hospital confirms its address and map location. Otherwise the page shows an explicit location placeholder.

SMS, email delivery, payment gateway, ambulance dispatch, insurance panels, WebSockets and external lab equipment integrations are not represented as connected. The ERP refreshes active views against the shared database; this is short-poll synchronization, not a WebSocket push channel. Integrate and monitor a message bus/SSE/WebSocket service when operational near-real-time delivery is required.

## Data and CMS

The public website reads doctors, departments, services, packages, tests, articles and FAQs from `/api/public`; appointments and inquiries are written to the same PostgreSQL database used by the ERP. Doctor changes made from the Super Admin workspace are visible in the public directory/booking finder on the next public content fetch. Article publishing is role-checked and available in the website CMS. Package rates, address, contact details, OPD schedules and emergency status must be reviewed and configured before publication.

All prices and statistics in seed/demo content are illustrative. Clinical reference ranges in demo test definitions are synthetic examples and must not be applied to patient care. Replace every placeholder with hospital-approved information before launch.

## Critical workflow verification

1. Apply schema and seed data; enter `/erp` as Receptionist.
2. Book a future OPD appointment from the public site. Confirm the unique reference and token are returned.
3. Refresh the Receptionist OPD queue. Confirm the appointment appears and update its queue status. Sign out and enter the Doctor demo workspace to verify role-filtered queues and consultation access.
4. Enter Super Admin demo mode, add a clearly labeled sample doctor, then reload the public doctor directory and appointment finder.
5. Enter Doctor mode, save a consultation and optional prescription. Print a professional document from the browser print dialog.
6. Enter Lab Technician mode, register a sample, enter a result and publish it. Verify public report access only with the matching reference and registered mobile; try a mismatched mobile to confirm rejection.
7. Enter Pharmacist mode, complete a sale. Confirm stock decreases and a paid invoice is created; attempt an oversell to verify it is rejected.
8. Enter Receptionist mode, admit a patient to an available bed, confirm occupancy, discharge the patient and confirm bed release.
9. Enter Accountant mode, record a partial payment and an expense. Confirm the dashboard figures are recalculated from invoices, payments and expense rows.
10. Switch roles and verify unauthorized modules/actions return 403 from the API. Verify logout clears the signed session.
11. Print an OPD token, lab report, pharmacy receipt, patient invoice and daily summary. Check both desktop and 375–430 px mobile layouts.

For API and production acceptance, also test duplicate submissions, concurrent bed assignment, concurrent stock sales, rate limiting, database failures, audit records, data retention, backups and restore procedures.

## Build and deployment

- Use a managed PostgreSQL database and apply `npx drizzle-kit push` only through a controlled deployment/migration job.
- Configure `DATABASE_URL`, `SESSION_SECRET`, `ENABLE_DEMO_ACCESS=false`, optional integration secrets, TLS, host/origin policy and backups in the deployment environment.
- Run the seed script only against a disposable/demo database or as a reviewed initial production administrator provisioning step. Do not seed demo patients, demo clinical results or sample reviews into a live environment.
- Deploy as a Node.js Next.js application. Confirm `/api/health` after database connectivity is established.
- Set the real hospital address, OPD schedules, service availability, credentials, clinical test references, prices, payment methods, privacy notice, terms, contact email and map through a reviewed CMS/configuration workflow before public launch.

## Technology

Next.js App Router · React · TypeScript · Tailwind CSS 4 · Framer Motion · Lucide React · Drizzle ORM · PostgreSQL.
