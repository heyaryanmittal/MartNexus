import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useBranches } from '@/hooks/useBranches';
export function BranchInventoryView({ branches }) {
    const [selectedBranch, setSelectedBranch] = useState('all');
    const { branchInventory, fetchBranchInventory, loading } = useBranches();
    useEffect(() => {
        if (selectedBranch === 'all') {
            fetchBranchInventory();
        }
        else {
            fetchBranchInventory(selectedBranch);
        }
    }, [selectedBranch]);
    const getStockStatus = (stock, reorderLevel) => {
        if (stock === 0)
            return { label: 'Out of Stock', variant: 'destructive' };
        if (stock <= reorderLevel)
            return { label: 'Low Stock', variant: 'secondary' };
        return { label: 'In Stock', variant: 'default' };
    };
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5"/>
          Branch Inventory
        </CardTitle>
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select branch"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((branch) => (<SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {branchInventory.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
            No inventory records found. Add stock to branches to see inventory here.
          </div>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                {selectedBranch === 'all' && <TableHead>Branch</TableHead>}
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branchInventory.map((item) => {
                const status = getStockStatus(item.stock, item.reorder_level);
                return (<TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product?.name || 'Unknown Product'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.product?.sku}
                    </TableCell>
                    {selectedBranch === 'all' && (<TableCell>{item.branch?.name}</TableCell>)}
                    <TableCell className="text-right">{item.stock}</TableCell>
                    <TableCell className="text-right">{item.reorder_level}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>);
            })}
            </TableBody>
          </Table>)}
      </CardContent>
    </Card>);
}
