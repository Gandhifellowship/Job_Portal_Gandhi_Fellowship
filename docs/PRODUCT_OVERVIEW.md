# Job Portal — Product Overview

## Summary

Job posting and application management platform with role-based access, admin dashboard, application forms, email notifications, and optional archive/export. Built with React, Vite, Supabase, and Resend.

## Core Features

- **Job management:** Create, edit, and manage job postings (domain, organisation, position, location, compensation, deadline, PDF JD).
- **Application system:** Candidate form with configurable fields, resume upload (PDF), reference numbers, and email notifications.
- **Admin dashboard:** Auth-protected dashboard; view jobs and applications; filters, sort, export to Excel; optional user/role and job-assignment management.
- **Security:** Row Level Security (RLS), Supabase Auth, env-based config (no hardcoded keys).
- **Storage:** Supabase Storage for job PDFs (public) and resumes (private).

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind, shadcn/ui.
- **Backend:** Supabase (PostgreSQL, Auth, Storage), Resend (email).
- **Deploy:** Vite build; deploy to Vercel or similar (env vars for Supabase + Resend).

## Database (current)

- **Migrations:** `supabase/migrations/000_SETUP_NEW_DATABASE.sql` and `001_rename_three_user_job_access_to_user_job_access.sql`.
- **Tables:** `jobs`, `applications`, `admin_column_definitions`.
- **Storage buckets:** `job-pdfs`, `resumes`.
- See **SUPABASE_SETUP_GUIDE.md** at repo root for run instructions.

## Roadmap (concepts)

- Keep job and application schema aligned with org needs; extend fields via migrations.
- Optional: user/job assignment table and RLS for manager-only access to assigned jobs.
- Optional: archive flag and policies so archived rows are hidden from default views.
- Optional: more email templates and configurable recipient lists via env.

No organization names, credentials, or API keys are stored in this repo.
