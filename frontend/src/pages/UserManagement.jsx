import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Users, Shield, MoreHorizontal, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useUserManagement } from '@/hooks/useRoles';
import { useRoles } from '@/hooks/useRoles';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
const ROLE_COLORS = {
    admin: 'bg-red-500/10 text-red-500 border-red-500/20',
    manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    cashier: 'bg-green-500/10 text-green-500 border-green-500/20',
};
const ROLE_LABELS = {
    admin: 'Admin',
    manager: 'Manager',
    cashier: 'Cashier',
};
const ALL_ROLES = ['admin', 'manager', 'cashier'];
export default function UserManagement() {
    const { isAdmin, isLoading: rolesLoading } = useRoles();
    const { users, isLoading, fetchUsers, assignRole, removeRole } = useUserManagement();
    const session = useAppSelector((state) => state.auth.session);
    const currentUserId = session?.user?.id;
    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, fetchUsers]);
    
    const totalAdmins = users.filter(user => user.roles.includes('admin')).length;
    
    const canRemoveRole = (userId, role) => {
        
        if (role === 'admin') {
            
            if (totalAdmins <= 1) {
                return {
                    canRemove: false,
                    reason: 'Cannot remove the last admin role. Please assign admin role to another user first.'
                };
            }
            
            if (userId === currentUserId) {
                return {
                    canRemove: false,
                    reason: 'Cannot remove your own admin role. Please have another admin remove it.'
                };
            }
        }
        return { canRemove: true };
    };
    const handleAssignRole = async (userId, role) => {
        const result = await assignRole(userId, role);
        if (result.success) {
            toast.success(`Role "${ROLE_LABELS[role]}" assigned successfully`);
            fetchUsers();
        }
        else {
            toast.error(result.error || 'Failed to assign role');
        }
    };
    const handleRemoveRole = async (userId, role) => {
        
        const validation = canRemoveRole(userId, role);
        if (!validation.canRemove) {
            toast.error(validation.reason || 'Cannot remove this role');
            return;
        }
        const result = await removeRole(userId, role);
        if (result.success) {
            toast.success(`Role "${ROLE_LABELS[role]}" removed successfully`);
            fetchUsers();
        }
        else {
            toast.error(result.error || 'Failed to remove role');
        }
    };
    if (rolesLoading) {
        return (<div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>);
    }
    if (!isAdmin) {
        return <Navigate to="/dashboard" replace/>;
    }
    return (<div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and assign roles
        </p>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5"/>
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Badge className={ROLE_COLORS.admin}>Admin</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Full access to all features including user management, settings, and financial reports.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className={ROLE_COLORS.manager}>Manager</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Access to POS, inventory, sales reports, and can manage products and suppliers.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className={ROLE_COLORS.cashier}>Cashier</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Limited to POS operations, viewing products, and basic customer management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5"/>
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (<div className="text-center py-8 text-muted-foreground">Loading users...</div>) : users.length === 0 ? (<div className="text-center py-8 text-muted-foreground">No users found</div>) : (<Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (<TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (<Badge variant="outline">No roles</Badge>) : (user.roles.map((role) => (<Badge key={role} className={ROLE_COLORS[role]}>
                              {ROLE_LABELS[role]}
                            </Badge>)))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {ALL_ROLES.filter((role) => !user.roles.includes(role)).length > 0 && (<>
                              <div className="px-2 py-1.5 text-sm font-semibold">Add Role</div>
                              {ALL_ROLES.filter((role) => !user.roles.includes(role)).map((role) => (<DropdownMenuItem key={`add-${role}`} onClick={() => handleAssignRole(user.id, role)}>
                                  <Plus className="mr-2 h-4 w-4"/>
                                  {ROLE_LABELS[role]}
                                </DropdownMenuItem>))}
                            </>)}
                          {user.roles.length > 0 && (<>
                              <DropdownMenuSeparator />
                              <div className="px-2 py-1.5 text-sm font-semibold">Remove Role</div>
                              {user.roles.map((role) => {
                        const validation = canRemoveRole(user.id, role);
                        const isDisabled = !validation.canRemove;
                        return (<DropdownMenuItem key={`remove-${role}`} onClick={() => !isDisabled && handleRemoveRole(user.id, role)} className={isDisabled ? 'opacity-50 cursor-not-allowed' : 'text-destructive'} disabled={isDisabled}>
                                    {isDisabled ? (<AlertTriangle className="mr-2 h-4 w-4"/>) : (<Minus className="mr-2 h-4 w-4"/>)}
                                    {ROLE_LABELS[role]}
                                    {isDisabled && role === 'admin' && totalAdmins <= 1 && (<span className="ml-1 text-xs">(Last Admin)</span>)}
                                    {isDisabled && role === 'admin' && user.id === currentUserId && totalAdmins > 1 && (<span className="ml-1 text-xs">(Your Role)</span>)}
                                  </DropdownMenuItem>);
                    })}
                            </>)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>)}
        </CardContent>
      </Card>
    </div>);
}
