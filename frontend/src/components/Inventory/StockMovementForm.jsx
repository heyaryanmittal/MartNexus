import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProducts } from '@/hooks/useProducts';
import { useStockMovements } from '@/hooks/useStockMovements';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/Barcode/BarcodeScanner';
import { Camera } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
const movementSchema = z.object({
    product_id: z.string().min(1, 'Product is required'),
    movement_type: z.enum(['in', 'out', 'adjustment']),
    quantity: z.string().min(1, 'Quantity is required'),
    batch_number: z.string().optional(),
    expiry_date: z.string().optional(),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
});
export function StockMovementForm({ open, onClose, onSuccess }) {
    const { products, fetchProducts } = useProducts();
    const { createMovement } = useStockMovements();
    const { toast } = useToast();
    const [scannerOpen, setScannerOpen] = useState(false);
    useEffect(() => {
        if (open) {
            fetchProducts();
        }
    }, [open]);
    const form = useForm({
        resolver: zodResolver(movementSchema),
        defaultValues: {
            product_id: '',
            movement_type: 'in',
            quantity: '',
            batch_number: '',
            expiry_date: '',
            reference_number: '',
            notes: '',
        },
    });
    const handleBarcodeScan = (barcode) => {
        const product = products.find((p) => p.barcode === barcode || p.sku === barcode);
        if (product) {
            form.setValue('product_id', product.id);
            sonnerToast.success(`Selected: ${product.name}`);
        }
        else {
            sonnerToast.error(`Product not found: ${barcode}`);
        }
    };
    const onSubmit = async (data) => {
        try {
            await createMovement({
                product_id: data.product_id,
                movement_type: data.movement_type,
                quantity: parseInt(data.quantity),
                batch_number: data.batch_number || null,
                expiry_date: data.expiry_date || null,
                reference_number: data.reference_number || null,
                notes: data.notes || null,
                created_by: null,
            });
            toast({
                title: "Success",
                description: "Stock movement recorded successfully",
            });
            form.reset();
            onSuccess();
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to record stock movement",
                variant: "destructive",
            });
        }
    };
    return (<Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock Movement</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="product_id" render={({ field }) => (<FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Product
                    <Button type="button" variant="ghost" size="sm" onClick={() => setScannerOpen(true)} className="h-6 px-2">
                      <Camera className="h-4 w-4 mr-1"/>
                      Scan
                    </Button>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product or scan barcode"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (<SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.sku} (Stock: {product.stock})
                        </SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>)}/>

            <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcodeScan}/>

            <FormField control={form.control} name="movement_type" render={({ field }) => (<FormItem>
                  <FormLabel>Movement Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select movement type"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in">Stock In (Add)</SelectItem>
                      <SelectItem value="out">Stock Out (Remove)</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>)}/>

            <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Enter quantity"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="batch_number" render={({ field }) => (<FormItem>
                    <FormLabel>Batch Number (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., BATCH-001"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <FormField control={form.control} name="expiry_date" render={({ field }) => (<FormItem>
                    <FormLabel>Expiry Date (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>
            </div>

            <FormField control={form.control} name="reference_number" render={({ field }) => (<FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., PO-12345"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Add any additional notes"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Record Movement</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
