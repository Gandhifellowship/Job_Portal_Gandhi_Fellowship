/**
 * Job data queries and mutations
 */

import { supabase } from '@/integrations/supabase/client';

export interface Job {
  id: string;
  domain: string;
  organisation_name: string;
  about: string | null;
  job_description: string | null;
  position: string;
  location: string;
  compensation_range: string | null;
  pdf_url: string | null;
  apply_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const jobQueries = {
  /**
   * Get all jobs
   */
  async getAll(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get job by ID
   */
  async getById(id: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create new job
   */
  async create(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update job
   */
  async update(id: string, updates: Partial<Job>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      throw error;
    }

    return data;
  },

  /**
   * Delete job
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  /**
   * Get jobs by status
   */
  async getByStatus(status: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs by status:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Search jobs
   */
  async search(query: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .or(`position.ilike.%${query}%,domain.ilike.%${query}%,organisation_name.ilike.%${query}%,location.ilike.%${query}%,job_description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }

    return data || [];
  },
};

