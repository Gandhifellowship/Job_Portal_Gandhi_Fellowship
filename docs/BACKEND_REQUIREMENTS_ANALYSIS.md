# Backend Requirements Analysis: Supabase + Vercel

Deep-dive of what is required for the backend (Supabase + Vercel serverless APIs) to work.

---

## 1. Supabase

### 1.1 Environment variables

| Variable | Where used | Required |
|----------|------------|----------|
| `VITE_SUPABASE_URL` | Frontend client, admin-client, API (fallback) | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Frontend `client.ts` (reads anon key) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes only; **never** in frontend | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | API routes (primary in send-application-notification) | Optional if `VITE_SUPABASE_URL` set |

**Local `.env` mismatch:** Your `.env` has `VITE_SUPABASE_PUBLISHABLE_KEY` but `src/integrations/supabase/client.ts` expects `VITE_SUPABASE_ANON_KEY`. Rename to `VITE_SUPABASE_ANON_KEY` or add a fallback in client.ts.

**Security:** `src/integrations/supabase/admin-client.ts` uses the service role key and is imported in frontend (e.g. `useUserManagement` does not; admin operations go via `/api/admin/*`). Confirm no component uses `supabaseAdmin` in the browser; if it does, move those operations to server APIs and remove service role from frontend.

### 1.2 Database schema (single source of truth)

The app expects these **table names**:

- `jobs` – job postings  
- `applications` – applications (with `reference_number`, `archived`, etc.)  
- `user_job_access` – user roles and job assignments (admin/manager)  
- `admin_column_definitions` – admin grid column config  

**Storage buckets:**

- `job-pdfs` (public) – job PDFs  
- `resumes` (private) – resume uploads  

**Correct setup path:**

1. Run **`supabase/migrations/000_SETUP_NEW_DATABASE.sql`** – creates `jobs`, `applications`, `admin_column_definitions`, storage buckets and policies, RLS, triggers (e.g. `reference_number`), indexes.  
2. Run **`supabase/migrations/001_rename_three_user_job_access_to_user_job_access.sql`** – renames `three_user_job_access` → `user_job_access` if the old table exists, or creates `user_job_access` (with RLS and `is_admin`/`is_manager_for_job`) for fresh installs.

### 1.3 Auth

- Admin/HR users must exist in **Supabase Auth** and have a row in **`user_job_access`** with `role = 'admin'` and `job_id = NULL` for full admin access.
- Create first admin via Supabase Dashboard (Auth → Users) or a one-off script, then insert into `user_job_access` (or use a migration that inserts from `auth.users` for a known email).

### 1.4 RLS and functions

- `000_SETUP_NEW_DATABASE.sql` already enables RLS on `jobs`, `applications`, `admin_column_definitions` and defines policies (e.g. public can view active jobs and insert applications; authenticated can manage jobs/applications/column definitions).
- For `user_job_access`, RLS must allow: users to read own row(s); admins (via `is_admin`) to manage all rows. Implement `is_admin(user_id)` (e.g. SECURITY DEFINER) that checks `user_job_access` for `role = 'admin'` and `job_id IS NULL`.

### 1.5 Storage policies

- `000` creates buckets and policies: public read for `job-pdfs`; authenticated upload/update/delete for `job-pdfs`; authenticated read for `resumes`; anyone can insert into `resumes` (for public application form). Ensure no policy blocks the API (service role bypasses RLS).

---

## 2. Vercel (serverless API)

### 2.1 API routes

| Route | Purpose | Env vars (server) |
|-------|---------|-------------------|
| `POST /api/send-application-notification` | Submit application, upload resume, insert DB, send email | See below |
| `POST /api/admin/create-user` | Create auth user + `user_job_access` row | Supabase URL + service role |
| `POST /api/admin/update-user` | Update user and access row | Same |
| `POST /api/admin/delete-user` | Delete from access table + auth user | Same |

**`vercel.json`:** Only `api/send-application-notification.ts` is listed under `functions` with `maxDuration: 10`. The admin routes live under `api/admin/*`; Vercel will still deploy them as serverless functions if the project is set up to build the `api/` folder (e.g. Vite + Vercel usually picks up `api/**/*.ts`).

### 2.2 Environment variables (Vercel Dashboard)

Set these for Production / Preview / Development as needed:

**Supabase (API):**

- `VITE_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` (API uses both; at least one required)
- `SUPABASE_SERVICE_ROLE_KEY`

**Email (Resend):**

