import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Check, X, AlertTriangle, Search, ScanBarcode, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useStocktakes } from '@/hooks/useStocktakes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BarcodeScanner } from '@/components/Barcode/BarcodeScanner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
export function StocktakeDetail({ stocktakeId, onBack }) {
    const [stocktake, setStocktake] = useState(null);
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [applyAdjustments, setApplyAdjustments] = useState(true);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const itemRefs = useRef(new Map());
    const { updateItemCount, completeStocktake, cancelStocktake } = useStocktakes();
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: stocktakeData } = await supabase
                .from('stocktakes')
                .select('*')
                .eq('id', stocktakeId)
                .single();
            setStocktake(stocktakeData);
            const { data: itemsData } = await supabase
                .from('stocktake_items')
                .select(`
          *,
          product:products(name, sku, barcode)
        `)
                .eq('stocktake_id', stocktakeId)
                .order('created_at', { ascending: true });
            setItems(itemsData || []);
        }
        catch (error) {
            console.error('Error fetching stocktake:', error);
        }
        finally {
            setLoading(false);
        }
    }, [stocktakeId]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const handleStartEdit = (item) => {
        setEditingItemId(item.id);
        setEditValue(item.counted_quantity?.toString() || '');
    };
    const handleSaveCount = async (itemId) => {
        const count = parseInt(editValue, 10);
        if (isNaN(count) || count < 0) {
            toast.error('Please enter a valid count');
            return;
        }
        try {
            await updateItemCount(itemId, count);
            setEditingItemId(null);
            fetchData();
            toast.success('Count saved');
        }
        catch (error) {
            toast.error('Failed to save count');
        }
    };
    const handleComplete = async () => {
        setCompleting(true);
        try {
            await completeStocktake(stocktakeId, applyAdjustments);
            toast.success(applyAdjustments
                ? 'Stocktake completed and adjustments applied'
                : 'Stocktake completed without adjustments');
            onBack();
        }
        catch (error) {
            toast.error('Failed to complete stocktake');
        }
        finally {
            setCompleting(false);
            setShowCompleteDialog(false);
        }
    };
    const handleCancel = async () => {
        try {
            await cancelStocktake(stocktakeId);
            toast.success('Stocktake cancelled');
            onBack();
        }
        catch (error) {
            toast.error('Failed to cancel stocktake');
        }
    };
    const filteredItems = items.filter(item => {
        const searchLower = search.toLowerCase();
        return (item.product?.name.toLowerCase().includes(searchLower) ||
            item.product?.sku.toLowerCase().includes(searchLower) ||
            item.product?.barcode?.toLowerCase().includes(searchLower));
    });
    const countedItems = items.filter(i => i.counted_quantity !== null).length;
    const itemsWithVariance = items.filter(i => i.variance !== null && i.variance !== 0);
    const totalVariance = itemsWithVariance.reduce((sum, i) => sum + (i.variance || 0), 0);
    const isInProgress = stocktake?.status === 'in_progress';
    const handleBarcodeScan = (barcode) => {
        const item = items.find(i => i.product?.barcode?.toLowerCase() === barcode.toLowerCase() ||
            i.product?.sku.toLowerCase() === barcode.toLowerCase());
        if (item) {
            setSearch('');
            
            const rowElement = itemRefs.current.get(item.id);
            if (rowElement) {
                rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                rowElement.classList.add('bg-primary/10');
                setTimeout(() => rowElement.classList.remove('bg-primary/10'), 2000);
            }
            if (isInProgress) {
                handleStartEdit(item);
            }
            toast.success(`Found: ${item.product?.name}`);
        }
        else {
            toast.error('Product not found in this stocktake');
        }
    };
    const exportToCSV = () => {
        const headers = ['Product Name', 'SKU', 'Barcode', 'System Qty', 'Counted Qty', 'Variance', 'Notes'];
        const rows = items.map(item => [
            item.product?.name || '',
            item.product?.sku || '',
            item.product?.barcode || '',
            item.system_quantity.toString(),
            item.counted_quantity?.toString() || '',
            item.variance?.toString() || '',
            item.notes || ''
        ]);
        const csvContent = [
            `Stocktake Report: ${stocktake?.stocktake_number}`,
            `Date: ${format(new Date(stocktake?.started_at), 'MMM d, yyyy HH:mm')}`,
            `Status: ${stocktake?.status}`,
            '',
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `stocktake-${stocktake?.stocktake_number}.csv`;
        link.click();
        toast.success('CSV exported');
    };
    const exportToPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        doc.setFontSize(18);
        doc.text('Stocktake Report', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`${stocktake?.stocktake_number}`, pageWidth / 2, 28, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Date: ${format(new Date(stocktake?.started_at), 'MMM d, yyyy HH:mm')}`, 14, 40);
        doc.text(`Status: ${stocktake?.status?.toUpperCase()}`, 14, 46);
        if (stocktake?.completed_at) {
            doc.text(`Completed: ${format(new Date(stocktake.completed_at), 'MMM d, yyyy HH:mm')}`, 14, 52);
        }
        
        doc.setFontSize(11);
        doc.text('Summary', 14, 64);
        doc.setFontSize(10);
        doc.text(`Total Items: ${items.length}`, 14, 72);
        doc.text(`Counted: ${countedItems}`, 14, 78);
        doc.text(`Items with Variance: ${itemsWithVariance.length}`, 14, 84);
        doc.text(`Total Variance: ${totalVariance > 0 ? '+' : ''}${totalVariance}`, 14, 90);
        
        const tableData = items.map(item => [
            item.product?.name || '',
            item.product?.sku || '',
            item.system_quantity,
            item.counted_quantity ?? '-',
            item.variance !== null ? (item.variance > 0 ? `+${item.variance}` : item.variance) : '-'
        ]);
        autoTable(doc, {
            startY: 100,
            head: [['Product', 'SKU', 'System Qty', 'Counted Qty', 'Variance']],
            body: tableData,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [41, 128, 185] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });
        doc.save(`stocktake-${stocktake?.stocktake_number}.pdf`);
        toast.success('PDF exported');
    };
    if (loading) {
        return (<Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading stocktake...</p>
        </CardContent>
      </Card>);
    }
    return (<>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4"/>
              </Button>
              <div>
                <CardTitle>{stocktake?.stocktake_number}</CardTitle>
                <CardDescription>
                  Started {stocktake && format(new Date(stocktake.started_at), 'MMM d, yyyy HH:mm')}
                  {stocktake?.notes && ` • ${stocktake.notes}`}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2"/>
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="h-4 w-4 mr-2"/>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="h-4 w-4 mr-2"/>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isInProgress && (<>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2"/>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowCompleteDialog(true)}>
                    <Check className="h-4 w-4 mr-2"/>
                    Complete
                  </Button>
                </>)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Counted</p>
              <p className="text-2xl font-bold">{countedItems}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Variances</p>
              <p className="text-2xl font-bold">{itemsWithVariance.length}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Variance</p>
              <p className={`text-2xl font-bold ${totalVariance > 0 ? 'text-green-600' : totalVariance < 0 ? 'text-destructive' : ''}`}>
                {totalVariance > 0 ? '+' : ''}{totalVariance}
              </p>
            </div>
          </div>

          {}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search by product name, SKU, or barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10"/>
            </div>
            {isInProgress && (<Button variant="outline" onClick={() => setScannerOpen(true)}>
                <ScanBarcode className="h-4 w-4 mr-2"/>
                Scan
              </Button>)}
          </div>

          {}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">System Qty</TableHead>
                  <TableHead className="text-right">Counted Qty</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (<TableRow key={item.id} ref={(el) => {
                if (el)
                    itemRefs.current.set(item.id, el);
            }} className="transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.product?.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.system_quantity}</TableCell>
                    <TableCell className="text-right">
                      {editingItemId === item.id ? (<Input type="number" min="0" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-24 ml-auto text-right" autoFocus onKeyDown={(e) => {
                    if (e.key === 'Enter')
                        handleSaveCount(item.id);
                    if (e.key === 'Escape')
                        setEditingItemId(null);
                }}/>) : (<span className="font-mono">
                          {item.counted_quantity !== null ? item.counted_quantity : '-'}
                        </span>)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.variance !== null ? (<Badge variant={item.variance === 0 ? 'secondary' : item.variance > 0 ? 'default' : 'destructive'}>
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </Badge>) : ('-')}
                    </TableCell>
                    <TableCell className="text-right">
                      {isInProgress && (editingItemId === item.id ? (<div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditingItemId(null)}>
                              <X className="h-4 w-4"/>
                            </Button>
                            <Button size="sm" onClick={() => handleSaveCount(item.id)}>
                              <Check className="h-4 w-4"/>
                            </Button>
                          </div>) : (<Button size="sm" variant="outline" onClick={() => handleStartEdit(item)}>
                            {item.counted_quantity !== null ? 'Edit' : 'Count'}
                          </Button>))}
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Stocktake</DialogTitle>
            <DialogDescription>
              {countedItems < items.length && (<div className="flex items-center gap-2 text-orange-500 mt-2">
                  <AlertTriangle className="h-4 w-4"/>
                  {items.length - countedItems} item(s) have not been counted yet
                </div>)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {itemsWithVariance.length > 0 && (<div className="flex items-start gap-3">
                <Checkbox id="apply-adjustments" checked={applyAdjustments} onCheckedChange={(checked) => setApplyAdjustments(!!checked)}/>
                <div>
                  <Label htmlFor="apply-adjustments" className="cursor-pointer">
                    Apply stock adjustments
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Update system stock levels to match counted quantities ({itemsWithVariance.length} items with variance)
                  </p>
                </div>
              </div>)}

            {itemsWithVariance.length === 0 && (<p className="text-muted-foreground">No variances found. All counted items match system records.</p>)}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={completing}>
              {completing ? 'Completing...' : 'Complete Stocktake'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcodeScan}/>
    </>);
}
