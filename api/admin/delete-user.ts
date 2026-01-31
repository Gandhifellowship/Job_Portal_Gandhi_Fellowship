import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DeleteUserRequest {
  userId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId }: DeleteUserRequest = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Deleting user:', userId);

    // Step 1: Delete from user_job_access table first (explicit deletion for safety)
    const { error: accessError } = await supabaseAdmin
      .from('user_job_access')
      .delete()
      .eq('user_id', userId);

    if (accessError) {
      console.error('Error deleting from access table:', accessError);
      return res.status(500).json({ error: 'Failed to delete user from access table' });
    }

    // Step 2: Delete from auth.users table
    // Note: ON DELETE CASCADE would handle this automatically, but we delete explicitly above for safety
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting from auth:', authError);
      return res.status(500).json({ error: 'Failed to delete user from auth' });
    }

    console.log('User deleted successfully:', userId);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

