import { createClient } from '@supabase/supabase-js';
import type { ApiRequest, ApiResponse } from '../types.js';

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  employeeId: string;
  department: string;
  position: string;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
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
    const { email, password, name, role, employeeId, department, position }: CreateUserRequest = req.body;

    // Validate required fields
    if (!email || !password || !name || !role || !employeeId || !department || !position) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, password, name, role, employeeId, department, position' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    console.log('Creating user:', { email, name, role, employeeId, department, position });

    let authUser;
    let authError;

    // First, try to create user in auth.users using Supabase Admin API
    const createResult = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        employee_id: employeeId,
        department,
        position
      }
    });

    authUser = createResult.data;
    authError = createResult.error;

    // If user already exists, try to get the existing user
    if (authError && authError.message.includes('already registered')) {
      console.log('User already exists in auth, attempting to get existing user');
      
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const existingUser = listError ? null : listData?.users?.find((u) => u.email === email);
      
      if (!existingUser) {
        console.error('Error getting existing user:', listError);
        return res.status(400).json({ error: 'User exists but could not be retrieved' });
      }
      
      authUser = { user: existingUser };
      authError = null;
      console.log('Using existing auth user:', existingUser.id);
    } else if (authError) {
      console.error('Auth user creation error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    if (!authUser?.user) {
      return res.status(500).json({ error: 'Failed to create or retrieve user' });
    }

    console.log('Auth user ready:', authUser.user.id);

    // Check if user already exists in user_job_access table
    const { data: existingAccess, error: checkError } = await supabaseAdmin
      .from('user_job_access')
      .select('user_id')
      .eq('user_id', authUser.user.id)
      .single();

    let accessRecord;
    let accessError;

    if (existingAccess) {
      // User already exists in access table, update the record
      console.log('User already exists in access table, updating record');
      const updateResult = await supabaseAdmin
        .from('user_job_access')
        .update({
          name,
          email,
          role,
          employee_id: employeeId,
          department,
          position
        })
        .eq('user_id', authUser.user.id)
        .select()
        .single();
      
      accessRecord = updateResult.data;
      accessError = updateResult.error;
    } else {
      // Insert new user record into user_job_access table
      console.log('Creating new access record');
      const insertResult = await supabaseAdmin
        .from('user_job_access')
        .insert({
          user_id: authUser.user.id,
          name,
          email,
          role,
          job_id: null, // No job assignment initially
          employee_id: employeeId,
          department,
          position,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      accessRecord = insertResult.data;
      accessError = insertResult.error;
    }

    if (accessError) {
      console.error('Access record creation/update error:', accessError);
      // Only clean up auth user if we created it (not if it already existed)
      if (!authError) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      }
      return res.status(500).json({ error: 'Failed to create/update user access record' });
    }

    console.log('Access record processed:', accessRecord);

    return res.status(201).json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        name,
        role,
        employeeId,
        department,
        position
      },
      message: existingAccess ? 'User access restored successfully' : 'User created successfully'
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Create user error:', error);
    return res.status(500).json({ error: message });
  }
}
