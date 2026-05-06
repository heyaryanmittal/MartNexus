import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useBranches } from '@/hooks/useBranches';
import { useProducts } from '@/hooks/useProducts';
const transferSchema = z.object({
    from_branch_id: z.string().min(1, 'Source branch is required'),
    to_branch_id: z.string().min(1, 'Destination branch is required'),
    notes: z.string().optional(),
});
export function StockTransferForm({ open, branches, onClose, onSuccess }) {
    const [items, setItems] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const { createTransfer } = useBranches();
    const { products, fetchProducts } = useProducts();
    useEffect(() => {
        if (open) {
            fetchProducts();
        }
    }, [open]);
    const form = useForm({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            from_branch_id: '',
            to_branch_id: '',
            notes: '',
        },
    });
    const fromBranchId = form.watch('from_branch_id');
    const addItem = () => {
        if (!selectedProduct || !quantity || Number(quantity) <= 0)
            return;
        const product = products.find((p) => p.id === selectedProduct);
        if (!product)
            return;
        
        const existingIndex = items.findIndex((i) => i.productId === selectedProduct);
        if (existingIndex >= 0) {
            const newItems = [...items];
            newItems[existingIndex].quantity += Number(quantity);
            setItems(newItems);
        }
        else {
            setItems([
                ...items,
                {
                    productId: selectedProduct,
                    productName: product.name,
                    quantity: Number(quantity),
                },
            ]);
        }
        setSelectedProduct('');
        setQuantity('');
    };
    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };
    const onSubmit = async (data) => {
        if (items.length === 0)
            return;
        const result = await createTransfer(data.from_branch_id, data.to_branch_id, items.map((i) => ({ productId: i.productId, quantity: i.quantity })), data.notes);
        if (result) {
            form.reset();
            setItems([]);
            onSuccess();
        }
    };
    const handleClose = () => {
        form.reset();
        setItems([]);
        setSelectedProduct('');
        setQuantity('');
        onClose();
    };
    return (<Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Stock Transfer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="from_branch_id" render={({ field }) => (<FormItem>
                    <FormLabel>From Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.filter((b) => b.is_active).map((branch) => (<SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>)}/>

              <FormField control={form.control} name="to_branch_id" render={({ field }) => (<FormItem>
                    <FormLabel>To Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches
                .filter((b) => b.is_active && b.id !== fromBranchId)
                .map((branch) => (<SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>)}/>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Transfer Items</h4>

              <div className="flex gap-2">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product"/>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (<SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.stock} in stock)
                      </SelectItem>))}
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Qty" className="w-24" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1"/>
                <Button type="button" variant="outline" size="icon" onClick={addItem}>
                  <Plus className="w-4 h-4"/>
                </Button>
              </div>

              {items.length > 0 && (<div className="space-y-2">
                  {items.map((item, index) => (<div key={index} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>))}
                </div>)}
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any notes about this transfer..." {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={items.length === 0}>
                Create Transfer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
