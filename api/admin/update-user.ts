import { createClient } from '@supabase/supabase-js';
import type { ApiRequest, ApiResponse } from '../types.js';

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpdateUserRequest {
  userId: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  employeeId?: string;
  department?: string;
  position?: string;
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
    const { userId, name, email, password, role, employeeId, department, position }: UpdateUserRequest = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate password if provided
    if (password !== undefined && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate email format if provided
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    console.log('Updating user:', { userId, name, email, role, employeeId, department, position, hasPassword: !!password });

    // Step 1: Update auth.users table
    // Get existing user to preserve metadata
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    const existingMetadata = existingUser?.user?.user_metadata || {};
    
    const authUpdates: { user_metadata?: any; email?: string; password?: string } = {};
    const metadataUpdates: any = { ...existingMetadata };
    
    if (name !== undefined) {
      metadataUpdates.name = name;
    }
    if (employeeId !== undefined) {
      metadataUpdates.employee_id = employeeId;
    }
    if (department !== undefined) {
      metadataUpdates.department = department;
    }
    if (position !== undefined) {
      metadataUpdates.position = position;
    }
    
    if (name !== undefined || employeeId !== undefined || department !== undefined || position !== undefined) {
      authUpdates.user_metadata = metadataUpdates;
    }
    if (email !== undefined) {
      authUpdates.email = email;
    }
    if (password !== undefined && password.length > 0) {
      authUpdates.password = password;
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates);
      
      if (authError) {
        console.error('Error updating auth user:', authError);
        return res.status(500).json({ error: 'Failed to update user in auth', details: authError.message });
      }
    }

    // Step 2: Update user_job_access table
    const dbUpdates: {
      name?: string;
      email?: string;
      role?: string;
      employee_id?: string;
      department?: string;
      position?: string;
    } = {};
    
    if (name !== undefined) dbUpdates.name = name;
    if (email !== undefined) dbUpdates.email = email;
    if (role !== undefined) dbUpdates.role = role;
    if (employeeId !== undefined) dbUpdates.employee_id = employeeId;
    if (department !== undefined) dbUpdates.department = department;
    if (position !== undefined) dbUpdates.position = position;

    if (Object.keys(dbUpdates).length > 0) {
      const { error: dbError } = await supabaseAdmin
        .from('user_job_access')
        .update(dbUpdates)
        .eq('user_id', userId);

      if (dbError) {
        console.error('Error updating access table:', dbError);
        return res.status(500).json({ error: 'Failed to update user in access table', details: dbError.message });
      }
    }

    console.log('User updated successfully:', userId);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

