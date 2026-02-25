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
  full_name: string;
  batch?: string;
  gender?: string;
  email_official: string;
  email_personal?: string;
  phone_number: string;
  reference_number: string;
  applied_at: string;
  status?: string;
  big_bet?: string;
  fellowship_state?: string;
  home_state?: string;
  fpc_name?: string;
  state_spoc_name?: string;
  cover_letter?: string;
  resume_url?: string;
  custom_admin_fields?: {
    values?: Record<string, string>;
  };
  job: {
    position: string;
    organisation_name: string;
    domain: string;
    location?: string;
    apply_by?: string;
    about?: string;
    compensation_range?: string;
    pdf_url?: string;
  };
}

interface AdminColumn {
  id: string;
  name: string;
  type: string;
  is_custom: boolean;
  options?: Array<{ value: string; color?: string }>;
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
  const [aboutExpanded, setAboutExpanded] = useState(false);

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
    const hasAny =
      application.batch ||
      application.gender ||
      application.email_personal ||
      application.big_bet ||
      application.fellowship_state ||
      application.home_state ||
      application.fpc_name ||
      application.state_spoc_name;
    if (!hasAny) return null;

    return (
      <div className="mb-4 p-4 bg-gradient-to-r from-brand-lightBlue/5 to-brand-lightGreen/5 rounded-lg border">
        <h4 className="font-medium text-brand-primary mb-3">Application Details</h4>
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          {renderDetailField(application.batch, 'Batch', 'batch')}
          {renderDetailField(application.gender, 'Gender', 'gender')}
          {renderDetailField(application.email_personal, 'Email Personal', 'email_personal')}
          {renderDetailField(application.big_bet, 'Big Bet', 'big_bet')}
          {renderDetailField(application.fellowship_state, 'Fellowship State', 'fellowship_state')}
          {renderDetailField(application.home_state, 'Home State', 'home_state')}
          {renderDetailField(application.fpc_name, 'FPC Name', 'fpc_name')}
          {renderDetailField(application.state_spoc_name, 'State SPOC Name', 'state_spoc_name')}
        </div>
      </div>
    );
  };

  // Helper function to render dropdown field
  const renderDropdownField = (column: AdminColumn, currentValue: string) => {
    const displayValue = isEditing ? (editFields[column.id] !== undefined ? editFields[column.id] : currentValue) : currentValue;
    const option = column.options?.find(opt => opt.value === displayValue);
    const optionColor = option?.color;

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
            {column.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        ) : (
          <p
            className={`text-sm mt-1 px-2 py-1 rounded inline-block min-w-0 ${optionColor ? 'text-foreground' : 'text-muted-foreground'}`}
            style={optionColor ? { backgroundColor: optionColor } : undefined}
          >
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
              {application.job.location && <> • {application.job.location}</>}
            </p>
            <p className="text-sm text-muted-foreground">
              Ref: {application.reference_number} • Applied {formatDate(application.applied_at)}
              {application.status && (
                <> • Status: <span className="font-medium text-foreground">{application.status}</span></>
              )}
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

        {/* Position, Organisation, Domain (always visible) */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded border min-w-0">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-muted-foreground">Position:</span>
              <p className="text-foreground font-semibold truncate">{application.job.position}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onCopyToClipboard(application.job.position, `position-${application.id}`)} className="h-7 w-7 p-0 flex-shrink-0" title="Copy position">
              {copiedField === `position-${application.id}` ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            </Button>
          </div>
          {renderDetailField(application.job.organisation_name ?? '', 'Organisation', 'job.org')}
          {renderDetailField(application.job.domain ?? '', 'Domain', 'job.domain')}
          {application.job.location && renderDetailField(application.job.location, 'Location', 'job.location')}
        </div>

        {/* Job details: Apply by, About, Compensation, Job PDF */}
        {(application.job.apply_by || application.job.about || application.job.compensation_range || application.job.pdf_url) && (
          <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
            <h4 className="font-medium text-brand-primary mb-3">Job Details</h4>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              {application.job.apply_by && renderDetailField(application.job.apply_by.split('T')[0], 'Apply by', 'job.apply_by')}
              {application.job.compensation_range && renderDetailField(application.job.compensation_range, 'Compensation range', 'job.compensation_range')}
              {application.job.about && (
                <div className="md:col-span-2 p-2 bg-white/50 rounded border min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-muted-foreground">About role:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAboutExpanded((v) => !v)}
                      className="text-brand-primary hover:text-brand-primary/80 p-1 h-7"
                    >
                      {aboutExpanded ? (
                        <><ChevronUp className="h-4 w-4 mr-1" /> Collapse</>
                      ) : (
                        <><ChevronDown className="h-4 w-4 mr-1" /> Expand</>
                      )}
                    </Button>
                  </div>
                  <div className={`text-sm text-foreground break-words whitespace-pre-wrap transition-all duration-200 ${aboutExpanded ? 'max-h-none' : 'line-clamp-3 max-h-16 overflow-hidden'}`}>
                    {application.job.about}
                  </div>
                </div>
              )}
              {application.job.pdf_url && (
                <div className="md:col-span-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={application.job.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Job PDF
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {renderApplicationDetails()}

        {application.cover_letter && (
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
        )}

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
