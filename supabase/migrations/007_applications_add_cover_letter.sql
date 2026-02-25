-- Add cover_letter to applications for applicant cover letter text
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS cover_letter TEXT;
