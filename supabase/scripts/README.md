# SQL Scripts Archive

This directory contains archived SQL scripts that were used during development and setup but are no longer needed in the main codebase.

## Archived Scripts

### RLS (Row Level Security) Setup Scripts
- `enable_rls.sql` - Initial RLS setup
- `fix_rls.sql` - First attempt to fix RLS issues
- `fix_rls_v2.sql` - Second attempt to fix RLS issues
- `admin_rls_policy.sql` - Admin-specific RLS policies

### Policy Fix Scripts
- `check_and_fix_policies.sql` - Script to check and fix policies
- `final_fix_policies.sql` - Final attempt to fix policies
- `final_fix_policies_v2.sql` - Updated final fix for policies

### Schema Changes
- `add_employee_referral_column.sql` - Adds employee referral column to applications table

### Test Files
- `test_rls.ts` - RLS security testing script
- `test_security.js` - Security testing script

## Current Status

These scripts have been superseded by the official Supabase migrations in `supabase/migrations/`. The current schema and policies are managed through the migration system.

## Note

Do not run these scripts directly. They are kept for reference only. Use the official Supabase CLI and migration system for any schema changes.
