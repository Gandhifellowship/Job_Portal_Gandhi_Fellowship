import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  Check, 
  Clipboard, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Archive, 
  Trash2,
  Edit,
  Save,
  X
} from 'lucide-react';

interface Application {
  id: string;
  candidate_name: string;
  email: string;
  phone: string;
  reference_number: string;
  applied_at: string;
  current_ctc?: string;
  expected_ctc?: string;
  notice_period?: string;
  location_comfort?: string;
  reason_for_change?: string;
  work_preference?: string;
  employee_referral_code?: string;
  cover_letter: string;
  resume_url?: string;
  custom_admin_fields?: {
    values?: Record<string, string>;
  };
  job: {
    title: string;
    department: string;
  };
}

interface AdminColumn {
  id: string;
  name: string;
  type: string;
  is_custom: boolean;
  options?: Array<{ value: string }>;
}

interface ApplicationCardProps {
  application: Application;
  adminColumns: AdminColumn[];
  copiedField: string | null;
  expandedCoverLetters: Set<string>;
  onCopyToClipboard: (text: string, fieldId: string) => void;
  onToggleCoverLetter: (applicationId: string) => void;
  onUpdateAllCustomFields: (applicationId: string, allFields: Record<string, string>) => void;
  onArchiveApplication: (applicationId: string) => void;
  onDeleteApplication: (applicationId: string) => void;
  formatDate: (date: string) => string;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  adminColumns,
  copiedField,
  expandedCoverLetters,
  onCopyToClipboard,
  onToggleCoverLetter,
  onUpdateAllCustomFields,
  onArchiveApplication,
  onDeleteApplication,
  formatDate,
}) => {
  // Edit/Save pattern state management
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState<Record<string, string>>({});

  // Initialize edit fields from application data
  useEffect(() => {
    if (application.custom_admin_fields?.values) {
      setEditFields(application.custom_admin_fields.values);
    }
  }, [application.custom_admin_fields?.values]);

  // Handle field changes during editing
  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setEditFields(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  // Handle save - send all fields at once
  const handleSave = useCallback(async () => {
    try {
      await onUpdateAllCustomFields(application.id, editFields);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving custom fields:', error);
    }
  }, [application.id, editFields, onUpdateAllCustomFields]);

  // Handle cancel - revert to original values
  const handleCancel = useCallback(() => {
    setEditFields(application.custom_admin_fields?.values || {});
    setIsEditing(false);
  }, [application.custom_admin_fields?.values]);

  // Helper function to render a detail field with copy button
  const renderDetailField = (value: string, label: string, fieldId: string, isFullWidth = false) => {
    if (!value) return null;
    
    return (
      <div className={`${isFullWidth ? 'md:col-span-2' : ''} flex items-center justify-between p-2 bg-white/50 rounded border min-w-0`}>
        <div className="min-w-0 flex-1">
          <span className="font-medium text-muted-foreground">{label}:</span>
          <p className={`text-foreground ${isFullWidth ? 'break-words' : 'truncate'}`}>{value}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopyToClipboard(value, `${fieldId}-${application.id}`)}
          className="h-7 w-7 p-0 flex-shrink-0"
          title={`Copy ${label.toLowerCase()}`}
        >
          {copiedField === `${fieldId}-${application.id}` ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  const renderApplicationDetails = () => {
    if (!application.current_ctc && !application.expected_ctc && 
        !application.notice_period && !application.location_comfort) {
      return null;
    }

    return (
      <div className="mb-4 p-4 bg-gradient-to-r from-brand-lightBlue/5 to-brand-lightGreen/5 rounded-lg border">
        <h4 className="font-medium text-brand-primary mb-3">Application Details</h4>
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          {renderDetailField(application.current_ctc, 'Current CTC', 'current_ctc')}
          {renderDetailField(application.expected_ctc, 'Expected CTC', 'expected_ctc')}
          {renderDetailField(application.notice_period, 'Notice Period', 'notice_period')}
          {renderDetailField(application.location_comfort, 'Location Preference', 'location_comfort', true)}
        </div>
      </div>
    );
  };

  const renderAdditionalInfo = () => {
    if (!application.reason_for_change && !application.work_preference && !application.employee_referral_code) {
      return null;
    }

    return (
      <div className="mb-4 space-y-3">
        {application.reason_for_change && (
          <div className="p-3 bg-brand-secondary/5 rounded-lg border">
            <div className="flex items-center justify-between mb-2 gap-2">
              <h4 className="font-medium text-brand-primary flex-shrink-0">Reason for Change:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyToClipboard(application.reason_for_change, `reason_for_change-${application.id}`)}
                className="h-7 px-2 flex-shrink-0"
                title="Copy reason for change"
              >
                {copiedField === `reason_for_change-${application.id}` ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed break-words">
              {application.reason_for_change}
            </p>
          </div>
        )}
        {application.work_preference && (
          <div className="p-3 bg-brand-accent/5 rounded-lg border">
            <div className="flex items-center justify-between mb-2 gap-2">
              <h4 className="font-medium text-brand-primary flex-shrink-0">Work Style Preference:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyToClipboard(application.work_preference, `work_preference-${application.id}`)}
                className="h-7 px-2 flex-shrink-0"
                title="Copy work preference"
              >
                {copiedField === `work_preference-${application.id}` ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed break-words">
              {application.work_preference}
            </p>
          </div>
        )}
        {application.employee_referral_code && (
          <div className="p-3 bg-brand-lightGreen/5 rounded-lg border">
            <div className="flex items-center justify-between mb-2 gap-2">
              <h4 className="font-medium text-brand-primary flex-shrink-0">Employee Referral Code:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyToClipboard(application.employee_referral_code, `employee_referral_code-${application.id}`)}
                className="h-7 px-2 flex-shrink-0"
                title="Copy employee referral code"
              >
                {copiedField === `employee_referral_code-${application.id}` ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground break-words">
              {application.employee_referral_code}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Helper function to render dropdown field
  const renderDropdownField = (column: AdminColumn, currentValue: string) => {
    const displayValue = isEditing ? (editFields[column.id] !== undefined ? editFields[column.id] : currentValue) : currentValue;
    
    return (
    <div key={column.id} className="flex items-center justify-between p-2 bg-muted/50 rounded min-w-0">
      <div className="min-w-0 flex-1">
        <span className="font-medium text-muted-foreground">{column.name}:</span>
        {isEditing ? (
          <select
            value={displayValue}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background"
          >
            <option value="">Select {column.name}</option>
            {column.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">
            {displayValue || 'Not assigned'}
          </p>
        )}
      </div>
    </div>
  );
  };

  // Helper function to render text input field
  const renderTextInputField = (column: AdminColumn, currentValue: string) => {
    const displayValue = isEditing ? (editFields[column.id] !== undefined ? editFields[column.id] : currentValue) : currentValue;

    return (
      <div key={column.id} className="flex items-center justify-between p-2 bg-muted/50 rounded min-w-0">
        <div className="min-w-0 flex-1">
          <span className="font-medium text-muted-foreground">{column.name}:</span>
          {isEditing ? (
            <input
              type="text"
              value={displayValue}
              onChange={(e) => handleFieldChange(column.id, e.target.value)}
              className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background"
              placeholder={`Enter ${column.name}`}
            />
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              {displayValue || 'Not assigned'}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderCustomFields = () => {
    const customColumns = adminColumns.filter(col => col.is_custom);
    if (customColumns.length === 0) return null;

    return (
      <div className="space-y-4 mb-4">
        {/* Custom Fields Header with Edit/Save buttons */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Custom Fields</h4>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Custom Fields Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {customColumns.map(column => {
            const currentValue = application.custom_admin_fields?.values?.[column.id] || '';
            
            if (column.type === 'dropdown') {
              return renderDropdownField(column, currentValue);
            } else {
              return renderTextInputField(column, currentValue);
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{application.full_name}</h3>
            <p className="text-muted-foreground break-words">
              Applied for: {application.job.position} • {application.job.organisation_name} • {application.job.domain}
            </p>
            <p className="text-sm text-muted-foreground">
              Ref: {application.reference_number} • Applied {formatDate(application.applied_at)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate">{application.email_official}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyToClipboard(application.email_official, `email-${application.id}`)}
              className="h-7 w-7 p-0 flex-shrink-0"
              title="Copy email"
            >
              {copiedField === `email-${application.id}` ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate">{application.phone_number}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyToClipboard(application.phone_number, `phone-${application.id}`)}
              className="h-7 w-7 p-0 flex-shrink-0"
              title="Copy phone"
            >
              {copiedField === `phone-${application.id}` ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Position Applied For */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded border min-w-0">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-muted-foreground">Position Applied For:</span>
              <p className="text-foreground font-semibold truncate">{application.job.position}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyToClipboard(application.job.position, `position-${application.id}`)}
              className="h-7 w-7 p-0 flex-shrink-0"
              title="Copy position"
            >
              {copiedField === `position-${application.id}` ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {renderApplicationDetails()}
        {renderAdditionalInfo()}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 gap-2">
            <h4 className="font-medium flex-shrink-0">Cover Letter:</h4>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyToClipboard(application.cover_letter, `cover-${application.id}`)}
                className="h-7 px-2"
                title="Copy cover letter"
              >
                {copiedField === `cover-${application.id}` ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleCoverLetter(application.id)}
                className="text-brand-primary hover:text-brand-primary/80 p-1"
              >
                {expandedCoverLetters.has(application.id) ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expand
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className={`text-sm text-muted-foreground transition-all duration-200 ${
            expandedCoverLetters.has(application.id) 
              ? 'max-h-none' 
              : 'line-clamp-3 max-h-16'
          }`}>
            <p className="whitespace-pre-wrap leading-relaxed break-words">
              {application.cover_letter}
            </p>
          </div>
        </div>

        {renderCustomFields()}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex gap-2">
            {application.resume_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Resume
                </a>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onArchiveApplication(application.id)}
              title="Archive application"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteApplication(application.id)}
              title="Delete application"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;
