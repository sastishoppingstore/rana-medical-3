# Deployment (clinic 3)

## Vercel (full-stack: Next.js app + API routes)
Vercel project `rana-medical-clinic3` — production URL `https://rana-medical-clinic3.vercel.app`.
Env: `DATABASE_URL` (Supabase transaction pooler, port 6543).
No special config needed; `next build` runs with the full API included.

## Firebase (static export at /clinic3)
```bash
mv src/app/api /tmp/api-backup        # API routes can't be exported statically
STATIC_EXPORT=1 STATIC_BASE_PATH=/clinic3 NEXT_PUBLIC_API_BASE=https://rana-medical-clinic3.vercel.app npm run build
mv /tmp/api-backup src/app/api
# copy out/ to the Firebase Hosting directory under /clinic3
```
The exported HTML calls the Vercel API via `apiFetch()` (Authorization bearer from localStorage `rana_session_token`).

## Database
41-table Drizzle schema (`drizzle/` migrations) in its own Supabase Postgres database (`clinic3`).
