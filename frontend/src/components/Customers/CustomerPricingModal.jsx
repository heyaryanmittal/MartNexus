import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useCustomerPricing } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
export const CustomerPricingModal = ({ customer, onClose }) => {
  const { pricing, upsertPricing, deletePricing } = useCustomerPricing(customer?.id || null);
  const { products, fetchProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('0');
  useEffect(() => {
    if (customer) {
      fetchProducts();
      setSelectedProduct('');
      setCustomPrice('');
      setDiscountPercentage('0');
    }
  }, [customer]);
  const existingProductIds = pricing.map((p) => p.product_id);
  const availableProducts = products.filter((p) => !existingProductIds.includes(p.id));
  const handleAdd = () => {
    if (!customer || !selectedProduct)
      return;
    upsertPricing.mutate({
      customer_id: customer.id,
      product_id: selectedProduct,
      custom_price: customPrice ? parseFloat(customPrice) : undefined,
      discount_percentage: parseFloat(discountPercentage) || 0,
    });
    setSelectedProduct('');
    setCustomPrice('');
    setDiscountPercentage('0');
  };
  const handleDelete = (id) => {
    deletePricing.mutate(id);
  };
  if (!customer)
    return null;
  return (<Dialog open={!!customer} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Custom Pricing for {customer.name}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Product</label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map((product) => (<SelectItem key={product.id} value={product.id}>
                  {product.name} (₹{Number(product.price).toFixed(2)})
                </SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-32">
            <label className="text-sm font-medium">Custom Price</label>
            <Input type="number" min="0" step="0.01" placeholder="Optional" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
          </div>
          <div className="w-32">
            <label className="text-sm font-medium">Discount %</label>
            <Input type="number" min="0" max="100" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} />
          </div>
          <Button onClick={handleAdd} disabled={!selectedProduct}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {pricing.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
          No custom pricing set for this customer
        </div>) : (<Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Regular Price</TableHead>
              <TableHead>Custom Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricing.map((item) => (<TableRow key={item.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{item.products?.name}</div>
                  <div className="text-sm text-muted-foreground">{item.products?.sku}</div>
                </div>
              </TableCell>
              <TableCell>₹{Number(item.products?.price || 0).toFixed(2)}</TableCell>
              <TableCell>
                {item.custom_price ? `₹${Number(item.custom_price).toFixed(2)}` : '-'}
              </TableCell>
              <TableCell>{item.discount_percentage}%</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>))}
          </TableBody>
        </Table>)}
      </div>
    </DialogContent>
  </Dialog>);
};
