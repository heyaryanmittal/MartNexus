import { Package, Calendar, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
export function InventoryList({ products }) {
    if (products.length === 0) {
        return (<Card className="p-12 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
        <h3 className="text-lg font-semibold mb-2">No inventory items</h3>
        <p className="text-muted-foreground">
          Add products to start tracking inventory
        </p>
      </Card>);
    }
    const getStockStatus = (stock, reorderLevel) => {
        if (stock === 0)
            return { label: 'Out of Stock', variant: 'destructive' };
        if (stock <= reorderLevel)
            return { label: 'Low Stock', variant: 'destructive' };
        return { label: 'In Stock', variant: 'default' };
    };
    const getDaysUntilExpiry = (expiryDate) => {
        if (!expiryDate)
            return null;
        const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days;
    };
    return (<Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Reorder Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const status = getStockStatus(product.stock, product.reorder_level);
            const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
            return (<TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell className="text-right font-semibold">
                  {product.stock}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {product.reorder_level}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>
                  {product.batch_number && (<div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Hash className="w-3 h-3"/>
                      {product.batch_number}
                    </div>)}
                </TableCell>
                <TableCell>
                  {product.expiry_date && (<div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3"/>
                        {format(new Date(product.expiry_date), 'MMM dd, yyyy')}
                      </div>
                      {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (<Badge variant="secondary" className="text-xs">
                          {daysUntilExpiry} days left
                        </Badge>)}
                    </div>)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{(product.stock * product.price).toFixed(2)}
                </TableCell>
              </TableRow>);
        })}
        </TableBody>
      </Table>
    </Card>);
}
