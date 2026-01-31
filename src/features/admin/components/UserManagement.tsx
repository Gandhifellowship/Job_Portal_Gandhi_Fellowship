import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUserManagement } from '../hooks/useUserManagement';
import { Plus, Trash2, Edit, Users, Mail, Briefcase as BriefcaseIcon, Filter, Search } from 'lucide-react';

// User interface for editing
interface UserForEdit {
  user_id: string;
  name: string;
  email: string;
  role: string;
  employee_id: string | null;
  department: string | null;
  position: string | null;
}

export function UserManagement() {
  const { users, loading, createUser, updateUser, deleteUser } = useUserManagement();
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    employeeId: '',
    department: '',
    position: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    employee_id: '',
    department: '',
    position: ''
  });

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [positionSearch, setPositionSearch] = useState('');

  // Helper function to check if user matches search criteria
  const userMatchesFilters = useCallback((user: UserForEdit) => {
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentSearch === '' || 
      user.department?.toLowerCase().includes(departmentSearch.toLowerCase());
    
    const matchesRole = roleSearch === '' || 
      user.role?.toLowerCase().includes(roleSearch.toLowerCase());
    
    const matchesPosition = positionSearch === '' || 
      user.position?.toLowerCase().includes(positionSearch.toLowerCase());

    return matchesSearch && matchesDepartment && matchesRole && matchesPosition;
  }, [searchTerm, departmentSearch, roleSearch, positionSearch]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(userMatchesFilters);
  }, [users, userMatchesFilters]);

  const handleEditUser = (user: UserForEdit) => {
    setEditingUser(user.user_id);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || '',
      employee_id: user.employee_id || '',
      department: user.department || '',
      position: user.position || ''
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    await updateUser(editingUser, {
      name: editFormData.name,
      email: editFormData.email,
      password: editFormData.password || undefined,
      role: editFormData.role,
      employee_id: editFormData.employee_id,
      department: editFormData.department,
      position: editFormData.position
    });
    
    setEditingUser(null);
    setEditFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      employee_id: '',
      department: '',
      position: ''
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      employee_id: '',
      department: '',
      position: ''
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createUser(createFormData);
    
    // Reset form and hide it
    setCreateFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      employeeId: '',
      department: '',
      position: ''
    });
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h2>
          <p className="text-muted-foreground">Manage users and their roles. Found {filteredUsers.length} users.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New User
          </Button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Add a new user to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-name">Name *</Label>
                  <Input
                    id="create-name"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-email">Email *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-password">Password *</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="create-role">Role *</Label>
                  <Input
                    id="create-role"
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Manager, HR, Recruiter"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-employee-id">Employee ID *</Label>
                  <Input
                    id="create-employee-id"
                    value={createFormData.employeeId}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-department">Department *</Label>
                  <Input
                    id="create-department"
                    value={createFormData.department}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, department: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-position">Position *</Label>
                  <Input
                    id="create-position"
                    value={createFormData.position}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, position: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  Create User
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter - Concise */}
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  value={departmentSearch}
                  onChange={(e) => setDepartmentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="role-search">Search by Internal Employee Role</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="role-search"
                  placeholder="Search by role..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="position-search">Search by Position</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="position-search"
                  placeholder="Search by position..."
                  value={positionSearch}
                  onChange={(e) => setPositionSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Users & Job Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div key={user.user_id} className="border rounded-lg p-4">
                  {editingUser === user.user_id ? (
                    // Edit Form
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editFormData.name}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={editFormData.email}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Password (leave empty to keep current password)</Label>
                        <Input
                          type="password"
                          value={editFormData.password}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter new password or leave empty"
                          minLength={6}
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input
                          value={editFormData.role}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Employee ID</Label>
                        <Input
                          value={editFormData.employee_id}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Input
                          value={editFormData.department}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          value={editFormData.position}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, position: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Assigned Jobs</Label>
                        <div className="p-3 bg-muted/50 rounded-lg border">
                          <div className="text-sm">
                            {user.job_title ? (
                              <div>
                                <div className="font-medium mb-1">Current Assignments:</div>
                                <div className="text-muted-foreground">{user.job_title}</div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground">No jobs assigned</div>
                            )}
                            <div className="text-xs text-muted-foreground mt-2 italic">
                              💡 Job assignments can be changed in the "Job Assignments" tab
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2 flex gap-2">
                        <Button onClick={handleUpdateUser} size="sm">
                          Save Changes
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 text-xs mb-1">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5">
                            {user.role}
                          </Badge>
                          <span className="font-medium text-sm truncate min-w-[80px]">{user.name || 'N/A'}</span>
                          <div className="flex items-center gap-1 text-muted-foreground min-w-[100px]">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <span className="text-muted-foreground min-w-[60px]">
                            <strong>ID:</strong> {user.employee_id || 'N/A'}
                          </span>
                          <span className="text-muted-foreground min-w-[80px]">
                            <strong>Dept:</strong> {user.department || 'N/A'}
                          </span>
                          <span className="text-muted-foreground min-w-[80px]">
                            <strong>Pos:</strong> {user.position || 'N/A'}
                          </span>
                        </div>
                        {user.job_title && (
                          <div className="flex items-start gap-1 text-muted-foreground text-xs">
                            <BriefcaseIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="break-words">
                              {user.job_title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteUser(user.user_id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
