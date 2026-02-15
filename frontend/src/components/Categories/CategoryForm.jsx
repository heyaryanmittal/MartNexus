import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(100, 'Name must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});
export function CategoryForm({ open, onClose, categoryId, onSuccess }) {
    const { categories, createCategory, updateCategory } = useCategories();
    const { toast } = useToast();
    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });
    useEffect(() => {
        if (categoryId && open) {
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                form.reset({
                    name: category.name,
                    description: category.description || '',
                });
            }
        }
        else if (!open) {
            form.reset();
        }
    }, [categoryId, open, categories]);
    const onSubmit = async (data) => {
        try {
            if (categoryId) {
                await updateCategory(categoryId, {
                    name: data.name,
                    description: data.description || undefined,
                });
                toast({
                    title: "Success",
                    description: "Category updated successfully",
                });
            }
            else {
                await createCategory({
                    name: data.name,
                    description: data.description || undefined,
                });
                toast({
                    title: "Success",
                    description: "Category created successfully",
                });
            }
            onSuccess();
        }
        catch (error) {
            toast({
                title: "Error",
                description: `Failed to ${categoryId ? 'update' : 'create'} category`,
                variant: "destructive",
            });
        }
    };
    return (<Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {categoryId ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {categoryId
            ? 'Update the category details below'
            : 'Create a new category to organize your products'}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem>
                  <FormLabel className="text-base font-semibold">Category Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Electronics, Beverages, Snacks" className="h-11 border-2 focus:border-primary/50 transition-all"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <FormField control={form.control} name="description" render={({ field }) => (<FormItem>
                  <FormLabel className="text-base font-semibold">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe what types of products belong in this category" rows={4} className="border-2 focus:border-primary/50 transition-all resize-none"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} size="lg">
                Cancel
              </Button>
              <Button type="submit" size="lg" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                {categoryId ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
