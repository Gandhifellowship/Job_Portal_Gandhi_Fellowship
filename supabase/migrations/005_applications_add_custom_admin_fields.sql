-- Add column to store custom admin column values (text/dropdown from admin grid)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS custom_admin_fields JSONB DEFAULT '{"values":{}}'::jsonb;
