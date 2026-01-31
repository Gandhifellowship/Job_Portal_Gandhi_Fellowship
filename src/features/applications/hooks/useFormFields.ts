/**
 * Hook to fetch form fields from database
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'dropdown';
  options?: Array<{ value: string; color: string; }>;
  order_index: number;
  is_custom?: boolean;
  show_in_form?: boolean;
}

export const useFormFields = () => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_column_definitions')
          .select('*')
          .eq('show_in_form', true)
          .order('order_index', { ascending: true });

        if (error) throw error;

        setFormFields(data || []);
      } catch (error) {
        console.error('Failed to fetch form fields:', error);
        // Fallback to hardcoded fields if database fails - Gandhi Fellowship fields
        setFormFields([
          { id: 'full_name', name: 'Full Name', type: 'text', order_index: 1, is_custom: false, show_in_form: true },
          { id: 'batch', name: 'Batch', type: 'text', order_index: 2, is_custom: false, show_in_form: true },
          { id: 'gender', name: 'Gender', type: 'dropdown', order_index: 3, is_custom: false, show_in_form: true, options: [
            { value: 'Male', color: '' },
            { value: 'Female', color: '' },
            { value: 'Other', color: '' },
            { value: 'Prefer not to say', color: '' }
          ]},
          { id: 'email_official', name: 'Email Address Official', type: 'text', order_index: 4, is_custom: false, show_in_form: true },
          { id: 'email_personal', name: 'Email Address Personal', type: 'text', order_index: 5, is_custom: false, show_in_form: true },
          { id: 'phone_number', name: 'Phone Number', type: 'text', order_index: 6, is_custom: false, show_in_form: true },
          { id: 'big_bet', name: 'Big Bet', type: 'text', order_index: 7, is_custom: false, show_in_form: true },
          { id: 'fellowship_state', name: 'Fellowship State', type: 'text', order_index: 8, is_custom: false, show_in_form: true },
          { id: 'home_state', name: 'Home State', type: 'text', order_index: 9, is_custom: false, show_in_form: true },
          { id: 'fpc_name', name: 'FPC Name', type: 'text', order_index: 10, is_custom: false, show_in_form: true },
          { id: 'state_spoc_name', name: 'State SPOC name', type: 'text', order_index: 11, is_custom: false, show_in_form: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFormFields();
  }, []);

  return { formFields, loading };
};
