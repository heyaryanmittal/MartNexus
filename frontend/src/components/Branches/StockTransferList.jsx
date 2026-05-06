import { useState } from 'react';
import { ArrowRight, Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { useBranches } from '@/hooks/useBranches';
export function StockTransferList({ transfers, onRefresh }) {
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [transferItems, setTransferItems] = useState([]);
    const { completeTransfer, cancelTransfer, fetchTransferItems } = useBranches();
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'completed':
                return <Badge variant="default">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="outline">Cancelled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };
    const handleViewDetails = async (transfer) => {
        setSelectedTransfer(transfer);
        const items = await fetchTransferItems(transfer.id);
        setTransferItems(items);
    };
    const handleComplete = async (transferId) => {
        const success = await completeTransfer(transferId);
        if (success) {
            onRefresh();
            setSelectedTransfer(null);
        }
    };
    const handleCancel = async (transferId) => {
        const success = await cancelTransfer(transferId);
        if (success) {
            onRefresh();
            setSelectedTransfer(null);
        }
    };
    return (<>
      <Card>
        <CardHeader>
          <CardTitle>Stock Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
              No stock transfers yet. Create a transfer to move inventory between branches.
            </div>) : (<Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer #</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead></TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (<TableRow key={transfer.id}>
                    <TableCell className="font-medium">
                      {transfer.transfer_number}
                    </TableCell>
                    <TableCell>{transfer.from_branch?.name}</TableCell>
                    <TableCell>
                      <ArrowRight className="w-4 h-4 text-muted-foreground"/>
                    </TableCell>
                    <TableCell>{transfer.to_branch?.name}</TableCell>
                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                    <TableCell>
                      {format(new Date(transfer.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(transfer)}>
                          <Eye className="w-4 h-4"/>
                        </Button>
                        {transfer.status === 'pending' && (<>
                            <Button variant="ghost" size="sm" onClick={() => handleComplete(transfer.id)}>
                              <Check className="w-4 h-4 text-green-600"/>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleCancel(transfer.id)}>
                              <X className="w-4 h-4 text-destructive"/>
                            </Button>
                          </>)}
                      </div>
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>)}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTransfer} onOpenChange={() => setSelectedTransfer(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
          </DialogHeader>
          {selectedTransfer && (<div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Transfer #:</span>
                  <p className="font-medium">{selectedTransfer.transfer_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p>{getStatusBadge(selectedTransfer.status)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">From:</span>
                  <p className="font-medium">{selectedTransfer.from_branch?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">To:</span>
                  <p className="font-medium">{selectedTransfer.to_branch?.name}</p>
                </div>
              </div>

              {selectedTransfer.notes && (<div>
                  <span className="text-muted-foreground text-sm">Notes:</span>
                  <p className="text-sm">{selectedTransfer.notes}</p>
                </div>)}

              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferItems.map((item) => (<TableRow key={item.id}>
                        <TableCell>{item.product?.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.product?.sku}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                      </TableRow>))}
                  </TableBody>
                </Table>
              </div>

              {selectedTransfer.status === 'pending' && (<div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => handleCancel(selectedTransfer.id)}>
                    Cancel Transfer
                  </Button>
                  <Button onClick={() => handleComplete(selectedTransfer.id)}>
                    Complete Transfer
                  </Button>
                </div>)}
            </div>)}
        </DialogContent>
      </Dialog>
    </>);
}
