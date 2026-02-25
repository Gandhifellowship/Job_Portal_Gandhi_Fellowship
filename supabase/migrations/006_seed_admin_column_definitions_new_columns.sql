-- Seed new grid columns (Cover Letter, Status, job fields) so they appear in Toggle Columns.
-- Safe to run: ON CONFLICT DO NOTHING so existing rows are unchanged.
INSERT INTO admin_column_definitions (id, name, type, options, order_index, show_in_form, is_custom, display_name, data_type)
VALUES
  ('cover_letter', 'Cover Letter', 'text', NULL, 15, false, false, 'Cover Letter', 'text'),
  ('status', 'Status', 'text', NULL, 16, false, false, 'Status', 'text'),
  ('job.organisation_name', 'Organisation', 'text', NULL, 17, false, false, 'Organisation', 'text'),
  ('job.domain', 'Domain', 'text', NULL, 18, false, false, 'Domain', 'text'),
  ('job.location', 'Location', 'text', NULL, 19, false, false, 'Location', 'text'),
  ('job.apply_by', 'Apply By', 'text', NULL, 20, false, false, 'Apply By', 'text'),
  ('job.about', 'About (role)', 'text', NULL, 21, false, false, 'About (role)', 'text'),
  ('job.compensation_range', 'Compensation Range', 'text', NULL, 22, false, false, 'Compensation Range', 'text'),
  ('job.pdf_url', 'Job PDF URL', 'text', NULL, 23, false, false, 'Job PDF URL', 'text')
ON CONFLICT (id) DO NOTHING;
