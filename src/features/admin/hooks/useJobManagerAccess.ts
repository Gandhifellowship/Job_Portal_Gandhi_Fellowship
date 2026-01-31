import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/shared/hooks/use-toast';

export interface JobManagerAccess {
  user_id: string;
  job_id: string;
  job_title: string;
  role: string;
  employee_id: string | null;
  department: string | null;
  position: string | null;
}

export function useJobManagerAccess() {
  const [jobManagerAccess, setJobManagerAccess] = useState<JobManagerAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobManagerAccess = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_job_access')
        .select(`
          user_id,
          job_id,
          role,
          employee_id,
          department,
          position,
          job:jobs(position, organisation_name, domain)
        `)
        .not('job_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        user_id: item.user_id,
        job_id: item.job_id,
        job_title: item.job?.position || 'Unknown Job',
        role: item.role,
        employee_id: item.employee_id,
        department: item.department,
        position: item.position,
      })) || [];

      setJobManagerAccess(formattedData);
    } catch (error: Error) {
      console.error('Error fetching job manager access:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job manager access",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const assignManagerToJob = async (userId: string, jobId: string) => {
    try {
      const { error } = await supabase
        .from('user_job_access')
        .insert({
          user_id: userId,
          job_id: jobId,
          role: 'manager',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Manager assigned to job successfully",
      });

      await fetchJobManagerAccess();
    } catch (error: Error) {
      console.error('Error assigning manager to job:', error);
      toast({
        title: "Error",
        description: "Failed to assign manager to job",
        variant: "destructive",
      });
    }
  };

  const removeManagerFromJob = async (userId: string, jobId: string) => {
    try {
      const { error } = await supabase
        .from('user_job_access')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Manager removed from job successfully",
      });

      await fetchJobManagerAccess();
    } catch (error: Error) {
      console.error('Error removing manager from job:', error);
      toast({
        title: "Error",
        description: "Failed to remove manager from job",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchJobManagerAccess();
  }, [fetchJobManagerAccess]);

  return {
    jobManagerAccess,
    loading,
    assignManagerToJob,
    removeManagerFromJob,
    refetch: fetchJobManagerAccess,
  };
}
