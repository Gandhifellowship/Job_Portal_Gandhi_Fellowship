-- Make resumes bucket public so stored resume links (getPublicUrl) work when opened.
-- The API stores public URLs; they only work when the bucket is public.
UPDATE storage.buckets SET public = true WHERE id = 'resumes';
