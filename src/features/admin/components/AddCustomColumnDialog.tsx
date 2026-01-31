import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DropdownOption {
  value: string;
  color: string;
}

interface AdminColumn {
  id: string;
  name: string;
  type: 'text' | 'dropdown';
  options?: DropdownOption[];
  width?: number;
  order?: number;
}

interface AddCustomColumnDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (column: {
    name: string;
    type: 'text' | 'dropdown';
    options?: DropdownOption[];
  }) => void;
  editingColumn?: AdminColumn | null;
}

export function AddCustomColumnDialog({ open, onClose, onAdd, editingColumn }: AddCustomColumnDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'dropdown'>('text');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [newOption, setNewOption] = useState('');
  const [newColor, setNewColor] = useState('#FFFFFF');

  const handleAdd = () => {
    onAdd({
      name,
      type,
      options: type === 'dropdown' ? options : undefined
    });
    resetForm();
    onClose(); // Close dialog after successful addition
  };

  // Initialize form with editing column data if present
  useEffect(() => {
    if (editingColumn) {
      setName(editingColumn.name);
      setType(editingColumn.type);
      setOptions(editingColumn.options || []);
    } else {
      resetForm();
    }
  }, [editingColumn]);

  const resetForm = () => {
    setName('');
    setType('text');
    setOptions([]);
    setNewOption('');
    setNewColor('#FFFFFF');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingColumn ? 'Edit Custom Column' : 'Add Custom Column'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Column Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter column name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Column Type</Label>
            <Select value={type} onValueChange={(value: 'text' | 'dropdown') => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'dropdown' && (
            <div className="grid gap-2">
              <Label>Dropdown Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: option.color }}
                    />
                    <span>{option.value}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOptions(options.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="New option"
                  />
                  <Input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-12"
                  />
                  <Button 
                    onClick={() => {
                      if (newOption) {
                        setOptions([...options, { value: newOption, color: newColor }]);
                        setNewOption('');
                        setNewColor('#FFFFFF');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!name || (type === 'dropdown' && options.length === 0)}>
            {editingColumn ? 'Update Column' : 'Add Column'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
