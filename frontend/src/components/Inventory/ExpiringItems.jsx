import { Calendar, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
export function ExpiringItems({ products }) {
    if (products.length === 0) {
        return (<Card className="p-12 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
        <h3 className="text-lg font-semibold mb-2">No expiring items</h3>
        <p className="text-muted-foreground">
          No products expiring within the next 30 days
        </p>
      </Card>);
    }
    const getDaysUntilExpiry = (expiryDate) => {
        return Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    };
    const getExpiryBadge = (days) => {
        if (days <= 7)
            return { label: 'Expires Soon', variant: 'destructive' };
        if (days <= 14)
            return { label: 'Expires < 2 weeks', variant: 'secondary' };
        return { label: 'Expires < 30 days', variant: 'default' };
    };
    return (<Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Batch Number</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Potential Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products
            .sort((a, b) => {
            const daysA = getDaysUntilExpiry(a.expiry_date);
            const daysB = getDaysUntilExpiry(b.expiry_date);
            return daysA - daysB;
        })
            .map((product) => {
            const daysLeft = getDaysUntilExpiry(product.expiry_date);
            const badge = getExpiryBadge(daysLeft);
            const potentialLoss = product.stock * product.price;
            return (<TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.batch_number || '-'}
                  </TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground"/>
                      {format(new Date(product.expiry_date), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${daysLeft <= 7 ? 'text-destructive' : ''}`}>
                      {daysLeft} days
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    ${potentialLoss.toFixed(2)}
                  </TableCell>
                </TableRow>);
        })}
        </TableBody>
      </Table>
    </Card>);
}
