import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryList } from '@/components/Categories/CategoryList';
import { CategoryForm } from '@/components/Categories/CategoryForm';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
export default function Categories() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { categories, loading, fetchCategories, deleteCategory } = useCategories();
    const { toast } = useToast();
    useEffect(() => {
        fetchCategories();
    }, []);
    const handleEdit = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setIsFormOpen(true);
    };
    const handleDelete = async (categoryId) => {
        try {
            await deleteCategory(categoryId);
            toast({
                title: "Success",
                description: "Category deleted successfully",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete category. It may have products associated with it.",
                variant: "destructive",
            });
        }
    };
    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setSelectedCategoryId(null);
        fetchCategories(); 
    };
    const filteredCategories = categories.filter(category => category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return (<div className="space-y-4 sm:space-y-6 md:space-y-8 pb-4">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Categories
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Organize your products into categories for better management
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>
          Add Category
        </Button>
      </div>

      {}
      <div className="relative group">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors"/>
        <Input placeholder="Search categories by name or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-primary/50 transition-all duration-200"/>
      </div>

      <CategoryList categories={filteredCategories} loading={loading} onEdit={handleEdit} onDelete={handleDelete}/>

      <CategoryForm open={isFormOpen} onClose={() => {
            setIsFormOpen(false);
            setSelectedCategoryId(null);
        }} categoryId={selectedCategoryId} onSuccess={handleFormSuccess}/>
    </div>);
}
