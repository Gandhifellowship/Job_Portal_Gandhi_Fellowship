/**
 * Application data queries and mutations
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * PostgREST returns at most `max_rows` (default 1000) per request.
 * Batch with .range() so the admin UI loads every row.
 */
export const APPLICATION_API_PAGE_SIZE = 1000;

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

const ADMIN_DASHBOARD_JOB_SELECT = `
  *,
  job:jobs(position, organisation_name, domain, location, apply_by, about, compensation_range, pdf_url)
`;

/**
 * Loads all applications for the admin dashboard, paging at APPLICATION_API_PAGE_SIZE
 * to bypass the PostgREST single-response row cap.
 */
export async function fetchAllApplicationsForAdminDashboard(
  isAdmin: boolean,
  isManager: boolean,
  assignedJobIds: string[]
): Promise<Application[]> {
  const all: Application[] = [];
  let from = 0;

  for (;;) {
    let q = supabase
      .from('applications')
      .select(ADMIN_DASHBOARD_JOB_SELECT)
      .order('applied_at', { ascending: false });

    if (isManager && !isAdmin && assignedJobIds.length > 0) {
      q = q.in('job_id', assignedJobIds);
    }

    const { data, error } = await q.range(from, from + APPLICATION_API_PAGE_SIZE - 1);

    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }

    const batch = (data ?? []) as Application[];
    all.push(...batch);

    if (batch.length < APPLICATION_API_PAGE_SIZE) {
      break;
    }
    from += APPLICATION_API_PAGE_SIZE;
  }

  return all;
}

export const applicationQueries = {
  /**
   * Get all applications with job details
   */
  async getAll(): Promise<Application[]> {
    const all: Application[] = [];
    let from = 0;

    for (;;) {
      const { data, error } = await supabase
        .from('applications')
        .select(`
        *,
        job:jobs(*)
      `)
        .order('applied_at', { ascending: false })
        .range(from, from + APPLICATION_API_PAGE_SIZE - 1);

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      const batch = (data ?? []) as Application[];
      all.push(...batch);

      if (batch.length < APPLICATION_API_PAGE_SIZE) {
        break;
      }
      from += APPLICATION_API_PAGE_SIZE;
    }

    return all;
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

