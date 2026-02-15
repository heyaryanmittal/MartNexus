import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ClipboardCheck, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStocktakes } from '@/hooks/useStocktakes';
import { StocktakeForm } from './StocktakeForm';
import { StocktakeDetail } from './StocktakeDetail';
export function StocktakeList() {
    const { stocktakes, loading, fetchStocktakes } = useStocktakes();
    const [showNewForm, setShowNewForm] = useState(false);
    const [selectedStocktakeId, setSelectedStocktakeId] = useState(null);
    useEffect(() => {
        fetchStocktakes();
    }, [fetchStocktakes]);
    const getStatusBadge = (status) => {
        switch (status) {
            case 'in_progress':
                return <Badge variant="default">In Progress</Badge>;
            case 'completed':
                return <Badge variant="secondary">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };
    if (selectedStocktakeId) {
        return (<StocktakeDetail stocktakeId={selectedStocktakeId} onBack={() => {
                setSelectedStocktakeId(null);
                fetchStocktakes();
            }}/>);
    }
    if (showNewForm) {
        return (<StocktakeForm onCancel={() => setShowNewForm(false)} onSuccess={(id) => {
                setShowNewForm(false);
                setSelectedStocktakeId(id);
            }}/>);
    }
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5"/>
          Stocktakes
        </CardTitle>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2"/>
          New Stocktake
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (<p className="text-muted-foreground text-center py-8">Loading...</p>) : stocktakes.length === 0 ? (<div className="text-center py-8">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
            <p className="text-muted-foreground">No stocktakes yet</p>
            <p className="text-sm text-muted-foreground">Start a new stocktake to reconcile inventory</p>
          </div>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stocktake #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocktakes.map((stocktake) => (<TableRow key={stocktake.id}>
                  <TableCell className="font-medium">{stocktake.stocktake_number}</TableCell>
                  <TableCell>{getStatusBadge(stocktake.status)}</TableCell>
                  <TableCell>{format(new Date(stocktake.started_at), 'MMM d, yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {stocktake.completed_at
                    ? format(new Date(stocktake.completed_at), 'MMM d, yyyy HH:mm')
                    : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{stocktake.notes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStocktakeId(stocktake.id)}>
                      <Eye className="h-4 w-4 mr-1"/>
                      {stocktake.status === 'in_progress' ? 'Continue' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>)}
      </CardContent>
    </Card>);
}
