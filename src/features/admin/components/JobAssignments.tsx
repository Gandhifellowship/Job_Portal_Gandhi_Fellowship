import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserManagement } from '../hooks/useUserManagement';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, Filter, CheckCircle, XCircle, Briefcase } from 'lucide-react';

// User with details interface
interface UserWithDetails {
  user_id: string;
  name: string;
  email: string;
  role: string;
  employee_id: string | null;
  department: string | null;
  position: string | null;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
}

interface AssignmentMatrix {
  [userId: string]: {
    [jobId: string]: boolean;
  };
}

export function JobAssignments() {
  const { users, loading } = useUserManagement();
  
  // Local state for users with proper name/email data
  const [usersWithDetails, setUsersWithDetails] = useState<UserWithDetails[]>([]);
  
  // State for scalable job assignment
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assignmentMatrix, setAssignmentMatrix] = useState<AssignmentMatrix>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Bulk operations
  const [bulkOperation, setBulkOperation] = useState<'assign' | 'remove' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users with proper details
  const fetchUsersWithDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('user_job_access')
        .select(`
          user_id,
          name,
          email,
          role,
          employee_id,
          department,
          position
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by user_id to get unique users
      const userMap = new Map();
      data?.forEach(user => {
        if (!userMap.has(user.user_id)) {
          userMap.set(user.user_id, {
            user_id: user.user_id,
            name: user.name || 'User ' + user.user_id.substring(0, 8),
            email: user.email || user.user_id.substring(0, 8) + '...',
            role: user.role,
            employee_id: user.employee_id,
            department: user.department,
            position: user.position
          });
        }
      });
      
      setUsersWithDetails(Array.from(userMap.values()));
    } catch (error) {
      console.error('Error fetching users with details:', error);
    }
  };

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, department, location, status')
        .eq('status', 'active')
        .order('title');
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Fetch current assignments
  const fetchAssignments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_job_access')
        .select('user_id, job_id')
        .not('job_id', 'is', null);
      
      if (error) throw error;
      
      // Build assignment matrix
      const matrix: AssignmentMatrix = {};
      users.forEach(user => {
        matrix[user.user_id] = {};
        jobs.forEach(job => {
          matrix[user.user_id][job.id] = false;
        });
      });
      
      // Mark existing assignments
      data?.forEach(assignment => {
        if (matrix[assignment.user_id]) {
          matrix[assignment.user_id][assignment.job_id] = true;
        }
      });
      
      setAssignmentMatrix(matrix);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  }, [users, jobs]);

  useEffect(() => {
    fetchJobs();
    fetchUsersWithDetails();
  }, []);

  useEffect(() => {
    if (usersWithDetails.length > 0 && jobs.length > 0) {
      fetchAssignments();
    }
  }, [usersWithDetails, jobs, fetchAssignments]);

  // Filter users and jobs
  const filteredUsers = useMemo(() => {
    return usersWithDetails.filter(user => {
      const matchesSearch = userSearch === '' || 
        user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.employee_id?.toLowerCase().includes(userSearch.toLowerCase());
      
      const matchesRole = roleFilter === '' || user.role?.toLowerCase().includes(roleFilter.toLowerCase());
      
      return matchesSearch && matchesRole;
    });
  }, [usersWithDetails, userSearch, roleFilter]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = jobSearch === '' || 
        job.position.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.organisation_name.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.domain.toLowerCase().includes(jobSearch.toLowerCase());
      
      const matchesDepartment = departmentFilter === '' || job.domain?.toLowerCase().includes(departmentFilter.toLowerCase());
      
      return matchesSearch && matchesDepartment;
    });
  }, [jobs, jobSearch, departmentFilter]);


  // Handle individual assignment toggle
  const handleAssignmentToggle = async (userId: string, jobId: string, isAssigned: boolean) => {
    try {
      setIsLoading(true);
      
      if (isAssigned) {
        // Remove assignment - delete the specific user-job assignment
        const { error } = await supabase
          .from('user_job_access')
          .delete()
          .eq('user_id', userId)
          .eq('job_id', jobId);
        
        if (error) throw error;
      } else {
        // Add assignment - get user details from the base user record (where job_id IS NULL)
        const { data: baseUser, error: baseUserError } = await supabase
          .from('user_job_access')
          .select('name, email, role, employee_id, department, position')
          .eq('user_id', userId)
          .is('job_id', null)
          .single();
        
        if (baseUserError) {
          console.error('Error fetching base user:', baseUserError);
          throw new Error('User details not found');
        }
        
        const { error } = await supabase
          .from('user_job_access')
          .upsert({ 
            user_id: userId, 
            job_id: jobId,
            name: baseUser.name,
            email: baseUser.email,
            role: baseUser.role || 'manager',
            employee_id: baseUser.employee_id,
            department: baseUser.department,
            position: baseUser.position
          }, {
            onConflict: 'user_id,job_id'
          });
        
        if (error) throw error;
      }
      
      // Update local state
      setAssignmentMatrix(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [jobId]: !isAssigned
        }
      }));
      
      // Refresh assignments to get updated data
      await fetchAssignments();
      
    } catch (error) {
      console.error('Error updating assignment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk operations
  const handleBulkOperation = async () => {
    if (!bulkOperation || selectedUsers.length === 0 || selectedJobs.length === 0) return;
    
    try {
      setIsLoading(true);
      
      const operations = [];
      
      for (const userId of selectedUsers) {
        // Get base user details for each user
        const { data: baseUser, error: baseUserError } = await supabase
          .from('user_job_access')
          .select('name, email, role, employee_id, department, position')
          .eq('user_id', userId)
          .is('job_id', null)
          .single();
        
        if (baseUserError) {
          console.error('Error fetching base user for bulk operation:', baseUserError);
          continue;
        }
        
        for (const jobId of selectedJobs) {
          if (bulkOperation === 'assign') {
            operations.push(
              supabase
                .from('user_job_access')
                .upsert({ 
                  user_id: userId, 
                  job_id: jobId,
                  name: baseUser.name,
                  email: baseUser.email,
                  role: baseUser.role || 'manager',
                  employee_id: baseUser.employee_id,
                  department: baseUser.department,
                  position: baseUser.position
                }, {
                  onConflict: 'user_id,job_id'
                })
            );
          } else {
            operations.push(
              supabase
                .from('user_job_access')
                .delete()
                .eq('user_id', userId)
                .eq('job_id', jobId)
            );
          }
        }
      }
      
      await Promise.all(operations);
      
      // Refresh assignments
      await fetchAssignments();
      
      // Clear selections
      setSelectedUsers([]);
      setSelectedJobs([]);
      setBulkOperation(null);
      
    } catch (error) {
      console.error('Error in bulk operation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Select all users/jobs
  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.user_id));
    }
  };


  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Assignment Matrix
          </CardTitle>
          <CardDescription>
            Scalable job assignment management for {usersWithDetails.length} users and {jobs.length} jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{usersWithDetails.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{jobs.length}</div>
              <div className="text-sm text-muted-foreground">Active Jobs</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {Object.values(assignmentMatrix).reduce((total, userAssignments) => 
                  total + Object.values(userAssignments).filter(Boolean).length, 0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Assignments</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {selectedUsers.length > 0 && selectedJobs.length > 0 
                  ? selectedUsers.length * selectedJobs.length 
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Selected for Bulk</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="user-search">Search by User Name, Email, ID etc</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="user-search"
                  placeholder="Name, email, or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="job-search">Search by Job Posting</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="job-search"
                  placeholder="Job title or department..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="department-search">Search by Department</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="department-search"
                  placeholder="Search by department..."
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="pl-10"
                />
                {departmentFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setDepartmentFilter('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="role-search">Search by Internal Employee Role</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="role-search"
                  placeholder="Search by role..."
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10"
                />
                {roleFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setRoleFilter('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {(selectedUsers.length > 0 || selectedJobs.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Operations</CardTitle>
            <CardDescription>
              {selectedUsers.length} users × {selectedJobs.length} jobs = {selectedUsers.length * selectedJobs.length} operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Button
                onClick={() => setBulkOperation('assign')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Assign Selected
              </Button>
              <Button
                variant="outline"
                onClick={() => setBulkOperation('remove')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Remove Selected
              </Button>
              {bulkOperation && (
                <Button
                  onClick={handleBulkOperation}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? 'Processing...' : 'Execute'}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedUsers([]);
                  setSelectedJobs([]);
                  setBulkOperation(null);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Matrix</CardTitle>
          <CardDescription>
            Click checkboxes to assign/remove users from jobs. Use bulk operations for efficiency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading assignment matrix...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sticky left-0 bg-background border-r">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={selectAllUsers}
                        />
                        <span className="font-medium">Users</span>
                      </div>
                    </th>
                    {filteredJobs.map(job => (
                      <th key={job.id} className="text-center p-2 min-w-[120px] border-r">
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox
                            checked={selectedJobs.includes(job.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedJobs(prev => [...prev, job.id]);
                              } else {
                                setSelectedJobs(prev => prev.filter(id => id !== job.id));
                              }
                            }}
                          />
                          <div className="text-xs font-medium truncate max-w-[100px]" title={job.position}>
                            {job.position}
                          </div>
                          <div className="text-xs text-muted-foreground">{job.organisation_name} • {job.domain}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.user_id} className="border-b hover:bg-muted/50">
                      <td className="p-2 sticky left-0 bg-background border-r">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedUsers.includes(user.user_id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUsers(prev => [...prev, user.user_id]);
                              } else {
                                setSelectedUsers(prev => prev.filter(id => id !== user.user_id));
                              }
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-medium truncate" title={user.name || user.email}>
                              {user.name || user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">{user.role}</div>
                          </div>
                        </div>
                      </td>
                      {filteredJobs.map(job => (
                        <td key={job.id} className="text-center p-2 border-r">
                          <Checkbox
                            checked={assignmentMatrix[user.user_id]?.[job.id] || false}
                            onCheckedChange={() => 
                              handleAssignmentToggle(
                                user.user_id, 
                                job.id, 
                                assignmentMatrix[user.user_id]?.[job.id] || false
                              )
                            }
                            disabled={isLoading}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
