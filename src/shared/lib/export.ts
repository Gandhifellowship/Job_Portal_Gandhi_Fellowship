/**
 * Shared export utility functions
 */

import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  filename: string = 'export.xlsx',
  sheetName: string = 'Sheet1'
): void {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
}

/**
 * Export data to CSV file
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string = 'export.csv'
): void {
  try {
    if (data.length === 0) {
      throw new Error('No data to export');
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data to CSV');
  }
}

/**
 * Prepare data for export by flattening nested objects
 */
export function prepareDataForExport(data: Record<string, unknown>[]): Record<string, unknown>[] {
  return data.map(item => {
    const flattened: Record<string, unknown> = {};
    
    Object.keys(item).forEach(key => {
      const value = item[key];
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Flatten nested objects
        Object.keys(value).forEach(nestedKey => {
          flattened[`${key}_${nestedKey}`] = value[nestedKey];
        });
      } else {
        flattened[key] = value;
      }
    });
    
    return flattened;
  });
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(baseName: string, extension: string = 'xlsx'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `${baseName}_${timestamp}.${extension}`;
}
