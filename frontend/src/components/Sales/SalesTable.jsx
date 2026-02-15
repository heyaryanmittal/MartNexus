import { Eye, FileText, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export function SalesTable({ sales, loading, onViewReceipt, onCancelSale }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No sales found</h3>
        <p className="text-muted-foreground">
          No transactions match your search criteria
        </p>
      </div>
    );
  }

  const getPaymentMethodBadge = (method) => {
    const variants = {
      CASH: 'default',
      NET_BANKING: 'secondary',
      UPI: 'outline',
    };
    return variants[method] || 'default';
  };

  const getStatusBadge = (status) => {
    const variants = {
      PAID: 'default',
      CANCELLED: 'destructive',
      PENDING: 'secondary',
    };
    return variants[status] || 'default';
  };

  
  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'PP');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateStr) => {
    try {
      return format(new Date(dateStr), 'p');
    } catch (e) {
      return '--:--';
    }
  };

  return (
    <>
      {}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} className={sale.status === 'CANCELLED' ? 'opacity-60 bg-muted/50' : ''}>
                <TableCell className="font-medium">{sale.billNumber}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatDate(sale.createdAt)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(sale.createdAt)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">
                      ₹{Number(sale.totalAmount).toFixed(2)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentMethodBadge(sale.paymentMode)}>
                    {sale.paymentMode?.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadge(sale.status)}>
                    {sale.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onViewReceipt(sale)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {sale.status !== 'CANCELLED' && onCancelSale && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onCancelSale(sale)}>
                        <Ban className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {}
      <div className="md:hidden space-y-3">
        {sales.map((sale) => (
          <Card key={sale.id} className={`p-4 ${sale.status === 'CANCELLED' ? 'opacity-75 bg-muted/30' : ''}`}>
            <div className="space-y-3">
              {}
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm text-muted-foreground">Invoice Number</div>
                  <div className="font-bold text-base">{sale.billNumber}</div>
                </div>
                <Badge variant={getStatusBadge(sale.status)}>
                  {sale.status}
                </Badge>
              </div>

              {}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{formatDate(sale.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{formatTime(sale.createdAt)}</span>
              </div>

              {}
              <div className="flex justify-between items-center">
                <Badge variant="secondary">
                  {sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                </Badge>
                <Badge variant={getPaymentMethodBadge(sale.paymentMode)}>
                  {sale.paymentMode?.replace('_', ' ')}
                </Badge>
              </div>

              {}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600 dark:text-green-400">
                      ₹{Number(sale.totalAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewReceipt(sale)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Receipt
                </Button>
                {sale.status !== 'CANCELLED' && onCancelSale && (
                  <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onCancelSale(sale)}>
                    <Ban className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
