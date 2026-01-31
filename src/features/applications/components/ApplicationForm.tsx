import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { Loader2, Upload, CheckCircle } from 'lucide-react';
import { useFormFields } from '../hooks/useFormFields';

// Dynamic schema will be generated from form fields
type ApplicationData = Record<string, string>;

// Form field interface
interface FormField {
  id: string;
  name: string;
}

interface FieldConfig {
  label: string;
  placeholder?: string;
  rows?: number;
}

interface FieldError {
  message: string;
}

interface ApplicationFormProps {
  jobId: string;
  onSuccess: () => void;
}

export default function ApplicationForm({ jobId, onSuccess }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const { toast } = useToast();
  const { formFields, loading: fieldsLoading } = useFormFields();

  // Generate dynamic schema from form fields
  // Only employee_referral_code is optional, all others are required
  const generateSchema = () => {
    const schemaFields: Record<string, z.ZodString | z.ZodOptional<z.ZodString>> = {};
    
    formFields.forEach(field => {
      let fieldSchema = z.string();
      
      // Determine if field is required (all fields are required except optional ones)
      const optionalFields = ['big_bet', 'fpc_name', 'state_spoc_name'];
      const isRequired = !optionalFields.includes(field.id);
      
      if (isRequired) {
        // Add specific validation based on field
        if (field.id === 'email_official' || field.id === 'email_personal') {
          fieldSchema = fieldSchema.email('Please enter a valid email address');
        } else if (field.id === 'phone_number') {
          fieldSchema = fieldSchema.min(10, 'Please enter a valid phone number');
        } else if (field.id === 'full_name') {
          fieldSchema = fieldSchema.min(2, 'Name must be at least 2 characters');
        } else {
          fieldSchema = fieldSchema.min(1, `${field.name} is required`);
        }
        schemaFields[field.id] = fieldSchema;
      } else {
        schemaFields[field.id] = fieldSchema.optional();
      }
    });
    
    return z.object(schemaFields);
  };

  const applicationSchema = fieldsLoading || formFields.length === 0 
    ? z.object({}) 
    : generateSchema();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 4 * 1024 * 1024) { // 4MB limit (Vercel compatible)
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 4MB",
          variant: "destructive",
        });
        return;
      }
      setResumeFile(file);
    }
  };

  const onSubmit = async (data: ApplicationData) => {
    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload your resume (PDF only)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send application data to Vercel API (handles database insert and email)
      const formData = new FormData();
      formData.append('jobId', jobId);
      
      // Dynamically append all form fields
      formFields.forEach(field => {
        const value = data[field.id] || '';
        formData.append(field.id, value);
      });
      
      formData.append('resumeFile', resumeFile);

      const response = await fetch('/api/send-application-notification', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const result = await response.json();
      
      setReferenceNumber(result.referenceNumber);
      setApplicationSuccess(true);
      reset();
      setResumeFile(null);
      
      toast({
        title: "Application submitted!",
        description: `Your reference number is ${result.referenceNumber}`,
      });

    } catch (error: unknown) {
      console.error('Application error:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationSuccess) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-success mx-auto" />
        <h3 className="text-lg font-semibold">Application Submitted!</h3>
        <div className="bg-success/10 p-4 rounded-lg">
          <p className="text-sm font-medium">Reference Number:</p>
          <p className="text-xl font-bold text-success">{referenceNumber}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          We'll review your application and get back to you soon.
        </p>
        <Button onClick={onSuccess} variant="outline" className="w-full">
          Close
        </Button>
      </div>
    );
  }

  // Show loading state while fetching form fields
  if (fieldsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading form...</span>
      </div>
    );
  }

  // Field configuration
  const getFieldConfig = (fieldId: string, fieldName: string) => {
    const fieldConfig: Record<string, { label: string; placeholder?: string; rows?: number }> = {
      full_name: { label: 'Full Name', placeholder: 'Enter your full name' },
      batch: { label: 'Batch', placeholder: 'e.g., 2024-26' },
      gender: { label: 'Gender', placeholder: 'Select your gender' },
      email_official: { label: 'Email Address Official', placeholder: 'your.official@example.com' },
      email_personal: { label: 'Email Address Personal', placeholder: 'your.personal@example.com' },
      phone_number: { label: 'Phone Number', placeholder: 'Your phone number' },
      big_bet: { label: 'Big Bet', placeholder: 'Enter Big Bet (optional)' },
      fellowship_state: { label: 'Fellowship State', placeholder: 'Enter Fellowship State' },
      home_state: { label: 'Home State', placeholder: 'Enter your Home State' },
      fpc_name: { label: 'FPC Name', placeholder: 'Enter FPC Name (optional)' },
      state_spoc_name: { label: 'State SPOC name', placeholder: 'Enter State SPOC name (optional)' },
    };
    return fieldConfig[fieldId] || { label: fieldName };
  };

  // Render dropdown field
  const renderDropdownField = (field: FormField, config: FieldConfig, isRequired: boolean, fieldError: FieldError | undefined) => (
    <div key={field.id}>
      <Label htmlFor={field.id}>{config.label} {isRequired && '*'}</Label>
      <select
        id={field.id}
        {...register(field.id)}
        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select {config.label}</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
      {fieldError && (
        <p className="text-sm text-destructive mt-1">{fieldError.message}</p>
      )}
    </div>
  );

  // Render email field
  const renderEmailField = (field: FormField, config: FieldConfig, isRequired: boolean, fieldError: FieldError | undefined) => (
    <div key={field.id}>
      <Label htmlFor={field.id}>{config.label} {isRequired && '*'}</Label>
      <Input
        id={field.id}
        type="email"
        {...register(field.id)}
        placeholder={config.placeholder}
        className="w-full"
      />
      {fieldError && (
        <p className="text-sm text-destructive mt-1">{fieldError.message}</p>
      )}
    </div>
  );

  // Render textarea field
  const renderTextareaField = (field: FormField, config: FieldConfig, isRequired: boolean, fieldError: FieldError | undefined) => (
    <div key={field.id}>
      <Label htmlFor={field.id}>{config.label} {isRequired && '*'}</Label>
      <Textarea
        id={field.id}
        {...register(field.id)}
        placeholder={config.placeholder}
        rows={config.rows || 3}
      />
      {fieldError && (
        <p className="text-sm text-destructive mt-1">{fieldError.message}</p>
      )}
    </div>
  );

  // Render default text input
  const renderTextInputField = (field: FormField, config: FieldConfig, isRequired: boolean, fieldError: FieldError | undefined) => (
    <div key={field.id}>
      <Label htmlFor={field.id}>{config.label} {isRequired && '*'}</Label>
      <Input
        id={field.id}
        {...register(field.id)}
        placeholder={config.placeholder}
      />
      {fieldError && (
        <p className="text-sm text-destructive mt-1">{fieldError.message}</p>
      )}
    </div>
  );

  // Render form fields with exact labels from main branch
  const renderFormField = (field: FormField) => {
    const isRequired = field.id !== 'employee_referral_code';
    const fieldError = errors[field.id as keyof typeof errors];
    const config = getFieldConfig(field.id, field.name);

    // Dropdown fields
    if (field.type === 'dropdown') {
      return renderDropdownField(field, config, isRequired, fieldError);
    }

    // Email fields
    if (field.id === 'email_official' || field.id === 'email_personal') {
      return renderEmailField(field, config, isRequired, fieldError);
    }

    // Default text input
    return renderTextInputField(field, config, isRequired, fieldError);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Render all form fields dynamically */}
      {formFields.map(renderFormField)}

      {/* Resume upload (always present) */}
      <div>
        <Label htmlFor="resume">Add Resume (PDF) *</Label>
        <div className="mt-1">
          <Input
            id="resume"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {resumeFile && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {resumeFile.name}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Submit Application
          </>
        )}
      </Button>
    </form>
  );
}