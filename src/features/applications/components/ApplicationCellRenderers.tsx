/**
 * Custom cell renderers for Application Grid
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CellRendererParams {
  value: string;
  data: Record<string, unknown>;
  colDef: Record<string, unknown>;
}

interface TextCellRendererProps extends CellRendererParams {
  onCellEdit: (id: string, field: string, value: string, existingCustomFields?: { values: Record<string, string> }) => Promise<void>;
}

export const TextCellRenderer = ({ value, data, colDef, onCellEdit }: TextCellRendererProps) => {
  const [editing, setEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || '');
  const [originalValue, setOriginalValue] = useState(value || '');

  useEffect(() => {
    setCurrentValue(value || '');
    setOriginalValue(value || '');
  }, [value]);

  const handleSave = async () => {
    if (currentValue !== originalValue) {
      await onCellEdit(data.id as string, colDef.field as string, currentValue, data.custom_admin_fields as { values: Record<string, string> });
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(originalValue);
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') handleCancel();
        }}
        className="h-8 text-xs"
      />
    );
  }

  return (
    <div 
      className="p-2 cursor-pointer hover:bg-gray-50 rounded h-full flex items-center"
      onClick={() => setEditing(true)}
    >
      {currentValue || '-'}
    </div>
  );
};

interface AdminColumn {
  id: string;
  name: string;
  type: 'text' | 'dropdown';
  options?: Array<{ value: string; color: string; }>;
}

interface DropdownCellRendererProps extends CellRendererParams {
  adminColumns: AdminColumn[];
  onCellEdit: (id: string, field: string, value: string, existingCustomFields?: { values: Record<string, string> }) => Promise<void>;
}

export const DropdownCellRenderer = ({ 
  value, 
  data, 
  colDef, 
  adminColumns, 
  onCellEdit 
}: DropdownCellRendererProps) => {
  const adminCol = adminColumns.find(col => col.id === colDef.field);
  
  if (!adminCol || adminCol.type !== 'dropdown') {
    return (
      <TextCellRenderer 
        value={value} 
        data={data} 
        colDef={colDef} 
        onCellEdit={onCellEdit} 
      />
    );
  }

  return (
    <Select
      value={value || ''}
      onValueChange={(newValue) => onCellEdit(data.id as string, colDef.field as string, newValue, data.custom_admin_fields as { values: Record<string, string> })}
    >
      <SelectTrigger 
        className="w-full h-8 text-xs" 
        style={{ backgroundColor: adminCol.options?.find(opt => opt.value === value)?.color }}
      >
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {adminCol.options?.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="flex items-center gap-2 text-xs"
          >
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: option.color }} 
            />
            {option.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface ResumeCellRendererProps {
  value: string;
}

export const ResumeCellRenderer = ({ value }: ResumeCellRendererProps) => {
  if (!value) return '';

  return (
    <a 
      href={value} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      View PDF
    </a>
  );
};

// Simple display-only renderers for custom columns (editing handled by AG Grid editors)
interface SimpleTextRendererProps {
  value: string;
}

export const SimpleTextRenderer = ({ value }: SimpleTextRendererProps) => {
  return (
    <div className="p-2 h-full flex items-center">
      {value || '-'}
    </div>
  );
};

interface SimpleDropdownRendererProps {
  value: string;
  adminColumns: AdminColumn[];
  colDef: Record<string, unknown>;
}

export const SimpleDropdownRenderer = ({ value, adminColumns, colDef }: SimpleDropdownRendererProps) => {
  const adminCol = adminColumns.find(col => col.id === colDef.field);
  const option = adminCol?.options?.find(opt => opt.value === value);
  
  return (
    <div 
      className="p-2 h-full flex items-center rounded"
      style={{ backgroundColor: option?.color }}
    >
      {value || '-'}
    </div>
  );
};
