import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/shared/hooks/use-toast';

export interface UserWithRole {
  user_id: string;
  role: string;
  job_id: string | null;
  employee_id: string | null;
  department: string | null;
  position: string | null;
  created_at: string;
  email?: string;
  name?: string;
  job_title?: string | null;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: string;
  employeeId: string;
  department: string;
  position: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user data directly from user_job_access table (now includes name and email)
      const { data: accessData, error: accessError } = await supabase
        .from('user_job_access')
        .select(`
          user_id, 
          name,
          email,
          role, 
          job_id, 
          employee_id, 
          department, 
          position, 
          created_at,
          job:jobs(position, organisation_name, domain)
        `)
        .order('created_at', { ascending: false });

      if (accessError) throw accessError;

      // Group users by user_id to handle multiple job assignments
      const userMap = new Map();
      
      accessData?.forEach(user => {
        const userId = user.user_id;
        
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            name: user.name || 'User ' + userId.substring(0, 8),
            email: user.email || userId.substring(0, 8) + '...',
            role: user.role,
            employee_id: user.employee_id,
            department: user.department,
            position: user.position,
            created_at: user.created_at,
            job_id: user.job_id,
            job_title: user.job?.position || null,
            job_titles: []
          });
        }
        
        // Add job title to the array if it exists
        if (user.job?.position) {
          const existingUser = userMap.get(userId);
          if (!existingUser.job_titles.includes(user.job.position)) {
            existingUser.job_titles.push(user.job.position);
          }
        }
      });

      // Convert map to array and update job_title to show all jobs
      const formattedUsers = Array.from(userMap.values()).map(user => ({
        ...user,
        job_title: user.job_titles.length > 0 ? user.job_titles.join(', ') : null
      }));

      setUsers(formattedUsers);
    } catch (error: Error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createUser = async (userData: CreateUserData) => {
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      const result = await response.json();
      
      toast({
        title: "Success",
        description: `User ${result.user.name} created successfully`,
      });
      
      // Refresh users list
      await fetchUsers();
    } catch (error: Error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_job_access')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      await fetchUsers();
    } catch (error: Error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const updateAuthUser = async (userId: string, updates: { name?: string; email?: string }) => {
    if (updates.name === undefined && updates.email === undefined) return;
    
    const authUpdates: { user_metadata?: { name: string }; email?: string } = {};
    if (updates.name !== undefined) authUpdates.user_metadata = { name: updates.name };
    if (updates.email !== undefined) authUpdates.email = updates.email;
    
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);
    if (authError) {
      console.warn('Could not update auth user:', authError);
      // Continue with database updates even if auth update fails
    }
  };

  const updateDatabaseUser = async (userId: string, updates: {
    name?: string;
    email?: string;
    role?: string;
    employee_id?: string;
    department?: string;
    position?: string;
    job_id?: string | null;
  }) => {
    const dbUpdates: {
      name?: string;
      email?: string;
      role?: string;
      employee_id?: string;
      department?: string;
      position?: string;
      job_id?: string | null;
    } = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.employee_id !== undefined) dbUpdates.employee_id = updates.employee_id;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.job_id !== undefined) dbUpdates.job_id = updates.job_id;

    console.log('Updating user with:', dbUpdates);

    // Only update user_job_access if there are changes
    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase
        .from('user_job_access')
        .update(dbUpdates)
        .eq('user_id', userId);

      if (error) throw error;
    }
  };

  const updateUser = async (userId: string, updates: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    employee_id?: string;
    department?: string;
    position?: string;
    job_id?: string | null;
  }) => {
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: updates.name,
          email: updates.email,
          password: updates.password,
          role: updates.role,
          employeeId: updates.employee_id,
          department: updates.department,
          position: updates.position
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    createUser,
    updateUserRole,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
}
