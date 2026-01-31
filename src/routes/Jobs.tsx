import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabaseAnon } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building, Calendar, Shield, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { formatDate } from '@/shared/lib/date';

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

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'domain' | 'position'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      const { data, error } = await supabaseAnon
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.job_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.organisation_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = !domainFilter || job.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  // Sort filtered jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
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

  const domains = [...new Set(jobs.map(job => job.domain))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading jobs...</div>
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
          <div className="flex items-center justify-between mb-8 md:mb-16 gap-4">
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
          
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Find Your Next Career
            </h1>
            <p className="text-xl opacity-95">Shaping leaders who transform themselves, their communities, and the nation</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="md:flex md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All Domains</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>
          
          {/* Sorting Controls */}
          <div className="flex gap-4 items-center">
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
        </div>

        {/* Jobs Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sortedJobs.map((job) => (
            <Card key={job.id} className="group hover:shadow-2xl transition-all duration-300 border border-primary-100 bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-3 text-primary-700 group-hover:text-secondary-600 transition-colors duration-300">
                      {job.position}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mb-2 text-primary-600">
                      <div className="h-5 w-5 rounded-md bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center">
                        <Building className="h-3 w-3 text-white" />
                      </div>
                      {job.organisation_name} � {job.domain}
                    </CardDescription>
                    <CardDescription className="flex items-center gap-2 text-primary-600">
                      <div className="h-5 w-5 rounded-md bg-gradient-to-br from-secondary-500 to-secondary-400 flex items-center justify-center">
                        <MapPin className="h-3 w-3 text-white" />
                      </div>
                      {job.location}
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-br from-secondary-500 to-secondary-400 text-white hover:from-secondary-600 hover:to-secondary-500 shadow-md">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {job.job_description && (
                  <p className="text-primary-600 mb-6 line-clamp-3 leading-relaxed">
                    {job.job_description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-primary-500">
                    <div className="h-4 w-4 rounded bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center">
                      <Calendar className="h-2.5 w-2.5 text-white" />
                    </div>
                    {formatDate(job.created_at)}
                  </div>
                  <Button asChild className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-md">
                    <Link to={`/jobs/${job.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedJobs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              {searchTerm || domainFilter 
                ? "Try adjusting your search criteria" 
                : "No active job postings at the moment"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}