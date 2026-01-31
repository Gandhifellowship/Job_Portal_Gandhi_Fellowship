import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export interface UserRole {
  isAdmin: boolean;
  isManager: boolean;
  role: string | null;
  assignedJobs: string[];
  loading: boolean;
}

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>({
    isAdmin: false,
    isManager: false,
    role: null,
    assignedJobs: [],
    loading: true
  });
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole({
          isAdmin: false,
          isManager: false,
          role: null,
          assignedJobs: [],
          loading: false
        });
        return;
      }

      try {
        // Get user's role and job assignments
        const { data, error } = await supabase
          .from('user_job_access')
          .select('role, job_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole({
            isAdmin: false,
            isManager: false,
            role: null,
            assignedJobs: [],
            loading: false
          });
          return;
        }

        // Check if user is admin (has admin role with no job_id)
        const adminRecord = data?.find(record => record.role === 'admin' && record.job_id === null);
        const isAdmin = !!adminRecord;

        // Get assigned jobs (non-null job_ids)
        const assignedJobs = data?.filter(record => record.job_id !== null).map(record => record.job_id) || [];
        const isManager = assignedJobs.length > 0;

        // Get the primary role
        const primaryRole = adminRecord?.role || data?.[0]?.role || null;

        setUserRole({
          isAdmin,
          isManager,
          role: primaryRole,
          assignedJobs,
          loading: false
        });

      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setUserRole({
          isAdmin: false,
          isManager: false,
          role: null,
          assignedJobs: [],
          loading: false
        });
      }
    };

    fetchUserRole();
  }, [user]);

  return userRole;
}
