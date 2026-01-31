# Legacy Database & Removed Files — Reference

This document describes **removed** files and folders so you can recreate similar functionality if needed. No organization names, emails, or credentials are included.

---

## 1. Removed: `database/` Folder

The project previously had a `database/` folder with SQL and scripts from an older setup. It has been removed. The **current** database setup is in **`supabase/migrations/000_SETUP_NEW_DATABASE.sql`** and **`supabase/migrations/001_rename_three_user_job_access_to_user_job_access.sql`**.

### What the old `database/` folder contained (concepts only)

- **Production setup script**  
  One main SQL file that created:
  - A **user job access** table (user_id, role, job_id, department, position, etc.) for role-based access.
  - **Archive** support: an `archived` column on applications and policies to hide archived rows from default views.
  - **Security definer functions**: e.g. `is_admin(user_id)`, `is_manager_for_job(user_id, job_id)` for RLS policies.
  - RLS policies so admins could manage all jobs/applications, and managers only their assigned jobs.

- **Migrations subfolder**  
  Scripts for: adding archive support, adding name/email to the user access table, adding test users to the access table, and setting up an initial admin user (admin created via Supabase Auth; script only granted DB role/access).

- **Archive subfolder**  
  Old debug/fix scripts (RLS, auth, duplicates, test users, staging). Not needed for a fresh Supabase project.

### If you need similar features in the new project

- **User roles and job assignment**  
  The access table is **`user_job_access`** (user_id, role, job_id, department, position, etc.), created or renamed by `supabase/migrations/001_rename_three_user_job_access_to_user_job_access.sql`. To add it manually, create a table like `user_job_access` (user_id, role, job_id, department, position). Create RLS policies that use this table and, if needed, `SECURITY DEFINER` functions such as `is_admin(user_id)` and `is_manager_for_job(user_id, job_id)`.

- **Archive**  
  The current `applications` table in `supabase/migrations/000_SETUP_NEW_DATABASE.sql` already has an `archived` column. Add RLS so that:
  - Default SELECT only shows `archived = false`.
  - Only admins (or allowed roles) can see or update archived rows.

- **Admin user**  
  Create the admin in **Supabase Dashboard → Authentication → Users**. No hardcoded emails or passwords; use your own org’s admin email.

Current schema, RLS, storage, and triggers are in **`supabase/migrations/000_SETUP_NEW_DATABASE.sql`** and **`supabase/migrations/001_rename_three_user_job_access_to_user_job_access.sql`** (creates/renames `user_job_access` and RLS helpers). Use **`SUPABASE_SETUP_GUIDE.md`** at the repo root for run order.

---

## 2. Removed: Old organization assets

- **Old organization logo files** in `public/` (e.g. previous org name). The app now uses **`public/gandhi-fellowship-logo.png`**. Replace with your own logo and update references in the code if you use a different filename.

- **Old project zip** in repo root. Not needed in the repo.

---

## 3. Documentation that may reference old setup

- **`docs/guides/`**  
  Setup, admin, Vercel, email, and user-creation guides are kept but may mention the old structure. For **database**, always use:
  - **`supabase/migrations/000_SETUP_NEW_DATABASE.sql`**
  - **`supabase/migrations/001_rename_three_user_job_access_to_user_job_access.sql`**
  - **`SUPABASE_SETUP_GUIDE.md`** (root).

- **Removed:** `docs/BACKEND_REQUIREMENTS_ANALYSIS.md` and **`docs/guides/User_roles_access_learnings.md`** (contained old table names and org references). Concepts (roles, RLS, archive) are summarized in this doc and in **`docs/PRODUCT_OVERVIEW.md`**.

---

## 4. Summary

| Removed | Use instead |
|--------|-------------|
| `database/` (all SQL and scripts) | `supabase/migrations/000_*.sql` + `001_rename_three_user_job_access_to_user_job_access.sql` + `SUPABASE_SETUP_GUIDE.md` |
| Old logo files in `public/` | Your logo (e.g. `public/gandhi-fellowship-logo.png`) |
| Old project zip | — |

No credentials, API keys, or organization-specific emails are documented here or stored in the repo.
