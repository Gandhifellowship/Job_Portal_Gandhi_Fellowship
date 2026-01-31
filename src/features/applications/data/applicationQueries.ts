/**
 * Application data queries and mutations
 */

import { supabase } from '@/integrations/supabase/client';

export interface Application {
  id: string;
  full_name: string;
  batch: string;
  gender: string;
  email_official: string;
  email_personal: string;
  phone_number: string;
  big_bet?: string;
  fellowship_state?: string;
  home_state?: string;
  fpc_name?: string;
  state_spoc_name?: string;
  resume_url: string | null;
  reference_number?: string;
  applied_at: string;
  status: string;
  job: {
    id: string;
    position: string;
    organisation_name: string;
    domain: string;
    location: string;
  };
  custom_admin_fields?: {
    values: Record<string, string>;
  };
}

export const applicationQueries = {
  /**
   * Get all applications with job details
   */
  async getAll(): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*)
      `)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get application by ID
   */
  async getById(id: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching application:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create new application
   */
  async create(applicationData: Omit<Application, 'id' | 'applied_at' | 'reference_number'>): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select(`
        *,
        job:jobs(*)
      `)
      .single();

    if (error) {
      console.error('Error creating application:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update application
   */
  async update(id: string, updates: Partial<Application>): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        job:jobs(*)
      `)
      .single();

    if (error) {
      console.error('Error updating application:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update application cell value
   */
  async updateCell(id: string, field: string, value: string): Promise<void> {
    if (field.startsWith('custom_')) {
      // Handle custom admin fields
      const { error } = await supabase
        .from('applications')
        .update({
          custom_admin_fields: {
            values: {
              [field]: value
            }
          }
        })
        .eq('id', id);
      
      if (error) throw error;
    } else {
      // Handle regular fields
      const { error } = await supabase
        .from('applications')
        .update({ [field]: value })
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  /**
   * Delete application
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },
};

