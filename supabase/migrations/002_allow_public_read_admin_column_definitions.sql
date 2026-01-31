-- Allow anyone to read admin_column_definitions so the public application form
-- can load form field config (name, batch, email, etc.) without being logged in.
CREATE POLICY "Anyone can read column definitions for application form"
ON public.admin_column_definitions
FOR SELECT
USING (true);
