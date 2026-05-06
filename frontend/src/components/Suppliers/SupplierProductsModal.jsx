import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';
export function SupplierProductsModal({ supplier, open, onClose }) {
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [supplierSku, setSupplierSku] = useState('');
  const { fetchSupplierProducts, linkProductToSupplier, unlinkProduct } = useSuppliers();
  const { products, fetchProducts } = useProducts();
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, supplier.id]);
  const loadData = async () => {
    await fetchProducts();
    const data = await fetchSupplierProducts(supplier.id);
    setLinkedProducts(data);
  };
  const handleLink = async () => {
    if (!selectedProduct || !costPrice)
      return;
    const success = await linkProductToSupplier(supplier.id, selectedProduct, Number(costPrice), supplierSku || undefined);
    if (success) {
      loadData();
      setSelectedProduct('');
      setCostPrice('');
      setSupplierSku('');
    }
  };
  const handleUnlink = async (id) => {
    const success = await unlinkProduct(id);
    if (success)
      loadData();
  };
  const linkedProductIds = linkedProducts.map(lp => lp.productId);
  const availableProducts = products.filter(p => !linkedProductIds.includes(p.id));
  return (<Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Products from {supplier.name}</DialogTitle>
        <DialogDescription>
          Manage products linked to this supplier.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex gap-2 items-end border rounded-lg p-4 bg-muted/30">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Product</label>
            <Select
              value={selectedProduct}
              onValueChange={(value) => {
                setSelectedProduct(value);
                const p = products.find(prod => prod.id === value);
                if (p?.sku) setSupplierSku(p.sku);
                else setSupplierSku('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map((product) => (<SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-28">
            <label className="text-sm font-medium mb-1 block">Cost Price</label>
            <Input type="number" placeholder="0.00" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} min="0" step="0.01" />
          </div>
          <div className="w-28">
            <label className="text-sm font-medium mb-1 block">Supplier SKU</label>
            <Input placeholder="SKU" value={supplierSku} onChange={(e) => setSupplierSku(e.target.value)} />
          </div>
          <Button onClick={handleLink} disabled={!selectedProduct || !costPrice}>
            <Plus className="w-4 h-4 mr-1" />
            Link
          </Button>
        </div>

        {linkedProducts.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
          No products linked to this supplier yet.
        </div>) : (<Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Supplier SKU</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linkedProducts.map((lp) => (<TableRow key={lp.id}>
              <TableCell className="font-medium">
                {lp.product?.name}
                {lp.isPreferred && (<Badge variant="secondary" className="ml-2">Preferred</Badge>)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lp.product?.sku}
              </TableCell>
              <TableCell>{lp.supplierSku || '-'}</TableCell>
              <TableCell className="text-right">
                ₹{Number(lp.costPrice).toFixed(2)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleUnlink(lp.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>))}
          </TableBody>
        </Table>)}
      </div>
    </DialogContent>
  </Dialog>);
}
