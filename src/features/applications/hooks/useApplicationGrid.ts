/**
 * Custom hook for Application Grid functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// AG Grid column state types
interface ColumnStateItem {
  colId: string;
  hide?: boolean;
  width?: number;
  pinned?: string;
  sort?: string;
  sortIndex?: number;
}

interface GridEvent {
  api: {
    getColumnState: () => ColumnStateItem[];
  };
}


interface AdminColumn {
  id: string;
  name: string;
  display_name?: string;
  type: 'text' | 'dropdown';
  options?: Array<{ value: string; color: string; }>;
  width?: number;
  order?: number;
  is_custom?: boolean;
  show_in_form?: boolean;
  order_index?: number;
}

const defaultAdminColumns: AdminColumn[] = [
  { id: 'full_name', name: 'Full Name', type: 'text', order_index: 1 },
  { id: 'batch', name: 'Batch', type: 'text', order_index: 2 },
  { id: 'gender', name: 'Gender', type: 'dropdown', order_index: 3, options: [{ value: 'Male', color: '' }, { value: 'Female', color: '' }, { value: 'Other', color: '' }, { value: 'Prefer not to say', color: '' }] },
  { id: 'email_official', name: 'Email Address Official', type: 'text', order_index: 4 },
  { id: 'email_personal', name: 'Email Address Personal', type: 'text', order_index: 5 },
  { id: 'phone_number', name: 'Phone Number', type: 'text', order_index: 6 },
  { id: 'big_bet', name: 'Big Bet', type: 'text', order_index: 7 },
  { id: 'fellowship_state', name: 'Fellowship State', type: 'text', order_index: 8 },
  { id: 'home_state', name: 'Home State', type: 'text', order_index: 9 },
  { id: 'fpc_name', name: 'FPC Name', type: 'text', order_index: 10 },
  { id: 'state_spoc_name', name: 'State SPOC name', type: 'text', order_index: 11 },
  { id: 'reference_number', name: 'Reference Number', type: 'text', order_index: 12 },
  { id: 'cover_letter', name: 'Cover Letter', type: 'text', order_index: 13 },
  { id: 'resume_url', name: 'Resume', type: 'text', order_index: 14 },
  { id: 'applied_at', name: 'Applied At', type: 'text', order_index: 15 },
  { id: 'status', name: 'Status', type: 'text', order_index: 16 },
  { id: 'job.organisation_name', name: 'Organisation', type: 'text', order_index: 17 },
  { id: 'job.domain', name: 'Domain', type: 'text', order_index: 18 },
  { id: 'job.location', name: 'Location', type: 'text', order_index: 19 },
  { id: 'job.apply_by', name: 'Apply By', type: 'text', order_index: 20 },
  { id: 'job.about', name: 'About (role)', type: 'text', order_index: 21 },
  { id: 'job.compensation_range', name: 'Compensation Range', type: 'text', order_index: 22 },
  { id: 'job.pdf_url', name: 'Job PDF URL', type: 'text', order_index: 23 },
];

export const useApplicationGrid = () => {
  const [adminColumns, setAdminColumns] = useState<AdminColumn[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize hiddenColumns from localStorage
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    try {
      const savedState = localStorage.getItem('columnState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        const hidden = parsedState
          .filter((col: ColumnStateItem) => col.hide)
          .map((col: ColumnStateItem) => col.colId);
        return new Set(hidden);
      }
    } catch (error) {
      console.warn('Failed to load hidden columns from localStorage:', error);
    }
    return new Set();
  });

  // Fetch columns from Supabase
  const fetchColumns = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_column_definitions')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map(col => ({
        id: col.id,
        name: col.display_name || col.name,
        display_name: col.display_name,
        type: col.data_type || col.type,
        options: col.options,
        width: col.width,
        order: col.order_index,
        is_custom: col.is_custom,
        show_in_form: col.show_in_form,
        order_index: col.order_index
      }));
      setAdminColumns(mapped.length > 0 ? mapped : defaultAdminColumns);
    } catch (error) {
      console.error('Failed to fetch columns:', error);
      setAdminColumns(defaultAdminColumns);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load columns on mount
  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  // Persist hiddenColumns to localStorage whenever it changes
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('columnState');
      const currentState = savedState ? JSON.parse(savedState) : [];
      
      // Update hide property for all columns
      const updatedState = currentState.map((col: ColumnStateItem) => ({
        ...col,
        hide: hiddenColumns.has(col.colId)
      }));
      
      localStorage.setItem('columnState', JSON.stringify(updatedState));
    } catch (error) {
      console.warn('Failed to persist hidden columns:', error);
    }
  }, [hiddenColumns]);

  const handleCellEdit = useCallback(async (
    applicationId: string, 
    field: string, 
    newValue: string,
    existingCustomFields?: { values: Record<string, string> }
  ) => {
    try {
      // Check if this is a custom field by looking at the column definition
      const column = adminColumns.find(col => col.id === field);
      
      console.log('handleCellEdit called:', { 
        applicationId, 
        field, 
        newValue, 
        column,
        is_custom: column?.is_custom,
        existingCustomFields 
      });
      
      if (column?.is_custom) {
        // Handle custom admin fields - MERGE with existing values
        const currentValues = existingCustomFields?.values || {};
        const updatedFields = {
          values: {
            ...currentValues,
            [field]: newValue
          }
        };
        
        console.log('Updating custom field:', updatedFields);
        
        const { error } = await supabase
          .from('applications')
          .update({
            custom_admin_fields: updatedFields
          })
          .eq('id', applicationId);
        
        if (error) {
          console.error('Custom field update error:', error);
          throw error;
        }
        
        console.log('Custom field updated successfully');
      } else {
        // Handle regular fields
        console.log('Updating regular field:', field, newValue);
        
        const { error } = await supabase
          .from('applications')
          .update({ [field]: newValue })
          .eq('id', applicationId);
        
        if (error) {
          console.error('Regular field update error:', error);
          throw error;
        }
        
        console.log('Regular field updated successfully');
      }
    } catch (error) {
      console.error('Failed to update application:', error);
      throw error;
    }
  }, [adminColumns]);

  const handleAddColumn = useCallback(async (column: { 
    name: string; 
    type: 'text' | 'dropdown'; 
    options?: Array<{ value: string; color: string; }> 
  }) => {
    try {
      const newColumnId = `custom_${Date.now()}`;
      const nextOrder = Math.max(0, ...adminColumns.map(col => col.order || 0)) + 1;

      const { error } = await supabase
        .from('admin_column_definitions')
        .insert({
          id: newColumnId,
          name: column.name,
          type: column.type,
          display_name: column.name,
          data_type: column.type,
          options: column.options,
          width: 150, // Default width
          order_index: nextOrder,
          is_custom: true,
          show_in_form: false
        });

      if (error) throw error;

      // Clear only column order from localStorage, preserve width/visibility
      const savedState = localStorage.getItem('columnState');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          // Remove order-related properties, keep width/visibility
          const filteredState = parsedState.map((col: ColumnStateItem) => ({
            colId: col.colId,
            width: col.width,
            hide: col.hide,
            pinned: col.pinned,
            sort: col.sort,
            sortIndex: col.sortIndex
            // Remove: colIndex (order)
          }));
          localStorage.setItem('columnState', JSON.stringify(filteredState));
        } catch (error) {
          console.warn('Failed to filter column state:', error);
        }
      }

      // Refresh columns from database
      await fetchColumns();
    } catch (error) {
      console.error('Failed to add column:', error);
      throw error;
    }
  }, [adminColumns, fetchColumns]);

  const handleEditColumn = useCallback(async (columnId: string, updates: { 
    name: string; 
    type: 'text' | 'dropdown'; 
    options?: Array<{ value: string; color: string; }> 
  }) => {
    try {
      // Get current column to preserve its order
      const currentColumn = adminColumns.find(col => col.id === columnId);
      
      const { error } = await supabase
        .from('admin_column_definitions')
        .update({
          name: updates.name,
          type: updates.type,
          display_name: updates.name,
          data_type: updates.type,
          options: updates.options,
          order_index: currentColumn?.order_index,
          width: currentColumn?.width
        })
        .eq('id', columnId);

      if (error) throw error;

      // Refresh columns from database
      await fetchColumns();
    } catch (error) {
      console.error('Failed to edit column:', error);
      throw error;
    }
  }, [fetchColumns, adminColumns]);

  const handleDeleteColumn = useCallback(async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('admin_column_definitions')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      // Clear only column order from localStorage, preserve width/visibility
      const savedState = localStorage.getItem('columnState');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          // Remove order-related properties, keep width/visibility
          const filteredState = parsedState.map((col: ColumnStateItem) => ({
            colId: col.colId,
            width: col.width,
            hide: col.hide,
            pinned: col.pinned,
            sort: col.sort,
            sortIndex: col.sortIndex
            // Remove: colIndex (order)
          }));
          localStorage.setItem('columnState', JSON.stringify(filteredState));
        } catch (error) {
          console.warn('Failed to filter column state:', error);
        }
      }

      // Refresh columns from database
      await fetchColumns();
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  }, [fetchColumns]);

  const updateColumnOrder = useCallback(async (columnId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('admin_column_definitions')
        .update({ order_index: newOrder })
        .eq('id', columnId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to update column order:', error);
    }
  }, []);

  const toggleColumnVisibility = useCallback(async (columnId: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      const isCurrentlyHidden = newSet.has(columnId);
      
      if (isCurrentlyHidden) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      
      // Update the order_index in Supabase to maintain proper order
      const column = adminColumns.find(col => col.id === columnId);
      if (column && !isCurrentlyHidden) {
        // When hiding, move to end of order
        const maxOrder = Math.max(...adminColumns.map(col => col.order_index || 0));
        updateColumnOrder(columnId, maxOrder + 1);
      } else if (column && isCurrentlyHidden) {
        // When showing, restore original order
        const originalOrder = adminColumns
          .filter(col => !newSet.has(col.id))
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        
        // Find the correct position to insert
        const insertIndex = originalOrder.findIndex(col => (col.order_index || 0) > (column.order_index || 0));
        const newOrder = insertIndex === -1 ? originalOrder.length : insertIndex;
        updateColumnOrder(columnId, newOrder);
      }
      
      return newSet;
    });
  }, [adminColumns, updateColumnOrder]);

  const showAllColumns = useCallback(async () => {
    setHiddenColumns(new Set());
    
    // Restore original order for all columns
    const sortedColumns = adminColumns
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    
    // Update order_index in Supabase to match the original order
    for (let i = 0; i < sortedColumns.length; i++) {
      const column = sortedColumns[i];
      if (column.order_index !== i + 1) {
        await updateColumnOrder(column.id, i + 1);
      }
    }
  }, [adminColumns, updateColumnOrder]);

  // Function to restore column order based on order_index
  const restoreColumnOrder = useCallback((columnState: ColumnStateItem[]) => {
    if (!columnState || columnState.length === 0) return columnState;
    
    // Get the original order from adminColumns
    const originalOrder = adminColumns
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      .map(col => col.id);
    
    // Create a map of column states by colId
    const stateMap = new Map(columnState.map(col => [col.colId, col]));
    
    // Reorder based on original order, preserving state
    const reorderedState = originalOrder
      .filter(colId => stateMap.has(colId))
      .map(colId => stateMap.get(colId));
    
    return reorderedState;
  }, [adminColumns]);

  const getColumnState = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('columnState') || '[]');
    } catch {
      return [];
    }
  }, []);

  const saveColumnState = useCallback(async (event: GridEvent) => {
    try {
      // Use the grid API instead of deprecated columnApi
      const gridApi = event.api;
      if (!gridApi) return;
      
      const columnState = gridApi.getColumnState();
      
      // Save widths and order to Supabase for each column
      const updates = columnState.map((col: ColumnStateItem, index: number) => ({
        id: col.colId,
        width: col.width || 150,
        order_index: index
      }));

      console.log('Saving column state to Supabase:', updates);

      // Update each column in database (batch update)
      for (const update of updates) {
        const { error } = await supabase
          .from('admin_column_definitions')
          .update({ 
            width: update.width,
            order_index: update.order_index 
          })
          .eq('id', update.id);
        
        if (error) {
          console.error(`Failed to update column ${update.id}:`, error);
        }
      }

      // Still save to localStorage for immediate UI responsiveness (hide state only)
      const cleanState = columnState.map((col: ColumnStateItem) => ({
        colId: col.colId,
        hide: col.hide,
      }));
      localStorage.setItem('columnState', JSON.stringify(cleanState));
    } catch (error) {
      console.warn('Failed to save column state:', error);
    }
  }, []);

  return {
    adminColumns,
    hiddenColumns,
    loading,
    handleCellEdit,
    handleAddColumn,
    handleEditColumn,
    handleDeleteColumn,
    toggleColumnVisibility,
    showAllColumns,
    getColumnState,
    saveColumnState,
    fetchColumns,
  };
};
