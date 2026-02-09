import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel, generateFilename } from '@/shared/lib/export';
import { formatDateTime, formatDate } from '@/shared/lib/date';

import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useUserRole } from '@/features/auth/hooks/useUserRole';
import { useToast } from '@/shared/hooks/use-toast';
import { 
  Plus, 
  Users, 
  Briefcase, 
  Eye, 
  EyeOff, 
  Download,
  ExternalLink,
  Trash2,
  ArrowUpDown,
  Filter,
  PenSquare,
  Search,
  Settings,
  UserCog,
  Archive
} from 'lucide-react';
import JobUploadForm from '@/features/jobs/components/JobUploadForm';
import { ApplicationGridView } from '@/features/admin/components/ApplicationGridView';
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { useApplicationGrid } from '@/features/applications/hooks/useApplicationGrid';
import { UserManagement } from '@/features/admin/components/UserManagement';
import { JobAssignments } from '@/features/admin/components/JobAssignments';
import { ChangePassword } from '@/features/auth/components/ChangePassword';
import ApplicationCard from '@/features/admin/components/ApplicationCard';

interface Job {
  id: string;
  domain: string;
  organisation_name: string;
  about?: string;
  job_description?: string;
  position: string;
  location: string;
  compensation_range?: string;
  pdf_url?: string;
  apply_by?: string;
  status: string;
  created_at: string;
  created_by: string;
  isDeleting?: boolean;
}

