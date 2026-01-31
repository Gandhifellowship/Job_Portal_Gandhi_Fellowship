/**
 * Application column definitions for AG Grid
 */

import { ColDef } from 'ag-grid-community';
import { formatDate } from '@/shared/lib/date';

interface AdminColumn {
  id: string;
  name: string;
  type: 'text' | 'dropdown';
  options?: Array<{ value: string; color: string; }>;
}

export interface ApplicationColumnConfig {
  baseColumns: ColDef[];
  getDynamicColumns: (adminColumns: AdminColumn[]) => ColDef[];
}

export const createApplicationColumns = (): ApplicationColumnConfig => {
  const baseColumns: ColDef[] = [
    {
      field: 'full_name',
      colId: 'full_name',
      headerName: 'Full Name',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'batch',
      colId: 'batch',
      headerName: 'Batch',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'gender',
      colId: 'gender',
      headerName: 'Gender',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'email_official',
      colId: 'email_official',
      headerName: 'Email Official',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'email_personal',
      colId: 'email_personal',
      headerName: 'Email Personal',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'phone_number',
      colId: 'phone_number',
      headerName: 'Phone Number',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'big_bet',
      colId: 'big_bet',
      headerName: 'Big Bet',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'fellowship_state',
      colId: 'fellowship_state',
      headerName: 'Fellowship State',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'home_state',
      colId: 'home_state',
      headerName: 'Home State',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'fpc_name',
      colId: 'fpc_name',
      headerName: 'FPC Name',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'state_spoc_name',
      colId: 'state_spoc_name',
      headerName: 'State SPOC Name',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'job.position',
      colId: 'job.position',
      headerName: 'Position',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'status',
      colId: 'status',
      headerName: 'Status',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'TextCellRenderer',
      editable: true,
    },
    {
      field: 'applied_at',
      colId: 'applied_at',
      headerName: 'Applied Date',
      resizable: true,
      sortable: true,
      filter: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'resume_url',
      colId: 'resume_url',
      headerName: 'Resume PDF',
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: 'ResumeCellRenderer',
      editable: false,
    },
  ];

  const getDynamicColumns = (adminColumns: AdminColumn[]): ColDef[] => {
    return adminColumns.map(col => ({
      field: col.id,
      colId: col.id,
      headerName: col.name,
      resizable: true,
      sortable: true,
      filter: true,
      cellRenderer: col.type === 'dropdown' ? 'DropdownCellRenderer' : 'TextCellRenderer',
      editable: true,
    }));
  };

  return {
    baseColumns,
    getDynamicColumns,
  };
};
