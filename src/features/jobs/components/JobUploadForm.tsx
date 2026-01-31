import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

const jobSchema = z.object({
  domain: z.string().min(2, 'Domain must be at least 2 characters'),
  organisation_name: z.string().min(2, 'Organisation name must be at least 2 characters'),
  about: z.string().optional(),
  job_description: z.string().min(10, 'Job description must be at least 10 characters'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  compensation_range: z.string().optional(),
  apply_by: z.string().optional(),
});

type JobData = z.infer<typeof jobSchema>;

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description?: string;
  pdf_url?: string;
  status: string;
  created_at: string;
  created_by: string;
}

interface JobUploadFormProps {
  jobToEdit?: Job | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function JobUploadForm({ jobToEdit, onSuccess, onCancel }: JobUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobData>({
    resolver: zodResolver(jobSchema),
    defaultValues: jobToEdit ? {
      domain: (jobToEdit as any).domain || '',
      organisation_name: (jobToEdit as any).organisation_name || '',
      about: (jobToEdit as any).about || '',
      job_description: (jobToEdit as any).job_description || '',
      position: (jobToEdit as any).position || '',
      location: jobToEdit.location,
      compensation_range: (jobToEdit as any).compensation_range || '',
      apply_by: (jobToEdit as any).apply_by || '',
    } : undefined
  });

  // Delete old PDF from storage (extract filename from URL)
  const deleteOldPdfFromStorage = async (pdfUrl: string) => {
    try {
      const fileName = pdfUrl.split('/job-pdfs/')[1]?.split('?')[0];
      if (fileName) {
        await supabase.storage.from('job-pdfs').remove([fileName]);
      }
    } catch (error) {
      console.warn('Failed to delete old PDF:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file extension
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (fileExtension !== 'pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only. Only .pdf files are allowed.",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Check MIME type
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only. Only .pdf files are allowed.",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      setPdfFile(file);
    }
  };

  const onSubmit = async (data: JobData) => {
    setIsSubmitting(true);

    try {
      let pdfUrl = null;

      // Delete old PDF if updating with a new file
      if (pdfFile && jobToEdit && jobToEdit.pdf_url) {
        await deleteOldPdfFromStorage(jobToEdit.pdf_url);
      }

      // Upload PDF if provided
      if (pdfFile) {
        const fileName = `${Date.now()}-${pdfFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('job-pdfs')
          .upload(fileName, pdfFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('job-pdfs')
          .getPublicUrl(fileName);

        pdfUrl = publicUrl;
      }

      // Create or update job posting
      const jobData: {
        domain: string;
        organisation_name: string;
        about?: string;
        job_description: string;
        position: string;
        location: string;
        compensation_range?: string;
        apply_by?: string;
        pdf_url?: string;
      } = {
        domain: data.domain,
        organisation_name: data.organisation_name,
        about: data.about,
        job_description: data.job_description,
        position: data.position,
        location: data.location,
        compensation_range: data.compensation_range,
        apply_by: data.apply_by ? new Date(data.apply_by).toISOString().split('T')[0] : undefined,
      };

      // Handle PDF URL: use new URL if uploaded, otherwise preserve existing
      if (pdfUrl) {
        jobData.pdf_url = pdfUrl;
      } else if (jobToEdit && jobToEdit.pdf_url) {
        // Preserve existing PDF URL when updating without new file
        jobData.pdf_url = jobToEdit.pdf_url;
      }

      let jobError;
      if (jobToEdit) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobToEdit.id);
        jobError = error;
      } else {
        // Create new job
        const { error } = await supabase
          .from('jobs')
          .insert({
            ...jobData,
            status: 'active',
          });
        jobError = error;
      }

      if (jobError) throw jobError;

      toast({
        title: "Success",
        description: jobToEdit ? "Job updated successfully" : "Job posted successfully",
      });

      reset();
      setPdfFile(null);
      onSuccess();

    } catch (error: unknown) {
      console.error('Job creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="domain">Domain *</Label>
        <Input
          id="domain"
          {...register('domain')}
          placeholder="e.g. Education, Health, Technology"
        />
        {errors.domain && (
          <p className="text-sm text-destructive mt-1">{errors.domain.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="organisation_name">Name of the Organisation *</Label>
        <Input
          id="organisation_name"
          {...register('organisation_name')}
          placeholder="Enter organisation name"
        />
        {errors.organisation_name && (
          <p className="text-sm text-destructive mt-1">{errors.organisation_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="about">About</Label>
        <Textarea
          id="about"
          {...register('about')}
          placeholder="About the organisation..."
          rows={3}
        />
        {errors.about && (
          <p className="text-sm text-destructive mt-1">{errors.about.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="job_description">Job Description *</Label>
        <Textarea
          id="job_description"
          {...register('job_description')}
          placeholder="Detailed job description..."
          rows={6}
        />
        {errors.job_description && (
          <p className="text-sm text-destructive mt-1">{errors.job_description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="position">Position *</Label>
        <Input
          id="position"
          {...register('position')}
          placeholder="e.g. Program Manager, Fellow"
        />
        {errors.position && (
          <p className="text-sm text-destructive mt-1">{errors.position.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          {...register('location')}
          placeholder="e.g. New Delhi, Mumbai"
        />
        {errors.location && (
          <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="compensation_range">Compensation Range</Label>
        <Input
          id="compensation_range"
          {...register('compensation_range')}
          placeholder="e.g. ₹5,00,000 - ₹8,00,000 per annum"
        />
        {errors.compensation_range && (
          <p className="text-sm text-destructive mt-1">{errors.compensation_range.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="apply_by">Apply by (Deadline)</Label>
        <Input
          id="apply_by"
          type="date"
          {...register('apply_by')}
        />
        {errors.apply_by && (
          <p className="text-sm text-destructive mt-1">{errors.apply_by.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="pdf">Upload JD - PDF</Label>
        <div className="mt-1">
          <Input
            id="pdf"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {pdfFile && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {pdfFile.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {jobToEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {jobToEdit ? 'Update Job' : 'Create Job'}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}