interface Application {
  id: string;
  full_name: string;
  batch: string;
  gender: string;
  email_official: string;
  email_personal: string;
  phone_number: string;
  big_bet?: string;
  fellowship_state?: string;
  home_state?: string;
  fpc_name?: string;
  state_spoc_name?: string;
  resume_url?: string;
  applied_at: string;
  status: string;
  reference_number: string;
  job: {
    position: string;
    organisation_name: string;
    domain: string;
    location?: string;
    apply_by?: string;
  };
  custom_admin_fields?: {
    values: Record<string, string>;
  };
}

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'domain' | 'position'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Application filters and sorting
  const [applicationFilters, setApplicationFilters] = useState({
    positions: [] as string[],
    applicantName: '',
    searchByFields: '', // Batch, Phone, Fellowship State, Home State, Big Bet
    gender: [] as string[],
    customFields: {} as Record<string, string[]> // Dynamic custom field filters
  });
  const [appSortBy, setAppSortBy] = useState<'date' | 'name' | 'position'>('date');
  const [appSortOrder, setAppSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedCoverLetters, setExpandedCoverLetters] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; jobId: string | null }>({
    open: false,
    jobId: null
  });
  const [archiveConfirm, setArchiveConfirm] = useState<{ open: boolean; jobId: string | null }>({
    open: false,
    jobId: null
  });
  const [deleteAppConfirm, setDeleteAppConfirm] = useState<{ open: boolean; applicationId: string | null }>({
    open: false,
    applicationId: null
  });
  const [archiveAppConfirm, setArchiveAppConfirm] = useState<{ open: boolean; applicationId: string | null }>({
    open: false,
    applicationId: null
  });
  // Get admin columns for dynamic filters (must be called before conditional returns)
  const { adminColumns = [] } = useApplicationGrid();
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isManager, assignedJobs, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      // Fetch jobs
      // Fetch jobs (can use public client)
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Fetch applications with role-based filtering
      let applicationsQuery = supabase
        .from('applications')
        .select(`
          *,
          job:jobs(position, organisation_name, domain, location, apply_by)
        `)
        .order('applied_at', { ascending: false });

      // If user is a manager, filter by assigned jobs
      if (isManager && !isAdmin && assignedJobs.length > 0) {
        applicationsQuery = applicationsQuery.in('job_id', assignedJobs);
      }

      const { data: applicationsData, error: applicationsError } = await applicationsQuery;

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);
    } catch (error: unknown) {
      console.error('Fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch data";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, isAdmin, isManager, assignedJobs]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    } else if (user && !roleLoading) {
      fetchData();
    }
  }, [user, authLoading, roleLoading, navigate, fetchData]);

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;
      
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      
      toast({
        title: "Success",
        description: `Job ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };


  // Helper function to delete PDF from storage
  const deleteResumeFromStorage = async (resumeUrl: string) => {
        try {
          // Extract the file path from the URL
      const url = new URL(resumeUrl);
          
          // Extract file path without bucket name
          let filePath = url.pathname.split('/storage/v1/object/public/')[1];
          if (!filePath) {
            filePath = url.pathname.split('/storage/v1/object/')[1];
          }
          if (!filePath) {
            filePath = url.pathname.replace('/storage/v1/object/public/', '');
          }
          
          // Remove bucket name from path (e.g., "resumes/filename.pdf" -> "filename.pdf")
          if (filePath && filePath.startsWith('resumes/')) {
            filePath = filePath.replace('resumes/', '');
          }
          
          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from('resumes')
              .remove([filePath]);
            
            if (storageError) {
              console.warn('Failed to delete PDF from storage:', storageError);
              // Continue with database deletion even if storage deletion fails
            }
          }
        } catch (storageError) {
          console.warn('Error processing PDF deletion:', storageError);
          // Continue with database deletion
        }
  };

  const deleteApplication = useCallback(async (applicationId: string) => {
    try {
      // First, get the application to find the resume URL
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Delete the PDF file from Supabase storage if it exists
      if (application.resume_url) {
        await deleteResumeFromStorage(application.resume_url);
      }

      // Delete the application from the database
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      // Remove from local state
      setApplications(applications.filter(app => app.id !== applicationId));

      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    }
  }, [applications, toast]);

  const handleDeleteClick = useCallback((jobId: string) => {
    setDeleteConfirm({ open: true, jobId });
  }, []);

  const handleArchiveClick = useCallback((jobId: string) => {
    setArchiveConfirm({ open: true, jobId });
  }, []);

  const handleDeleteAppClick = useCallback((applicationId: string) => {
    setDeleteAppConfirm({ open: true, applicationId });
  }, []);

  const handleArchiveAppClick = useCallback((applicationId: string) => {
    setArchiveAppConfirm({ open: true, applicationId });
  }, []);

  const deleteApplicationConfirm = useCallback(async () => {
    if (!deleteAppConfirm.applicationId) return;

    const applicationId = deleteAppConfirm.applicationId;
    setDeleteAppConfirm({ open: false, applicationId: null });

    await deleteApplication(applicationId);
  }, [deleteAppConfirm.applicationId, deleteApplication]);

  const archiveApplicationConfirm = useCallback(async () => {
    if (!archiveAppConfirm.applicationId) return;

    const applicationId = archiveAppConfirm.applicationId;

    try {
      // Archive the application
      const { error } = await supabase
        .from('applications')
        .update({ archived: true })
        .eq('id', applicationId);

      if (error) throw error;

      // Remove from applications list
      setApplications(applications.filter(app => app.id !== applicationId));

      setArchiveAppConfirm({ open: false, applicationId: null });

      toast({
        title: "Success",
        description: "Application has been archived",
      });
    } catch (error: Error) {
      console.error('Archive application error:', error);
      toast({
        title: "Error",
        description: "Failed to archive application",
        variant: "destructive",
      });
    }
  }, [archiveAppConfirm.applicationId, applications, toast]);

  const deleteJob = useCallback(async () => {
    if (!deleteConfirm.jobId) return;

    const jobId = deleteConfirm.jobId;
    setDeleteConfirm({ open: false, jobId: null });

    // Show loading state immediately
    const jobToDelete = jobs.find(job => job.id === jobId);
    if (jobToDelete) {
      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, isDeleting: true }
          : job
      ));
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      
      // Remove from state
      setJobs(jobs.filter(job => job.id !== jobId));
      
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch {
      // Restore job if deletion failed
      if (jobToDelete) {
        setJobs(jobs.map(job => 
          job.id === jobId 
            ? { ...jobToDelete, isDeleting: false }
            : job
        ));
      }
      
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  }, [deleteConfirm.jobId, jobs, toast]);

  const archiveJob = useCallback(async () => {
    if (!archiveConfirm.jobId) return;

    const jobId = archiveConfirm.jobId;
    const jobToArchive = jobs.find(job => job.id === jobId);

    // Show loading state immediately
    if (jobToArchive) {
      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, isDeleting: true }
          : job
      ));
    }

    try {
      // Archive the job by setting status to 'archived'
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ status: 'archived' })
        .eq('id', jobId);

      if (jobError) throw jobError;

      // Archive all applications for this job
      const { error: appError } = await supabase
        .from('applications')
        .update({ archived: true })
        .eq('job_id', jobId);

      if (appError) throw appError;

      // Remove from jobs list and refresh applications
      setJobs(jobs.filter(job => job.id !== jobId));
      await fetchData();

      setArchiveConfirm({ open: false, jobId: null });

      toast({
        title: "Success",
        description: "Job and all applications have been archived",
      });
    } catch (error: Error) {
      console.error('Archive error:', error);
      
      // Reset loading state
      if (jobToArchive) {
        setJobs(jobs.map(job => 
          job.id === jobId 
            ? { ...job, isDeleting: false }
            : job
        ));
      }

      toast({
        title: "Error",
        description: "Failed to archive job",
        variant: "destructive",
      });
    }
  }, [archiveConfirm.jobId, jobs, toast, fetchData]);

  // Helper function to get options for custom dropdown fields (must be before conditional returns)
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



  // Update all custom fields for an application (Edit/Save pattern)
  const updateAllCustomFields = useCallback(async (applicationId: string, allFields: Record<string, string>) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          custom_admin_fields: {
            values: allFields
          }
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating custom fields:', error);
        toast({
          title: "Error",
          description: "Failed to update custom fields",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? {
              ...app,
              custom_admin_fields: {
                values: allFields
              }
            }
          : app
      ));

      toast({
        title: "Success",
        description: "Custom fields updated successfully",
      });
    } catch (error) {
      console.error('Error updating custom fields:', error);
      toast({
        title: "Error",
        description: "Failed to update custom fields",
        variant: "destructive",
      });
    }
  }, [toast]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading dashboard...</p>
          <p className="text-sm text-muted-foreground mt-2">
            {authLoading ? 'Checking authentication...' : 'Fetching data...'}
          </p>
        </div>
      </div>
    );
  }

  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const totalApplications = applications.length;

  // Sort jobs based on selected criteria
  const sortedJobs = [...jobs].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'domain':
        comparison = a.domain.localeCompare(b.domain);
        break;
      case 'position':
        comparison = a.position.localeCompare(b.position);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Helper function to check if application matches filters
  const applicationMatchesFilters = (app: Application) => {
      // Filter by positions (multi-select)
      if (applicationFilters.positions.length > 0 && !applicationFilters.positions.includes(app.job.position)) {
        return false;
      }
      // Filter by applicant name (search)
      if (applicationFilters.applicantName && !app.full_name.toLowerCase().includes(applicationFilters.applicantName.toLowerCase())) {
        return false;
      }
      // Filter by Gender (default dropdown)
      if (applicationFilters.gender.length > 0) {
        const appGender = (app as Application & { gender?: string }).gender ?? '';
        const sel = applicationFilters.gender;
        const showBlank = sel.includes('__BLANK__') && !String(appGender).trim();
        const showMatch = sel.filter(v => v !== '__BLANK__').includes(appGender);
        if (!showBlank && !showMatch) return false;
      }
      // Search across Batch, Phone, Fellowship State, Home State, Big Bet
      if (applicationFilters.searchByFields.trim()) {
        const q = applicationFilters.searchByFields.toLowerCase().trim();
        const batch = (app as Application & { batch?: string }).batch ?? '';
        const phone = (app as Application & { phone_number?: string }).phone_number ?? '';
        const fellowshipState = (app as Application & { fellowship_state?: string }).fellowship_state ?? '';
        const homeState = (app as Application & { home_state?: string }).home_state ?? '';
        const bigBet = (app as Application & { big_bet?: string }).big_bet ?? '';
        const matches = [batch, phone, fellowshipState, homeState, bigBet].some(f => f && String(f).toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Filter by job: Organisation name, Domain, Location, Apply by
      if (applicationFilters.organisationName.trim()) {
        const org = (app.job as { organisation_name?: string }).organisation_name ?? '';
        if (!org.toLowerCase().includes(applicationFilters.organisationName.toLowerCase().trim())) return false;
      }
      if (applicationFilters.domain.trim()) {
        const d = app.job.domain ?? '';
        if (!d.toLowerCase().includes(applicationFilters.domain.toLowerCase().trim())) return false;
      }
      if (applicationFilters.location.trim()) {
        const loc = (app.job as { location?: string }).location ?? '';
        if (!loc.toLowerCase().includes(applicationFilters.location.toLowerCase().trim())) return false;
      }
      if (applicationFilters.applyBy) {
        const applyBy = (app.job as { apply_by?: string }).apply_by ?? '';
        const jobDate = applyBy ? applyBy.split('T')[0] : '';
        if (jobDate !== applicationFilters.applyBy) return false;
      }
    // Filter by custom fields (dynamic)
    for (const [fieldId, selectedValues] of Object.entries(applicationFilters.customFields)) {
      if (selectedValues.length > 0) {
        const fieldValue = app.custom_admin_fields?.values?.[fieldId];
        
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
  };

  // Helper function to compare applications for sorting
  const compareApplications = (a: Application, b: Application) => {
      let comparison = 0;
      
      switch (appSortBy) {
        case 'date':
          comparison = new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime();
          break;
        case 'name':
          comparison = a.full_name.localeCompare(b.full_name);
          break;
        case 'position':
          comparison = a.job.position.localeCompare(b.job.position);
          break;
      }
      
      return appSortOrder === 'asc' ? comparison : -comparison;
  };

  // Filter and sort applications
  const filteredAndSortedApplications = [...applications]
    .filter(applicationMatchesFilters)
    .sort(compareApplications);

  // Get unique job titles for filter dropdown
  const uniqueJobTitles = [...new Set(applications.map(app => app.job.position))].sort();

  // Create options for multi-select components
  const positionOptions: MultiSelectOption[] = uniqueJobTitles.map(title => ({
    label: title,
    value: title
  }));

  const genderOptions: MultiSelectOption[] = [
    { label: 'Blank (Not Assigned)', value: '__BLANK__' },
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
    { label: 'Prefer not to say', value: 'Prefer not to say' }
  ];

  // Toggle cover letter expansion
  const toggleCoverLetter = (applicationId: string) => {
    const newExpanded = new Set(expandedCoverLetters);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedCoverLetters(newExpanded);
  };

  // Download applications as Excel
  const downloadApplicationsAsExcel = () => {
    // Prepare data for Excel
    const excelData = filteredAndSortedApplications.map(app => ({
      'Full Name': app.full_name,
      'Batch': app.batch,
      'Gender': app.gender,
      'Email Official': app.email_official,
      'Email Personal': app.email_personal,
      'Phone Number': app.phone_number,
      'Big Bet': app.big_bet || '',
      'Fellowship State': app.fellowship_state || '',
      'Home State': app.home_state || '',
      'FPC Name': app.fpc_name || '',
      'State SPOC Name': app.state_spoc_name || '',
      'Position': app.job.position,
      'Organisation': app.job.organisation_name,
      'Domain': app.job.domain,
      'Resume Link': app.resume_url || '',
      'Status': app.status,
      'Applied At': formatDateTime(app.applied_at),
    }));

    // Export to Excel using shared utility
    const filename = generateFilename('applications');
    exportToExcel(excelData, filename, 'Applications');
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(''), 2000);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
        duration: 2000,
      });
    }).catch((err) => {
      console.error('Failed to copy:', err);
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-secondary-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                Admin Dashboard
              </h1>
              <p className="opacity-95 text-lg">Manage jobs and applications for Gandhi Fellowship</p>
            </div>
            <Button onClick={signOut} variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-6 py-3">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats */}
        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <Card className="shadow-xl border border-primary-200 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-700">{activeJobs}</p>
                  <p className="text-primary-600 font-medium">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-xl border border-secondary-200 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-gradient-to-br from-secondary-500 via-secondary-400 to-secondary-300 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-700">{totalApplications}</p>
                  <p className="text-primary-600 font-medium">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={isAdmin ? "jobs" : "applications"} className="space-y-6 w-full">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsList className="inline-flex w-max min-w-full md:min-w-0 md:w-auto">
              {isAdmin && <TabsTrigger value="jobs" className="whitespace-nowrap flex-shrink-0">Job Management</TabsTrigger>}
              <TabsTrigger value="applications" className="whitespace-nowrap flex-shrink-0">Applications List</TabsTrigger>
              <TabsTrigger value="applications-grid" className="whitespace-nowrap flex-shrink-0">Applications Grid</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="user-management" className="whitespace-nowrap flex-shrink-0">
                  <UserCog className="h-4 w-4 mr-2" />
                  User Management
                </TabsTrigger>
              )}
              {isAdmin && (
                <TabsTrigger value="job-assignments" className="whitespace-nowrap flex-shrink-0">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Job Assignments
                </TabsTrigger>
              )}
              <TabsTrigger value="user-settings" className="whitespace-nowrap flex-shrink-0">
                <Settings className="h-4 w-4 mr-2" />
                User Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {isAdmin && (
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Jobs</h2>
              <Button onClick={() => setShowJobForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Job
              </Button>
            </div>

            {/* Sorting Controls */}
            <div className="flex gap-4 mb-6 items-center">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'domain' | 'position')}
                className="px-3 py-2 border border-primary-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="date">Posting Date</option>
                <option value="domain">Domain</option>
                <option value="position">Position</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-3 py-2 border border-primary-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {showJobForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</CardTitle>
                  <CardDescription>{editingJob ? 'Update the job posting details' : 'Fill in the details for the new job posting'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <JobUploadForm
                    jobToEdit={editingJob}
                    onSuccess={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                      fetchData();
                    }}
                    onCancel={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              {sortedJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{job.position}</h3>
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-1">{job.organisation_name} • {job.domain} • {job.location}</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Created {formatDate(job.created_at)}
                        </p>
                        {job.description && (
                          <p className="text-sm line-clamp-2 mb-4">{job.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {job.pdf_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={job.pdf_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleJobStatus(job.id, job.status)}
                          title={job.status === 'active' ? 'Hide job from public view' : 'Show job to public'}
                        >
                          {job.status === 'active' ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingJob(job);
                            setShowJobForm(true);
                          }}
                          title="Edit job"
                        >
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <button
                          onClick={() => handleArchiveClick(job.id)}
                          title="Archive job and applications"
                          disabled={job.isDeleting}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {job.isDeleting ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(job.id)}
                          title="Delete job"
                          disabled={job.isDeleting}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {job.isDeleting ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          )}

          <TabsContent value="applications" className="space-y-6 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Applications</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadApplicationsAsExcel}
                className="flex items-center gap-2 w-fit"
              >
                <Download className="h-4 w-4" />
                Download Excel
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Sort by:</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <select
                    value={appSortBy}
                    onChange={(e) => setAppSortBy(e.target.value as 'date' | 'name' | 'position')}
                    className="border rounded px-3 py-1.5 text-sm min-w-[160px] max-w-[200px] bg-white"
                  >
                    <option value="date">Application Date</option>
                    <option value="name">Name</option>
                    <option value="position">Position</option>
                  </select>

                  <select
                    value={appSortOrder}
                    onChange={(e) => setAppSortOrder(e.target.value as 'asc' | 'desc')}
                    className="border rounded px-3 py-1.5 text-sm min-w-[140px] max-w-[180px] bg-white"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>{/* Application Filters and Sorting */}
            <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
              {/* Row 1: Applicant & search filters */}
              <div className="flex flex-wrap gap-3 items-center mb-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Filter className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">Filters</span>
                </div>
                <div className="relative flex-[1_1_180px] min-w-0 max-w-[260px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="Applicant name..."
                    value={applicationFilters.applicantName}
                    onChange={(e) => setApplicationFilters(prev => ({ ...prev, applicantName: e.target.value }))}
                    className="pl-9 h-9 w-full min-w-0"
                  />
                </div>
                <div className="flex-[1_1_140px] min-w-0 max-w-[200px]">
                  <MultiSelect
                    options={positionOptions}
                    selected={applicationFilters.positions}
                    onChange={(selected) => setApplicationFilters(prev => ({ ...prev, positions: selected }))}
                    placeholder="Position"
                    maxDisplay={1}
                  />
                </div>
                <div className="flex-[1_1_120px] min-w-0 max-w-[180px]">
                  <MultiSelect
                    options={genderOptions}
                    selected={applicationFilters.gender}
                    onChange={(selected) => setApplicationFilters(prev => ({ ...prev, gender: selected }))}
                    placeholder="Gender"
                    maxDisplay={1}
                  />
                </div>
                <div className="relative flex-[1_1_180px] min-w-0 max-w-[260px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="Batch, phone, states..."
                    value={applicationFilters.searchByFields}
                    onChange={(e) => setApplicationFilters(prev => ({ ...prev, searchByFields: e.target.value }))}
                    className="pl-9 h-9 w-full min-w-0"
                  />
                </div>
              </div>

              {/* Row 2: Job filters */}
              <div className="flex flex-wrap gap-3 items-center mb-4 pl-6 border-l-2 border-primary-100">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex-shrink-0">Job</span>
                <Input
                  placeholder="Organisation"
                  value={applicationFilters.organisationName}
                  onChange={(e) => setApplicationFilters(prev => ({ ...prev, organisationName: e.target.value }))}
                  className="flex-[1_1_140px] min-w-0 max-w-[200px] h-9"
                />
                <Input
                  placeholder="Domain"
                  value={applicationFilters.domain}
                  onChange={(e) => setApplicationFilters(prev => ({ ...prev, domain: e.target.value }))}
                  className="flex-[1_1_120px] min-w-0 max-w-[180px] h-9"
                />
                <Input
                  placeholder="Location"
                  value={applicationFilters.location}
                  onChange={(e) => setApplicationFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="flex-[1_1_120px] min-w-0 max-w-[180px] h-9"
                />
                <Input
                  type="date"
                  value={applicationFilters.applyBy}
                  onChange={(e) => setApplicationFilters(prev => ({ ...prev, applyBy: e.target.value }))}
                  className="flex-[1_1_140px] min-w-0 max-w-[180px] h-9 [color-scheme:light]"
                  title="Apply by date"
                />
              </div>

              {/* Row 3: Custom column filters */}
              {adminColumns.some(col => col.type === 'dropdown' && col.is_custom) && (
                <div className="flex flex-wrap gap-3 items-center mb-4 pl-6 border-l-2 border-primary-100">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex-shrink-0">Custom</span>
                  {adminColumns
                    .filter(col => col.type === 'dropdown' && col.is_custom)
                    .map(column => (
                      <div key={column.id} className="flex-[1_1_140px] min-w-0 max-w-[200px]">
                        <MultiSelect
                          options={getCustomFieldOptions(column.id)}
                          selected={applicationFilters.customFields[column.id] || []}
                          onChange={(selected) => {
                            setApplicationFilters(prev => ({
                              ...prev,
                              customFields: { ...prev.customFields, [column.id]: selected }
                            }));
                          }}
                          placeholder={column.name}
                          maxDisplay={1}
                        />
                      </div>
                    ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-border min-w-0">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ArrowUpDown className="h-4 w-4 text-brand-primary" />
                  <span className="text-sm font-medium text-brand-primary">Sort by</span>
                </div>
                <select
                  value={appSortBy}
                  onChange={(e) => setAppSortBy(e.target.value as 'date' | 'name' | 'position')}
                  className="px-3 py-2 h-9 border border-primary-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-w-0 max-w-full"
                >
                  <option value="date">Application Date</option>
                  <option value="name">Candidate Name</option>
                  <option value="position">Job Position</option>
                </select>
                <select
                  value={appSortOrder}
                  onChange={(e) => setAppSortOrder(e.target.value as 'asc' | 'desc')}
                  className="px-3 py-2 h-9 border border-primary-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-w-0 max-w-full"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              
              {(applicationFilters.positions.length > 0 || applicationFilters.applicantName || applicationFilters.gender.length > 0 || applicationFilters.searchByFields.trim() || applicationFilters.organisationName.trim() || applicationFilters.domain.trim() || applicationFilters.location.trim() || applicationFilters.applyBy || Object.values(applicationFilters.customFields).some(values => values.length > 0)) && (
                <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2 min-w-0">
                  <span className="text-sm text-muted-foreground flex-shrink-0">Active filters:</span>
                  {applicationFilters.positions.map(position => (
                    <Badge key={position} variant="secondary" className="text-xs max-w-[200px] truncate">
                      Position: {position}
                    </Badge>
                  ))}
                  {applicationFilters.applicantName && (
                    <Badge variant="secondary" className="text-xs max-w-[200px] truncate">
                      Name: {applicationFilters.applicantName}
                    </Badge>
                  )}
                  {applicationFilters.gender.length > 0 && applicationFilters.gender.map(v => (
                    <Badge key={v} variant="secondary" className="text-xs">
                      Gender: {v === '__BLANK__' ? 'Blank' : v}
                    </Badge>
                  ))}
                  {applicationFilters.searchByFields.trim() && (
                    <Badge variant="secondary" className="text-xs max-w-[200px] truncate">
                      Search: {applicationFilters.searchByFields}
                    </Badge>
                  )}
                  {applicationFilters.organisationName.trim() && (
                    <Badge variant="secondary" className="text-xs max-w-[200px] truncate">
                      Org: {applicationFilters.organisationName}
                    </Badge>
                  )}
                  {applicationFilters.domain.trim() && (
                    <Badge variant="secondary" className="text-xs max-w-[200px] truncate">
                      Domain: {applicationFilters.domain}
                    </Badge>
                  )}
                  {applicationFilters.location.trim() && (
                    <Badge variant="secondary" className="text-xs max-w-[200px] truncate">
                      Location: {applicationFilters.location}
                    </Badge>
                  )}
                  {applicationFilters.applyBy && (
                    <Badge variant="secondary" className="text-xs">
                      Apply by: {applicationFilters.applyBy}
                    </Badge>
                  )}
                  {Object.entries(applicationFilters.customFields).map(([fieldId, selectedValues]) => {
                    const column = adminColumns.find(col => col.id === fieldId);
                    return selectedValues.map(value => (
                      <Badge key={`${fieldId}-${value}`} variant="secondary" className="text-xs max-w-[200px] truncate">
                        {column?.name}: {value}
                      </Badge>
                    ));
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setApplicationFilters({ 
                      positions: [], 
                      applicantName: '',
                      searchByFields: '',
                      gender: [],
                      organisationName: '',
                      domain: '',
                      location: '',
                      applyBy: '',
                      customFields: {}
                    })}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid gap-6">
              {filteredAndSortedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  adminColumns={adminColumns}
                  copiedField={copiedField}
                  expandedCoverLetters={expandedCoverLetters}
                  onCopyToClipboard={copyToClipboard}
                  onToggleCoverLetter={toggleCoverLetter}
                  onUpdateAllCustomFields={updateAllCustomFields}
                  onArchiveApplication={handleArchiveAppClick}
                  onDeleteApplication={handleDeleteAppClick}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications-grid" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Applications Grid</h2>
            </div>
            <ApplicationGridView 
              applications={applications}
              onDeleteApplication={handleDeleteAppClick}
              onArchiveApplication={handleArchiveAppClick}
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="user-management" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
            </div>
            <UserManagement />
          </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="job-assignments" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Job Assignments</h2>
              </div>
              <JobAssignments />
            </TabsContent>
          )}

          <TabsContent value="user-settings" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Settings</h2>
            </div>
            <ChangePassword />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, jobId: null })}
        onConfirm={deleteJob}
        title="Delete Job"
        description="Are you sure you want to delete this job? This action cannot be undone."
      />

      {/* Archive Job Confirmation Dialog */}
      <ConfirmDialog
        open={archiveConfirm.open}
        onClose={() => setArchiveConfirm({ open: false, jobId: null })}
        onConfirm={archiveJob}
        title="Archive Job"
        description="Are you sure you want to archive this job? This will archive the job and all its applications. They will be hidden from the live view but can be restored later."
      />

      {/* Delete Application Confirmation Dialog */}
      <ConfirmDialog
        open={deleteAppConfirm.open}
        onClose={() => setDeleteAppConfirm({ open: false, applicationId: null })}
        onConfirm={deleteApplicationConfirm}
        title="Delete Application"
        description="Are you sure you want to delete this application? This will permanently remove the application data and the resume PDF file. This action cannot be undone."
      />

      {/* Archive Application Confirmation Dialog */}
      <ConfirmDialog
        open={archiveAppConfirm.open}
        onClose={() => setArchiveAppConfirm({ open: false, applicationId: null })}
        onConfirm={archiveApplicationConfirm}
        title="Archive Application"
        description="Are you sure you want to archive this application? It will be hidden from the live view but can be restored later."
      />
    </div>
  );
}