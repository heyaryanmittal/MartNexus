import { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStocktakes } from '@/hooks/useStocktakes';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
export function StocktakeForm({ onCancel, onSuccess }) {
    const [notes, setNotes] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(true);
    const [creating, setCreating] = useState(false);
    const { createStocktake, initializeStocktakeItems } = useStocktakes();
    const { products, fetchProducts } = useProducts();
    const { categories, fetchCategories } = useCategories();
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);
    useEffect(() => {
        if (selectAll) {
            setSelectedProducts(products.filter(p => p.is_active).map(p => p.id));
        }
    }, [products, selectAll]);
    const handleProductToggle = (productId) => {
        setSelectAll(false);
        setSelectedProducts(prev => prev.includes(productId)
            ? prev.filter(id => id !== productId)
            : [...prev, productId]);
    };
    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedProducts(products.filter(p => p.is_active).map(p => p.id));
        }
        else {
            setSelectedProducts([]);
        }
    };
    const handleSubmit = async () => {
        if (selectedProducts.length === 0) {
            toast.error('Please select at least one product');
            return;
        }
        setCreating(true);
        try {
            const stocktake = await createStocktake(notes || undefined);
            await initializeStocktakeItems(stocktake.id, selectAll ? undefined : selectedProducts);
            toast.success('Stocktake started');
            onSuccess(stocktake.id);
        }
        catch (error) {
            toast.error('Failed to start stocktake');
        }
        finally {
            setCreating(false);
        }
    };
    const getCategoryName = (categoryId) => {
        if (!categoryId)
            return 'Uncategorized';
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Unknown';
    };
    const activeProducts = products.filter(p => p.is_active);
    return (<Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4"/>
          </Button>
          <div>
            <CardTitle>New Stocktake</CardTitle>
            <CardDescription>Select products to include in this stocktake</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Textarea placeholder="Add any notes about this stocktake..." value={notes} onChange={(e) => setNotes(e.target.value)}/>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Products to Count</Label>
            <div className="flex items-center gap-2">
              <Checkbox id="select-all" checked={selectAll} onCheckedChange={handleSelectAll}/>
              <Label htmlFor="select-all" className="text-sm cursor-pointer">
                Select All ({activeProducts.length} products)
              </Label>
            </div>
          </div>

          <ScrollArea className="h-[300px] border rounded-md p-4">
            <div className="space-y-2">
              {activeProducts.map((product) => (<div key={product.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md">
                  <Checkbox checked={selectedProducts.includes(product.id)} onCheckedChange={() => handleProductToggle(product.id)}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {product.sku} | Stock: {product.stock} | {getCategoryName(product.category_id)}
                    </p>
                  </div>
                </div>))}
            </div>
          </ScrollArea>

          <p className="text-sm text-muted-foreground">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={creating || selectedProducts.length === 0}>
            <Check className="h-4 w-4 mr-2"/>
            {creating ? 'Starting...' : 'Start Stocktake'}
          </Button>
        </div>
      </CardContent>
    </Card>);
}
