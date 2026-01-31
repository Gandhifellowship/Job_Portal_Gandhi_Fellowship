# Job Portal — Product Roadmap

High-level product features and roadmap. No organization names or credentials.

---

## Product Overview

Job posting and application management platform with role-based access, admin dashboard, configurable application forms, email notifications, and optional archive/export. Built with React, Vite, Supabase, and Resend.

---

## Current Feature List

- **Public:** Job listing (search, filter by domain, sort), job detail with application form, homepage with branding and CTA.
- **Application form:** Configurable fields (e.g. full name, batch, gender, emails, phone, resume PDF); validation; reference number; email to applicant and admin.
- **Admin dashboard:** Auth-protected; stats (active jobs, total applications, pending); job management (create/edit/delete, PDF JD, apply-by date); applications list and grid (AG Grid); filters (position, applicant name); sort; export to Excel; optional user/role and job-assignment management.
- **Tech:** React 18, TypeScript, Vite, Tailwind, shadcn/ui; Supabase (Postgres, Auth, Storage); Resend; env-based config.

---

## Roadmap (concepts)

- **Schema evolution:** Add or adjust job/application fields via migrations; keep form and backend in sync.
- **Optional RBAC:** User/job assignment table and RLS so managers only see assigned jobs/applications (see `docs/guides/User_roles_access_learnings.md`).
- **Optional archive:** Use `archived` flag and RLS so archived rows are hidden from default views; admin can view archived separately.
- **Email:** More templates and configurable recipient lists via env.
- **Multi-tenant (future):** If needed, introduce organizations table and scope jobs/applications by organisation_id; add org-level admin and billing later.

---

## Database and Deployment

- **Current schema:** Migrations `000_SETUP_NEW_DATABASE.sql` and `001_rename_three_user_job_access_to_user_job_access.sql` (tables: `jobs`, `applications`, `user_job_access`, `admin_column_definitions`; storage: `job-pdfs`, `resumes`).
- **Deploy:** Vite build; deploy to Vercel (or similar); set Supabase and Resend env vars.

No API keys, passwords, or organization-specific data are stored in this repo.
