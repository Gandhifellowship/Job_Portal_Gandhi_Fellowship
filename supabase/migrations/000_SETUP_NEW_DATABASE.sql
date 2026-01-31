-- =====================================================
-- COMPLETE DATABASE SETUP FOR NEW SUPABASE ACCOUNT
-- =====================================================
-- Run this file in your new Supabase SQL Editor
-- This file contains everything needed for a fresh setup
-- =====================================================

-- =====================================================
-- 1. CREATE JOBS TABLE
-- =====================================================
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  organisation_name TEXT NOT NULL,
  about TEXT,
  job_description TEXT,
  position TEXT NOT NULL,
  location TEXT NOT NULL,
  compensation_range TEXT,
  pdf_url TEXT,
  apply_by DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 2. CREATE APPLICATIONS TABLE
-- =====================================================
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  batch TEXT NOT NULL,
  gender TEXT NOT NULL,
  email_official TEXT NOT NULL,
  email_personal TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  big_bet TEXT,
  fellowship_state TEXT,
  home_state TEXT,
  fpc_name TEXT,
  state_spoc_name TEXT,
  resume_url TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected')),
  reference_number TEXT NOT NULL UNIQUE,
  archived BOOLEAN NOT NULL DEFAULT false
);

-- =====================================================
-- 3. CREATE ADMIN COLUMN DEFINITIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_column_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'dropdown')),
  options JSONB,
  width INTEGER,
  order_index INTEGER,
  show_in_form BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_admin_column_definitions_order ON admin_column_definitions(order_index);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_column_definitions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES FOR JOBS
-- =====================================================
CREATE POLICY "Anyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Authenticated users can manage jobs" 
ON public.jobs 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 6. CREATE RLS POLICIES FOR APPLICATIONS
-- =====================================================
CREATE POLICY "Anyone can create applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can view all applications" 
ON public.applications 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update applications" 
ON public.applications 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 7. CREATE RLS POLICIES FOR ADMIN COLUMN DEFINITIONS
-- =====================================================
CREATE POLICY "Authenticated users can manage column definitions" 
ON admin_column_definitions
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 8. CREATE STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
('job-pdfs', 'job-pdfs', true),
('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 9. CREATE STORAGE POLICIES FOR JOB PDFS (PUBLIC)
-- =====================================================
CREATE POLICY "Anyone can view job PDFs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'job-pdfs');

CREATE POLICY "Authenticated users can upload job PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'job-pdfs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update job PDFs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'job-pdfs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete job PDFs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'job-pdfs' AND auth.uid() IS NOT NULL);

-- =====================================================
-- 10. CREATE STORAGE POLICIES FOR RESUMES (PRIVATE)
-- =====================================================
CREATE POLICY "Authenticated users can view resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can upload resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

-- =====================================================
-- 11. CREATE DATABASE FUNCTIONS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate reference number
CREATE OR REPLACE FUNCTION public.generate_reference_number()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD((FLOOR(RANDOM() * 99999) + 1)::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to set reference number on insert
CREATE OR REPLACE FUNCTION public.set_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := public.generate_reference_number();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.applications WHERE reference_number = NEW.reference_number) LOOP
      NEW.reference_number := public.generate_reference_number();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 12. CREATE TRIGGERS
-- =====================================================

-- Trigger to auto-generate reference number for applications
CREATE TRIGGER set_reference_number_trigger
  BEFORE INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_reference_number();

-- Trigger to update updated_at for jobs
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 13. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_applications_archived ON public.applications(archived);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_reference_number ON public.applications(reference_number);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready to use with:
-- - Jobs table with Gandhi Fellowship fields
-- - Applications table with Gandhi Fellowship fields
-- - Admin column definitions table
-- - All necessary RLS policies
-- - Storage buckets and policies
-- - Database functions and triggers
-- - Performance indexes
-- =====================================================
