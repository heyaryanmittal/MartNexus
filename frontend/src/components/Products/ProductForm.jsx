import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/Barcode/BarcodeScanner';
import { Camera, Plus } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { CategoryForm } from '@/components/Categories/CategoryForm';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  sellingPrice: z.string().min(1, 'Selling price is required').refine((val) => parseFloat(val) > 0, { message: 'Selling price must be greater than 0' }),
  costPrice: z.string().min(1, 'Cost price is required').refine((val) => parseFloat(val) > 0, { message: 'Cost price must be greater than 0' }),
  stock: z.string().min(1, 'Stock quantity is required').refine((val) => parseFloat(val) >= 0, { message: 'Stock must be 0 or greater' }),
  reorderLevel: z.string().min(1, 'Reorder level is required').refine((val) => parseFloat(val) >= 0, { message: 'Reorder level must be 0 or greater' }),
  quantityType: z.enum(['PIECES', 'KG', 'LITERS']), 
  barcode: z.string().optional(),
  isActive: z.boolean(),
});

export function ProductForm({ open, onClose, productId, onSuccess }) {
  const { categories, fetchCategories } = useCategories(); 
  const { getProduct, createProduct, updateProduct } = useProducts();
  const { toast } = useToast();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      categoryId: '',
      description: '',
      sellingPrice: '0',
      costPrice: '0',
      stock: '0',
      reorderLevel: '5',
      quantityType: 'PIECES', 
      barcode: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      fetchCategories(); 
    }
    if (productId && open) {
      loadProduct();
    } else if (!open) {
      form.reset();
    }
  }, [productId, open]);

  
  useEffect(() => {
    if (!productId) {
      const name = form.watch('name');
      const categoryId = form.watch('categoryId');
      if (name) {
        const category = categories.find(c => c.id === categoryId);
        const generatedSku = generateSKU(name, category?.name);
        form.setValue('sku', generatedSku);
      }
    }
  }, [form.watch('name'), form.watch('categoryId'), productId, categories]);

  const generateSKU = (productName, categoryName) => {
    const categoryPrefix = categoryName ? categoryName.substring(0, 3).toUpperCase() : 'GEN';
    const nameWords = productName.trim().split(/\s+/);
    const namePrefix = nameWords.slice(0, 2).map(word => word.substring(0, 3).toUpperCase()).join('');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${categoryPrefix}-${namePrefix}-${randomNum}`;
  };

  const handleBarcodeScan = (barcode) => {
    form.setValue('barcode', barcode);
    sonnerToast.success(`Barcode scanned: ${barcode}`);
    setScannerOpen(false);
  };

  const loadProduct = async () => {
    const product = await getProduct(productId);
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku || '',
        categoryId: product.categoryId || '',
        description: product.description || '',
        sellingPrice: (product.sellingPrice || 0).toString(),
        costPrice: (product.costPrice || 0).toString(),
        stock: (product.stock || 0).toString(),
        reorderLevel: (product.reorderLevel || 5).toString(),
        quantityType: product.quantityType || 'PIECES',
        barcode: product.barcode || '',
        isActive: product.isActive,
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      let finalSku = data.sku;
      if (!productId && !finalSku) {
        const category = categories.find(c => c.id === data.categoryId);
        finalSku = generateSKU(data.name, category?.name);
      }

      const productData = {
        name: data.name,
        sku: finalSku || generateSKU(data.name),
        categoryId: data.categoryId || null,
        description: data.description || null,
        sellingPrice: parseFloat(data.sellingPrice),
        costPrice: parseFloat(data.costPrice),
        stock: parseFloat(data.stock),
        reorderLevel: parseFloat(data.reorderLevel),
        quantityType: data.quantityType,
        barcode: data.barcode || null,
        isActive: data.isActive,
      };

      if (productId) {
        await updateProduct(productId, productData);
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        await createProduct(productData);
        toast({ title: "Success", description: "Product created successfully" });
      }
      onSuccess();
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${productId ? 'update' : 'create'} product`, variant: "destructive" });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {productId ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Product Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter product name" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">SKU (Auto-generated)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Auto-generated" readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-semibold">Category *</FormLabel>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        onClick={() => setIsCategoryFormOpen(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add New
                      </Button>
                    </div>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                        {categories.length === 0 && <SelectItem value="none" disabled>No categories found</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="quantityType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Quantity Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PIECES">Pieces (Pcs)</SelectItem>
                        <SelectItem value="KG">Kilograms (Kg)</SelectItem>
                        <SelectItem value="LITERS">Liters (L)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter description" className="resize-none" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Selling Price *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="0.00" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="costPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Cost Price *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="0.00" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Stock Quantity *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="0" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="reorderLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Low Stock Threshold *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="1" placeholder="5" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="barcode" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                    Barcode
                    <Button type="button" variant="ghost" size="sm" onClick={() => setScannerOpen(true)} className="h-6 px-2 text-xs">
                      <Camera className="h-3.5 w-3.5 mr-1" /> Scan
                    </Button>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter barcode or scan" className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcodeScan} />

              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border-2 p-4 bg-muted/30">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">Enable or disable this product</div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose} size="lg">Cancel</Button>
                <Button type="submit" size="lg" className="shadow-lg">
                  {productId ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CategoryForm
        open={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        onSuccess={() => {
          setIsCategoryFormOpen(false);
          fetchCategories();
        }}
      />
    </>
  );
}
