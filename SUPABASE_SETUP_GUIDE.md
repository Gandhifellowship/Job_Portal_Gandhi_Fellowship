# Supabase Setup Guide for New Account

This guide will help you set up your new Supabase database with all the required tables, policies, and functions for the Gandhi Fellowship Job Portal.

## Quick Setup (Recommended)

For a **NEW Supabase account**, simply run the consolidated setup file:

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Migrations
1. Run **`supabase/migrations/000_SETUP_NEW_DATABASE.sql`** (copy full contents into SQL Editor, then Run).
2. Run **`supabase/migrations/001_rename_three_user_job_access_to_user_job_access.sql`** (creates or renames the `user_job_access` table and RLS helpers).

Your database is then fully configured.

---

## Alternative: Run Individual Migration Files

If you prefer to run migrations individually (for version control tracking), run them in this exact order:

### For NEW Database:
1. `20250101000000_create_jobs_and_applications.sql` - Creates main tables
2. `20250101000001_create_admin_column_definitions.sql` - Creates admin table

**DO NOT run:**
- `20250101000002_update_form_fields.sql` - This is only for migrating existing databases
- Any files with legacy org-specific prefixes - Prefer canonical table names (`jobs`, `applications`, `user_job_access`, `admin_column_definitions`).

---

## What Gets Created

### Tables:
- ✅ `jobs` - Job postings with Gandhi Fellowship fields (domain, organisation_name, position, etc.)
- ✅ `applications` - Job applications with Gandhi Fellowship fields (full_name, batch, gender, etc.)
- ✅ `user_job_access` - User roles and job assignments (admin/manager); created or renamed by `001_rename_three_user_job_access_to_user_job_access.sql`
- ✅ `admin_column_definitions` - Admin custom column definitions

### Storage Buckets:
- ✅ `job-pdfs` - Public bucket for job description PDFs
- ✅ `resumes` - Private bucket for candidate resumes

### Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies for public job viewing
- ✅ Policies for authenticated admin access
- ✅ Storage policies for file uploads

### Functions & Triggers:
- ✅ Auto-generate reference numbers for applications
- ✅ Auto-update `updated_at` timestamp for jobs

### Indexes:
- ✅ Performance indexes on frequently queried columns

---

## Verification

After running the setup, verify everything works:

1. **Check Tables:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
   Should show: `admin_column_definitions`, `applications`, `jobs`

2. **Check Storage Buckets:**
   - Go to Storage in Supabase dashboard
   - Should see `job-pdfs` and `resumes` buckets

3. **Test Application Creation:**
   - Try creating a job posting from the admin dashboard
   - Try submitting an application from the public job listing

---

## Troubleshooting

### Error: "relation already exists"
- This means tables already exist. If you're setting up a fresh database, drop existing tables first:
  ```sql
  DROP TABLE IF EXISTS public.applications CASCADE;
  DROP TABLE IF EXISTS public.jobs CASCADE;
  DROP TABLE IF EXISTS admin_column_definitions CASCADE;
  ```
  Then run the setup file again.

### Error: "permission denied"
- Make sure you're running the SQL as a database owner/admin
- Check that RLS policies are created correctly

### Storage buckets not created
- Storage buckets might need to be created manually in the Supabase dashboard
- Go to Storage → Create Bucket
- Create `job-pdfs` (public) and `resumes` (private)

---

## Next Steps

After database setup:

1. **Configure Environment Variables:**
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for API routes)

2. **Set up Admin User:**
   - Create an admin user in Supabase Auth
   - This user will be able to access the admin dashboard

3. **Test the Application:**
   - Deploy to Vercel or run locally
   - Test job posting and application submission

---

## Support

If you encounter any issues, check:
- Supabase logs in the dashboard
- Browser console for frontend errors
- Vercel function logs (if deployed)
