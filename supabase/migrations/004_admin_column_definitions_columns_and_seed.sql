-- Option 1: add columns for custom column add/edit
ALTER TABLE admin_column_definitions
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS data_type TEXT;

-- Option 3: seed default form + grid columns
INSERT INTO admin_column_definitions (id, name, type, options, order_index, show_in_form, is_custom)
VALUES
  ('full_name', 'Full Name', 'text', NULL, 1, true, false),
  ('batch', 'Batch', 'text', NULL, 2, true, false),
  ('gender', 'Gender', 'dropdown', '[{"value":"Male","color":""},{"value":"Female","color":""},{"value":"Other","color":""},{"value":"Prefer not to say","color":""}]'::jsonb, 3, true, false),
  ('email_official', 'Email Address Official', 'text', NULL, 4, true, false),
  ('email_personal', 'Email Address Personal', 'text', NULL, 5, true, false),
  ('phone_number', 'Phone Number', 'text', NULL, 6, true, false),
  ('big_bet', 'Big Bet', 'text', NULL, 7, true, false),
  ('fellowship_state', 'Fellowship State', 'text', NULL, 8, true, false),
  ('home_state', 'Home State', 'text', NULL, 9, true, false),
  ('fpc_name', 'FPC Name', 'text', NULL, 10, true, false),
  ('state_spoc_name', 'State SPOC name', 'text', NULL, 11, true, false),
  ('reference_number', 'Reference Number', 'text', NULL, 12, false, false),
  ('resume_url', 'Resume', 'text', NULL, 13, false, false),
  ('applied_at', 'Applied At', 'text', NULL, 14, false, false)
ON CONFLICT (id) DO NOTHING;
