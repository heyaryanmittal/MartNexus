import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useCustomerHistory } from '@/hooks/useCustomers';

export const CustomerHistoryModal = ({ customer, onClose }) => {
  const { history, isLoading, fetchHistory, totalSpent, totalOrders } = useCustomerHistory(customer?.id || null);

  useEffect(() => {
    if (customer?.id) {
      fetchHistory();
    }
  }, [customer?.id, fetchHistory]);

  if (!customer)
    return null;

  return (
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Purchase History - {customer.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{totalOrders}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{customer.loyalty_points || 0}</div>
              <div className="text-sm text-muted-foreground">Loyalty Points</div>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No purchase history found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.billNumber}</TableCell>
                    <TableCell>
                      {format(new Date(sale.createdAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {sale.items?.slice(0, 2).map((item) => (
                          <div key={item.id}>
                            {item.product?.name || 'Product'} x{item.quantity}
                          </div>
                        ))}
                        {sale.items?.length > 2 && (
                          <span className="text-muted-foreground">
                            +{sale.items.length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.paymentMode || 'CASH'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{parseFloat(sale.grandTotal || sale.totalAmount || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