- `RESEND_API_KEY`
- `FROM_EMAIL` (verified sender in Resend)
- `ADMIN_EMAIL` (single recipient fallback)
- `ADMIN_EMAILS` (optional, comma-separated list; overrides single `ADMIN_EMAIL` when set)

**Frontend (build-time):** So that the Vite build gets the right values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend env.

### 2.3 Handler signature and runtime

- **`send-application-notification.ts`** uses Node-style `(req, res)` and `formidable` for multipart parsing. This is the legacy Node.js request/response style. Vercel’s Node runtime for `/api/*` often still supports this; if you see runtime errors (e.g. `req`/`res` undefined or wrong shape), you may need to adapt to the Web `Request`/`Response` API and use a multipart parser that works with `Request` (e.g. `request.formData()`).
- **Admin routes** use `NextApiRequest` and `NextApiResponse` (Next.js types). This is a **Vite** project, not Next.js. They still use `(req, res)`-style. As long as Vercel passes Node-style `(req, res)` to these handlers, they can work; otherwise they need to be rewritten to the same style as the rest of the API (or to Request/Response).

### 2.4 Admin API env and Supabase URL

Admin handlers use:

- `process.env.NEXT_PUBLIC_SUPABASE_URL`
- `process.env.SUPABASE_SERVICE_ROLE_KEY`

So in Vercel you must set at least one of `NEXT_PUBLIC_SUPABASE_URL` or `VITE_SUPABASE_URL` (and document that admin APIs read `NEXT_PUBLIC_SUPABASE_URL` first). Prefer one naming convention (e.g. `VITE_SUPABASE_URL` everywhere) and have the API fall back to the other for compatibility.

### 2.5 Dependencies

- **resend** – used in `send-application-notification.ts` (in `package.json`).
- **formidable** – used for multipart (in `package.json`).
- **fs** – used for temp file (Node built-in; fine in Node runtime).

No separate “api” package.json; the same dependencies are used for the app and API.

### 2.6 send-application-notification validation

The handler explicitly checks:

- `NEXT_PUBLIC_SUPABASE_URL` (and does not fall back to `VITE_SUPABASE_URL` in the validation; it does when creating the client). So set `NEXT_PUBLIC_SUPABASE_URL` in Vercel (or relax the validation to accept either).
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

It uses `process.env.ADMIN_EMAIL` / `ADMIN_EMAILS` and `FROM_EMAIL` for sending; if missing, emails may fail or use wrong sender/recipient.

---

## 3. Checklist: “Backend works”

### Supabase

- [ ] Project created; URL and anon key in frontend env; service role key **only** in server env (Vercel).
- [ ] Run `supabase/migrations/000_SETUP_NEW_DATABASE.sql` in Supabase SQL Editor.
- [ ] Run `supabase/migrations/001_rename_three_user_job_access_to_user_job_access.sql` (creates/renames `user_job_access`, RLS, and `is_admin`/`is_manager_for_job`).
- [ ] Storage buckets `job-pdfs` and `resumes` exist with policies as in `000`.
- [ ] At least one admin user in Auth and in `user_job_access` with `role = 'admin'`, `job_id = NULL`.
- [ ] Frontend `.env`: `VITE_SUPABASE_ANON_KEY` (or align name with `client.ts`).

### Vercel

- [ ] Env vars set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and either `NEXT_PUBLIC_SUPABASE_URL` or same URL as `VITE_SUPABASE_URL`; `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_EMAIL` (and optionally `ADMIN_EMAILS`).
- [ ] Redeploy after changing env.
- [ ] Confirm `api/send-application-notification` and `api/admin/create-user`, `update-user`, `delete-user` are deployed (e.g. under Deployments → Functions).
- [ ] Test: submit application (form + file) → DB row + email; create/update/delete user from admin UI.

### Optional follow-ups

- Unify env naming (e.g. use `VITE_SUPABASE_URL` everywhere and make API validation accept it).
- Ensure no frontend code uses `supabaseAdmin` / service role; keep admin operations behind `/api/admin/*`.
- If Vercel breaks on Node-style `(req, res)` or multipart, refactor `send-application-notification` to Web `Request`/`Response` and a compatible form parser.

---

## 4. Doc references

- **Env and deploy:** `docs/guides/VERCEL_ENV_SETUP.md`, `VERCEL_SETUP.md`
- **DB:** `docs/LEGACY_DATABASE_AND_REMOVED_FILES.md` (for legacy structure reference); `supabase/migrations/000_*.sql` and `001_rename_three_user_job_access_to_user_job_access.sql` are the canonical migrations.
- **Supabase:** `SUPABASE_SETUP_GUIDE.md`, `docs/guides/SETUP.md`
