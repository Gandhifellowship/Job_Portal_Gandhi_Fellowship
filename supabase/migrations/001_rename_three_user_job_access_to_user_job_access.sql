-- =====================================================
-- Remove "three_" prefix: user job access table
-- =====================================================
-- For existing DBs: renames three_user_job_access -> user_job_access.
-- For fresh DBs: creates user_job_access if it does not exist.
-- Run after 000_SETUP_NEW_DATABASE.sql.
-- =====================================================

-- If old table exists, rename to canonical name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'three_user_job_access'
  ) THEN
    ALTER TABLE public.three_user_job_access RENAME TO user_job_access;
  END IF;
END $$;

-- If neither old nor new table exists (fresh install), create user_job_access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_job_access'
  ) THEN
    CREATE TABLE public.user_job_access (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
      employee_id TEXT,
      department TEXT,
      position TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, job_id)
    );
    CREATE INDEX IF NOT EXISTS idx_user_job_access_user_id ON public.user_job_access(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_job_access_job_id ON public.user_job_access(job_id);
    CREATE INDEX IF NOT EXISTS idx_user_job_access_role ON public.user_job_access(role);
    ALTER TABLE public.user_job_access ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- SECURITY DEFINER helpers (reference user_job_access)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_job_access
    WHERE user_job_access.user_id = $1
    AND role = 'admin'
    AND job_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_manager_for_job(user_id UUID, job_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_job_access
    WHERE user_job_access.user_id = $1
    AND user_job_access.job_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS policies on user_job_access (idempotent)
DROP POLICY IF EXISTS "users_read_own_records" ON public.user_job_access;
DROP POLICY IF EXISTS "admin_manage_all_records" ON public.user_job_access;
CREATE POLICY "users_read_own_records"
  ON public.user_job_access FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "admin_manage_all_records"
  ON public.user_job_access FOR ALL
  USING (public.is_admin(auth.uid()));
