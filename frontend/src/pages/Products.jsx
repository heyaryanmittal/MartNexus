import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductList } from '@/components/Products/ProductList';
import { ProductForm } from '@/components/Products/ProductForm';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
export default function Products() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { products, loading, fetchProducts, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { toast } = useToast();
  useEffect(() => {
    fetchProducts();
  }, []);
  const handleEdit = (productId) => {
    setSelectedProductId(productId);
    setIsFormOpen(true);
  };
  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    }
    catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedProductId(null);
    fetchProducts();
  };
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    
    const prodCatId = product.categoryId || product.category_id;
    const matchesCategory = categoryFilter === 'all' || prodCatId === categoryFilter;

    return matchesSearch && matchesCategory;
  });
  return (<div className="space-y-4 sm:space-y-6 pb-4">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Products
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your product inventory</p>
      </div>
      <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
        <Plus className="w-4 h-4 mr-2" />
        Add Product
      </Button>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search products by name or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (<SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>))}
        </SelectContent>
      </Select>
    </div>

    <ProductList products={filteredProducts} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

    <ProductForm open={isFormOpen} onClose={() => {
      setIsFormOpen(false);
      setSelectedProductId(null);
    }} productId={selectedProductId} onSuccess={handleFormSuccess} />
  </div>);
}
