# Planning & Schema Evolution

Notes for future schema and product evolution. Uses generic table and role names only.

---

## Current Data Model (this project)

- **jobs:** id, domain, organisation_name, about, job_description, position, location, compensation_range, pdf_url, apply_by, status, created_at, updated_at, created_by.
- **applications:** id, job_id, full_name, batch, gender, email_official, email_personal, phone_number, big_bet, fellowship_state, home_state, fpc_name, state_spoc_name, resume_url, applied_at, status, reference_number, archived.
- **admin_column_definitions:** id, name, type, options, width, order_index, show_in_form (for dynamic form/column config).

Single-org use: one Supabase project, one set of jobs and applications.

---

## Optional Extensions (without changing current schema names)

- **User/job assignment:** Add a table like `user_job_access` (user_id, role, job_id, department, position). Use it in SECURITY DEFINER functions (e.g. `is_admin(user_id)`, `is_manager_for_job(user_id, job_id)`) and in RLS so managers only see assigned jobs and their applications. See `docs/guides/User_roles_access_learnings.md`.
- **Archive:** The `applications` table already has `archived`. Add RLS so default SELECT only returns `archived = false`; add a separate admin view or policy to read archived rows.
- **Multi-tenant (future):** If you need multiple organizations, add an `organisations` table and `organisation_id` to jobs (and optionally applications). Scope all job/application queries and RLS by `organisation_id`; add org-level admin and billing later.

---

## Implementation Tips

- Use a single migration file (or few) per change; avoid ad-hoc scripts in production.
- Keep table and column names generic (e.g. `jobs`, `applications`, `user_job_access`).
- Document policy purpose in comments or a small doc so future changes are safe.

No credentials or organization-specific identifiers are included.
