import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, DollarSign, History, AlertTriangle } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
export const CustomerList = ({ onAdd, onEdit, onPricing, onHistory }) => {
  const { customers, isLoading, fetchCustomers, deleteCustomer } = useCustomers();
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  
  const filteredCustomers = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase()));

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer.mutateAsync(customerToDelete.id);
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };
  return (<Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Customers</CardTitle>
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" /> Add Customer
      </Button>
    </CardHeader>
    <CardContent>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading ? (<div className="text-center py-8 text-muted-foreground">Loading...</div>) : filteredCustomers.length === 0 ? (<div className="text-center py-8 text-muted-foreground">No customers found</div>) : (<Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.map((customer) => (<TableRow key={customer.id}>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>
              <div className="text-sm">
                {customer.email && <div>{customer.email}</div>}
                {customer.phone && <div className="text-muted-foreground">{customer.phone}</div>}
              </div>
            </TableCell>
            <TableCell>{customer.address || '-'}</TableCell>
            <TableCell>{customer.discountPercentage}%</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(customer)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPricing(customer)}>
                    <DollarSign className="mr-2 h-4 w-4" /> Custom Pricing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onHistory(customer)}>
                    <History className="mr-2 h-4 w-4" /> Purchase History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteClick(customer)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>))}
        </TableBody>
      </Table>)}
    </CardContent>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Customer
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{customerToDelete?.name}</strong>?
            This action cannot be undone and will permanently remove this customer and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>);
};
