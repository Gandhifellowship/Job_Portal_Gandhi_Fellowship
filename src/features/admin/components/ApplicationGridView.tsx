import { useState, useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent, ModuleRegistry, AllCommunityModule, CellValueChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Application data interface for AG Grid
interface ApplicationData {
  job?: { title: string };
  candidate_name?: string;
  custom_admin_fields?: { values: Record<string, string> };
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, PenSquare, Trash2, Eye, Columns, Filter, Search, Archive } from 'lucide-react';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from './ConfirmDialog';
import { exportToExcel, generateFilename } from '@/shared/lib/export';
import { formatDate } from '@/shared/lib/date';
import { AddCustomColumnDialog } from './AddCustomColumnDialog';
import { TextCellRenderer, DropdownCellRenderer, ResumeCellRenderer, SimpleTextRenderer, SimpleDropdownRenderer } from '@/features/applications/components/ApplicationCellRenderers';
import { useApplicationGrid } from '@/features/applications/hooks/useApplicationGrid';

interface AdminColumn {
  id: string;
  name: string;
  type: 'text' | 'dropdown';
  options?: Array<{ value: string; color: string; }>;
  width?: number;
  order?: number;
  is_custom?: boolean;
  show_in_form?: boolean;
  order_index?: number;
}

interface Application {
  id: string;
  candidate_name: string;
  email: string;
  phone: string;
  current_ctc?: string;
  expected_ctc?: string;
  location_comfort?: string;
  reason_for_change?: string;
  notice_period?: string;
  work_preference?: string;
  employee_referral_code?: string;
  cover_letter: string;
  resume_url?: string;
  applied_at: string;
  reference_number: string;
  job: {
    title: string;
    department: string;
  };
  custom_admin_fields?: {
    values: Record<string, string>;
  };
}

interface ApplicationGridViewProps {
  applications: Application[];
  onDeleteApplication?: (applicationId: string) => void;
  onArchiveApplication?: (applicationId: string) => void;
}

export function ApplicationGridView({ applications: initialApplications, onDeleteApplication, onArchiveApplication }: ApplicationGridViewProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<AdminColumn | null>(null);
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);
  
  // Filter state for multi-select filters
  const [externalFilters, setExternalFilters] = useState({
    positions: [] as string[],
    applicantName: '',
    searchByFields: '', // Batch, Phone, Fellowship State, Home State, Big Bet
    gender: [] as string[],
    customFields: {} as Record<string, string[]> // Dynamic custom field filters
  });

  // Update local state when props change
  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const {
    adminColumns,
    hiddenColumns,
    handleCellEdit,
    handleAddColumn,
    handleEditColumn,
    handleDeleteColumn,
    toggleColumnVisibility,
    showAllColumns,
    saveColumnState,
  } = useApplicationGrid();

  // Auto-generate filters for new dropdown columns
  useEffect(() => {
    if (adminColumns.length > 0) {
      setExternalFilters(prev => {
        const newCustomFields = { ...prev.customFields };
        let hasNewFields = false;

        // Check for new dropdown columns that need filters
        adminColumns
          .filter(col => col.type === 'dropdown' && col.is_custom)
          .forEach(col => {
            if (!newCustomFields[col.id]) {
              newCustomFields[col.id] = [];
              hasNewFields = true;
            }
          });

        // Remove filters for deleted columns
        const existingCustomFieldIds = Object.keys(newCustomFields);
        const currentDropdownColumnIds = adminColumns
          .filter(col => col.type === 'dropdown' && col.is_custom)
          .map(col => col.id);
        
        existingCustomFieldIds.forEach(fieldId => {
          if (!currentDropdownColumnIds.includes(fieldId)) {
            delete newCustomFields[fieldId];
            hasNewFields = true;
          }
        });

        if (hasNewFields) {
          return {
            ...prev,
            customFields: newCustomFields
          };
        }
        
        return prev;
      });
    }
  }, [adminColumns]);


  const downloadAsExcel = () => {
    if (!gridApi) return;
    
    const excelData = applications.map(app => {
      const data: Record<string, string> = {};
      const appAny = app as Record<string, unknown>;
      const job = appAny?.job as Record<string, unknown> | undefined;

      adminColumns.forEach(col => {
        if (col.id === 'applied_at') {
          data[col.name] = formatDate(app.applied_at);
        } else if (col.id.startsWith('job.')) {
          const key = col.id.slice(4);
          const v = job?.[key];
          data[col.name] = key === 'apply_by' && v && typeof v === 'string' ? v.split('T')[0] : String(v ?? '');
        } else if (col.is_custom) {
          data[col.name] = app.custom_admin_fields?.values?.[col.id] ?? '';
        } else {
          data[col.name] = String(appAny[col.id] ?? '');
        }
      });

      return data;
    });

    const filename = generateFilename('applications');
    exportToExcel(excelData, filename, 'Applications');
  };






  // Restore full column state from localStorage
  const restoreColumnState = useCallback(() => {
    if (!gridApi) return;
    
    const savedState = localStorage.getItem('columnState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log('Before restore:', gridApi.getColumnState());
        gridApi.applyColumnState({
          state: parsedState,
          applyOrder: false  // Don't apply order from localStorage, use database order
        });
        console.log('After restore:', gridApi.getColumnState());
      } catch (error) {
        console.error('Failed to restore column state:', error);
      }
    }
  }, [gridApi]);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  // Note: onCellValueChanged not used for custom columns - they use valueSetter instead
  const onCellValueChanged = async (event: CellValueChangedEvent) => {
    const { data, colDef } = event;
    const columnId = colDef.field;
    const value = event.newValue;
    
    // Only handle base columns here (custom columns use valueSetter)
    if (columnId && data.id) {
      const column = adminColumns.find(col => col.id === columnId);
      if (!column?.is_custom) {
        await handleCellEdit(data.id, columnId, value);
      }
    }
  };


  // Create cell renderer components with proper props
  const createTextCellRenderer = useCallback((onCellEdit: (id: string, field: string, value: string) => Promise<void>) => 
    (params: { value: string; data: Record<string, unknown>; colDef: Record<string, unknown> }) => 
      <TextCellRenderer {...params} onCellEdit={onCellEdit} />, []);

  const createDropdownCellRenderer = useCallback((onCellEdit: (id: string, field: string, value: string) => Promise<void>) => 
    (params: { value: string; data: Record<string, unknown>; colDef: Record<string, unknown> }) => 
      <DropdownCellRenderer {...params} adminColumns={adminColumns} onCellEdit={onCellEdit} />, [adminColumns]);

  const resumeCellRenderer = (params: { value: string }) => 
    <ResumeCellRenderer value={params.value} />;

  // Simple renderers for custom columns (display-only, editing handled by AG Grid)
  const createSimpleTextRenderer = useCallback(() => 
    (params: { value: string }) => 
      <SimpleTextRenderer value={params.value} />, []);

  const createSimpleDropdownRenderer = useCallback(() => 
    (params: { value: string; colDef: Record<string, unknown> }) => 
      <SimpleDropdownRenderer value={params.value} adminColumns={adminColumns} colDef={params.colDef} />, [adminColumns]);

  const columnDefs = useMemo<ColDef[]>(() => {
    // Add Position Applied For column first
    const positionColumn: ColDef = {
      field: 'position_applied_for',
      colId: 'position_applied_for',
      headerName: 'Position Applied For',
      width: 200,
      resizable: true,
      sortable: true,
      filter: true,
      editable: false,
      valueGetter: (params) => params.data.job?.position || '',
      cellRenderer: createSimpleTextRenderer(),
    };

    // Then add all columns from Supabase
    const allColumns: ColDef[] = [
      positionColumn,
      ...adminColumns
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(col => {
        // Special handling for different column types
        const baseColDef: ColDef = {
          field: col.id,
          colId: col.id,
          headerName: col.name,
          width: col.width || 150,
          resizable: true,
          sortable: true,
          filter: true,
          editable: true,
        };

        // Handle special columns
        if (col.id === 'actions') {
          return {
            ...baseColDef,
            resizable: false,
            sortable: false,
            filter: false,
            editable: false,
            width: 150,
            cellRenderer: (params: { data: Application }) => {
              return (
                <div className="flex gap-1">
                  {onArchiveApplication && (
                    <button
                      onClick={() => onArchiveApplication(params.data.id)}
                      title="Archive application"
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                  {onDeleteApplication && (
                    <button
                      onClick={() => onDeleteApplication(params.data.id)}
                      title="Delete application"
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            },
          };
        }

        if (col.id === 'resume_url') {
          return {
            ...baseColDef,
            editable: false,
            cellRenderer: resumeCellRenderer,
          };
        }

        if (col.id === 'applied_at') {
          return {
            ...baseColDef,
            editable: false,
            valueFormatter: (params) => formatDate(params.value),
          };
        }

        // Job fields (nested) - read-only
        if (col.id.startsWith('job.')) {
          const key = col.id.slice(4);
          return {
            ...baseColDef,
            editable: false,
            valueGetter: (params) => {
              const job = params.data?.job as Record<string, unknown> | undefined;
              const v = job?.[key];
              return key === 'apply_by' && v && typeof v === 'string' ? v.split('T')[0] : (v ?? '');
            },
          };
        }

        // Multi-line text columns
        if (['location_comfort', 'work_preference', 'reason_for_change', 'cover_letter'].includes(col.id)) {
          return {
            ...baseColDef,
            cellEditor: 'agLargeTextCellEditor',
            cellEditorParams: { 
              maxLength: col.id === 'cover_letter' ? 2000 : 1000, 
              rows: col.id === 'cover_letter' ? 5 : 4, 
              cols: col.id === 'cover_letter' ? 60 : 50 
            },
            cellRenderer: createTextCellRenderer(handleCellEdit),
            wrapText: true,
            autoHeight: true,
          };
        }

             // Custom columns (from database)
             if (col.is_custom) {
               return {
                 ...baseColDef,
                 valueGetter: (params) => params.data.custom_admin_fields?.values[col.id] || '',
                 valueSetter: (params) => {
                   const newValue = params.newValue;
                   const applicationId = params.data.id;
                   const existingCustomFields = params.data.custom_admin_fields;
                   
                   // Update local data immediately
                   if (!params.data.custom_admin_fields) {
                     params.data.custom_admin_fields = { values: {} };
                   }
                   params.data.custom_admin_fields.values[col.id] = newValue;
                   
                   // Save to Supabase (async, don't wait)
                   handleCellEdit(applicationId, col.id, newValue, existingCustomFields);
                   
                   // AG Grid will automatically refresh the cell when valueSetter returns true
                   return true;
                 },
                 // Use simple display-only renderers for custom columns
                 ...(col.type === 'dropdown' ? {
                   cellRenderer: createSimpleDropdownRenderer(),
                   cellEditor: 'agSelectCellEditor',
                   cellEditorParams: {
                     values: col.options?.map(opt => opt.value) || []
                   }
                 } : {
                   cellRenderer: createSimpleTextRenderer(),
                   cellEditor: 'agTextCellEditor'
                 }),
                 headerComponent: () => (
                   <div className="flex items-center justify-between w-full h-full">
                     <span>{col.name}</span>
                     <div className="flex items-center gap-1">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => {
                           setEditingColumn(col);
                           setShowAddColumn(true);
                         }}
                         className="h-6 w-6 p-0"
                       >
                         <PenSquare className="h-3 w-3" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => setDeletingColumnId(col.id)}
                         className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                       >
                         <Trash2 className="h-3 w-3" />
                       </Button>
                     </div>
                   </div>
                 ),
               };
             }

        // Default text columns
        return {
          ...baseColDef,
          cellRenderer: createTextCellRenderer(handleCellEdit),
        };
      })
    ];

    return allColumns.map(col => ({
      ...col,
      hide: hiddenColumns.has(col.field!)
    }));
  }, [adminColumns, hiddenColumns, handleCellEdit, createTextCellRenderer, createSimpleTextRenderer, createSimpleDropdownRenderer, onDeleteApplication, onArchiveApplication]);

  // Restore column state when both gridApi and columnDefs are ready
  useEffect(() => {
    if (gridApi && columnDefs.length > 0) {
      restoreColumnState();
    }
  }, [gridApi, columnDefs, restoreColumnState]);

  // External filtering functions for AG Grid
  const isExternalFilterPresent = useCallback(() => {
    return externalFilters.positions.length > 0 ||
           (externalFilters.applicantName ?? '').length > 0 ||
           externalFilters.gender.length > 0 ||
           (externalFilters.searchByFields ?? '').trim().length > 0 ||
           Object.values(externalFilters.customFields).some(filters => filters.length > 0);
  }, [externalFilters]);

  const doesExternalFilterPass = useCallback((node: { data: ApplicationData }) => {
    const data = node.data;
    
    // Filter by positions (multi-select)
    if (externalFilters.positions.length > 0 && !externalFilters.positions.includes(data.job?.position)) {
      return false;
    }
    
    // Filter by applicant name (search)
    const name = (data as { full_name?: string }).full_name ?? data.candidate_name ?? '';
    if (externalFilters.applicantName && !name.toLowerCase().includes(externalFilters.applicantName.toLowerCase())) {
      return false;
    }
    
    // Filter by Gender (default dropdown)
    if (externalFilters.gender.length > 0) {
      const appGender = (data as { gender?: string }).gender ?? '';
      const sel = externalFilters.gender;
      const showBlank = sel.includes('__BLANK__') && !String(appGender).trim();
      const showMatch = sel.filter(v => v !== '__BLANK__').includes(appGender);
      if (!showBlank && !showMatch) return false;
    }
    
    // Search across Batch, Phone, Fellowship State, Home State, Big Bet
    if ((externalFilters.searchByFields ?? '').trim()) {
      const q = (externalFilters.searchByFields ?? '').toLowerCase().trim();
      const batch = (data as { batch?: string }).batch ?? '';
      const phone = (data as { phone_number?: string }).phone_number ?? '';
      const fellowshipState = (data as { fellowship_state?: string }).fellowship_state ?? '';
      const homeState = (data as { home_state?: string }).home_state ?? '';
      const bigBet = (data as { big_bet?: string }).big_bet ?? '';
      const matches = [batch, phone, fellowshipState, homeState, bigBet].some(f => f && String(f).toLowerCase().includes(q));
      if (!matches) return false;
    }
    
    // Filter by custom fields (dynamic)
    for (const [fieldId, selectedValues] of Object.entries(externalFilters.customFields)) {
      if (selectedValues.length > 0) {
        const fieldValue = data.custom_admin_fields?.values?.[fieldId];
        
        // Check if "Blank" option is selected
        if (selectedValues.includes("__BLANK__")) {
          // If blank is selected, show applications with empty/null values
          if (fieldValue && fieldValue.trim() !== '') {
            // If blank is selected but field has value, only show if other values are also selected
            const otherValues = selectedValues.filter(v => v !== "__BLANK__");
            if (otherValues.length > 0 && !otherValues.includes(fieldValue)) {
              return false;
            } else if (otherValues.length === 0) {
              return false; // Only blank selected but field has value
            }
          }
        } else {
          // Normal filtering - field must have value and be in selected values
          if (!fieldValue || !selectedValues.includes(fieldValue)) {
            return false;
          }
        }
      }
    }
    
    return true;
  }, [externalFilters]);

  // Get unique values for filter options
  const uniqueJobTitles = useMemo(() => {
    return [...new Set(applications.map(app => app.job?.position).filter(Boolean))].sort();
  }, [applications]);


  // Create options for multi-select components
  const positionOptions: MultiSelectOption[] = useMemo(() => 
    uniqueJobTitles.map(title => ({
      label: title,
      value: title
    })), [uniqueJobTitles]);

  const genderOptions: MultiSelectOption[] = useMemo(() => [
    { label: 'Blank (Not Assigned)', value: '__BLANK__' },
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
    { label: 'Prefer not to say', value: 'Prefer not to say' }
  ], []);

  // Helper function to get options for custom dropdown fields
  const getCustomFieldOptions = useCallback((columnId: string): MultiSelectOption[] => {
    const column = adminColumns.find(col => col.id === columnId);
    if (column?.type === 'dropdown' && column.options) {
      const options = column.options.map(opt => ({
        label: opt.value,
        value: opt.value
      }));
      
      // Add "Blank" option for filtering empty values
      options.unshift({
        label: "Blank (Not Assigned)",
        value: "__BLANK__"
      });
      
      return options;
    }
    return [];
  }, [adminColumns]);


  const defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    filterParams: {
      filterPlaceholder: ''
    },
    editable: true,
    wrapText: true,        // Enable text wrapping for all columns
    autoHeight: true,      // Enable auto height for all columns by default
    // No width, no flex - let AG Grid handle sizing
  };

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-brand-primary" />
            <span className="text-sm font-medium text-brand-primary">Filters:</span>
          </div>
          
          {/* Applicant Name Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applicant name..."
              value={externalFilters.applicantName ?? ''}
              onChange={(e) => {
                setExternalFilters(prev => ({ ...prev, applicantName: e.target.value }));
                gridApi?.onFilterChanged();
              }}
              className="pl-10 min-w-[200px] max-w-[250px]"
            />
          </div>

          {/* Multi-select Position Filter */}
          <MultiSelect
            options={positionOptions}
            selected={externalFilters.positions}
            onChange={(selected) => {
              setExternalFilters(prev => ({ ...prev, positions: selected }));
              gridApi?.onFilterChanged();
            }}
            placeholder="All Positions"
            maxDisplay={1}
          />

          {/* Gender Filter */}
          <MultiSelect
            options={genderOptions}
            selected={externalFilters.gender}
            onChange={(selected) => {
              setExternalFilters(prev => ({ ...prev, gender: selected }));
              gridApi?.onFilterChanged();
            }}
            placeholder="All Genders"
            maxDisplay={1}
          />

          {/* Search: Batch, Phone, States, Big Bet */}
          <div className="relative min-w-[200px] max-w-[280px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search batch, phone, states, big bet..."
              value={externalFilters.searchByFields ?? ''}
              onChange={(e) => {
                setExternalFilters(prev => ({ ...prev, searchByFields: e.target.value }));
                gridApi?.onFilterChanged();
              }}
              className="pl-10"
            />
          </div>

          {/* Dynamic Custom Field Filters */}
          {adminColumns
            .filter(col => col.type === 'dropdown' && col.is_custom)
            .map(column => (
              <MultiSelect
                key={column.id}
                options={getCustomFieldOptions(column.id)}
                selected={externalFilters.customFields[column.id] || []}
                onChange={(selected) => {
                  setExternalFilters(prev => ({
                    ...prev,
                    customFields: { ...prev.customFields, [column.id]: selected }
                  }));
                  gridApi?.onFilterChanged();
                }}
                placeholder={`All ${column.name}`}
                maxDisplay={1}
              />
            ))
          }
        </div>
        
        {/* Active Filters Display */}
        {(externalFilters.positions.length > 0 || (externalFilters.applicantName ?? '') || externalFilters.gender.length > 0 || (externalFilters.searchByFields ?? '').trim() || Object.values(externalFilters.customFields).some(filters => filters.length > 0)) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {externalFilters.positions.map(position => (
              <Badge key={position} variant="secondary" className="text-xs">
                Position: {position}
              </Badge>
            ))}
            {externalFilters.applicantName && (
              <Badge variant="secondary" className="text-xs">
                Name: {externalFilters.applicantName}
              </Badge>
            )}
            {externalFilters.gender.length > 0 && externalFilters.gender.map(v => (
              <Badge key={v} variant="secondary" className="text-xs">
                Gender: {v === '__BLANK__' ? 'Blank' : v}
              </Badge>
            ))}
            {(externalFilters.searchByFields ?? '').trim() && (
              <Badge variant="secondary" className="text-xs">
                Search: {externalFilters.searchByFields}
              </Badge>
            )}
            {Object.entries(externalFilters.customFields).map(([fieldId, selectedValues]) => {
              const column = adminColumns.find(col => col.id === fieldId);
              return selectedValues.map(value => (
                <Badge key={`${fieldId}-${value}`} variant="secondary" className="text-xs">
                  {column?.name}: {value}
                </Badge>
              ));
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setExternalFilters({ 
                  positions: [], 
                  applicantName: '',
                  searchByFields: '',
                  gender: [],
                  customFields: {}
                });
                gridApi?.onFilterChanged();
              }}
              className="text-xs text-brand-primary hover:text-brand-primary/80"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              gridApi?.setGridOption('quickFilterText', e.target.value);
            }}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddColumn(true)}>
            Add Column
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Columns className="h-4 w-4" />
                Show/Hide Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[min(70vh,28rem)] overflow-y-auto" onCloseAutoFocus={(e) => e.preventDefault()}>
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {adminColumns.map((col) => {
                const columnId = col.id;
                return (
                  <DropdownMenuCheckboxItem
                    key={columnId}
                    checked={!hiddenColumns.has(columnId)}
                    onCheckedChange={async () => await toggleColumnVisibility(columnId)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {col.display_name || col.name} {col.is_custom && '(Custom)'}
                  </DropdownMenuCheckboxItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => await showAllColumns()}>
                <Eye className="h-4 w-4 mr-2" />
                Show All Columns
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={downloadAsExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <style>
          {`
            .ag-theme-alpine .ag-filter-text input::placeholder {
              color: transparent;
              opacity: 0;
            }
            .ag-theme-alpine .ag-filter-text input {
              background-image: none !important;
            }
            /* Vertical column separators */
            .ag-theme-alpine .ag-cell {
              border-right: 1px solid #e5e7eb;
            }
            .ag-theme-alpine .ag-header-cell {
              border-right: 1px solid #e5e7eb;
            }
            /* Reduce row height for tighter spacing */
            .ag-theme-alpine .ag-row {
              min-height: 24px !important;
            }
            .ag-theme-alpine .ag-cell {
              line-height: 20px !important;
              padding-top: 1px !important;
              padding-bottom: 1px !important;
              padding-left: 8px !important;
              padding-right: 8px !important;
            }
            .ag-theme-alpine .ag-header-cell {
              padding-top: 2px !important;
              padding-bottom: 2px !important;
              line-height: 20px !important;
            }
            .ag-theme-alpine .ag-header-row {
              min-height: 24px !important;
            }
          `}
        </style>
        <AgGridReact
          rowData={applications}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          onColumnResized={saveColumnState}
          onColumnMoved={saveColumnState}
          maintainColumnOrder={true}
          animateRows={true}
          suppressRowClickSelection={true}
          rowSelection="multiple"
          rowHeight={24}
          quickFilterText={globalFilter}
          theme="legacy"
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          components={{
            TextCellRenderer: createTextCellRenderer(handleCellEdit),
            DropdownCellRenderer: createDropdownCellRenderer(handleCellEdit),
            ResumeCellRenderer: resumeCellRenderer,
          }}
        />
      </div>

      <AddCustomColumnDialog
        open={showAddColumn}
        onClose={() => {
          setShowAddColumn(false);
          setEditingColumn(null);
        }}
        onAdd={editingColumn ? 
          (updates) => handleEditColumn(editingColumn.id, updates) : 
          handleAddColumn
        }
        editingColumn={editingColumn}
      />

      <ConfirmDialog
        open={!!deletingColumnId}
        onClose={() => setDeletingColumnId(null)}
        onConfirm={() => {
          if (deletingColumnId) {
            handleDeleteColumn(deletingColumnId);
            setDeletingColumnId(null);
          }
        }}
        title="Delete Custom Column"
        description="Are you sure you want to delete this column? This action cannot be undone, and all data in this column will be lost."
      />
    </div>
  );
}