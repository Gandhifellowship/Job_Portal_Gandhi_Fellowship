import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabaseAnon } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { formatDate } from '@/shared/lib/date';
import ApplicationForm from '@/features/applications/components/ApplicationForm';

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
  created_at: string;
  status: string;
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplication, setShowApplication] = useState(false);
  const { toast } = useToast();

  const fetchJob = useCallback(async () => {
    try {
      const { data, error } = await supabaseAnon
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setJob(data);
    } catch {
      toast({
        title: "Error",
        description: "Job not found or no longer active",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id, fetchJob]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="text-muted-foreground">This job posting is no longer available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-secondary-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white shadow-xl">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Logo and Admin Button */}
          <div className="flex items-center justify-between mb-6 md:mb-8 gap-4">
            {/* Logo */}
            <Link to="/" className="group flex-shrink-0">
              <div className="bg-white rounded-lg px-2 py-2 md:px-4 md:py-3 shadow-md">
                <img 
                  src="/gandhi-fellowship-logo.png" 
                  alt="Gandhi Fellowship Logo" 
                  className="h-12 md:h-20 lg:h-24 group-hover:scale-105 transition-transform duration-200"
                  style={{ aspectRatio: 'auto' }}
                />
              </div>
            </Link>
            
            {/* Admin Button */}
            <Link 
              to="/admin/login" 
              className="flex items-center space-x-1 md:space-x-2 text-white/90 hover:text-white transition-colors duration-200 flex-shrink-0"
            >
              <Shield className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-lg font-medium hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border border-primary-100 bg-white">
              <CardHeader className="pb-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-4xl mb-6 text-primary-700 font-bold">
                      {job.position}
                    </CardTitle>
                    <div className="space-y-3">
                      <CardDescription className="flex items-center gap-3 text-lg text-primary-600">
                        <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center">
                          <Building className="h-4 w-4 text-white" />
                        </div>
                        {job.organisation_name} • {job.domain}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-3 text-lg text-primary-600">
                        <div className="h-6 w-6 rounded-md bg-gradient-to-br from-secondary-500 to-secondary-400 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        {job.location}
                      </CardDescription>
                      <CardDescription className="flex items-center gap-3 text-primary-500">
                        <div className="h-5 w-5 rounded bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-white" />
                        </div>
                        Posted {formatDate(job.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-br from-secondary-500 to-secondary-400 text-white text-lg px-4 py-2 shadow-md">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {job.about && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">About the Organisation</h3>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{job.about}</p>
                    </div>
                  </div>
                )}
                {job.job_description && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{job.job_description}</p>
                    </div>
                  </div>
                )}
                {job.compensation_range && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Compensation Range</h3>
                    <p className="text-lg">{job.compensation_range}</p>
                  </div>
                )}
                {job.apply_by && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Apply by</h3>
                    <p className="text-lg">{new Date(job.apply_by).toLocaleDateString()}</p>
                  </div>
                )}

                {job.pdf_url && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Job Details</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src={job.pdf_url}
                        width="100%"
                        height="1200"
                        title="Job Description PDF"
                        className="border-0"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-xl border border-secondary-200 bg-gradient-to-br from-secondary-50 to-accent-50">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl text-primary-700 mb-3">Apply for this Position</CardTitle>
                <CardDescription className="text-primary-600">
                  Ready to join our team? Submit your application below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showApplication ? (
                  <Button 
                    onClick={() => setShowApplication(true)}
                    className="w-full"
                    size="lg"
                  >
                    Apply Now
                  </Button>
                ) : (
                  <ApplicationForm 
                    jobId={job.id} 
                    onSuccess={() => setShowApplication(false)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}