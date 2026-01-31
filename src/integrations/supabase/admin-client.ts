import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase configuration - set these via environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
// Try both environment variable names for compatibility
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

// Admin client with service role key for dashboard operations
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);
