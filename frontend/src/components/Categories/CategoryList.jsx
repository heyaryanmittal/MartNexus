import { Edit, Trash2, FolderOpen, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';

const iconColors = [
    { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' },
    { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
    { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
];
export function CategoryList({ categories, loading, onEdit, onDelete }) {
    if (loading) {
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (<Card key={i} className="p-5">
            <Skeleton className="h-5 w-3/4 mb-3"/>
            <Skeleton className="h-4 w-full mb-2"/>
            <Skeleton className="h-4 w-2/3 mb-4"/>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1"/>
              <Skeleton className="h-8 w-8"/>
            </div>
          </Card>))}
      </div>);
    }
    if (categories.length === 0) {
        return (<Card className="p-16 text-center border-dashed">
        <div className="inline-flex p-4 rounded-full bg-muted mb-4">
          <FolderOpen className="w-12 h-12 text-muted-foreground"/>
        </div>
        <h3 className="text-lg font-semibold mb-2">No categories found</h3>
        <p className="text-muted-foreground text-sm">
          Create your first category to organize products and streamline your inventory
        </p>
      </Card>);
    }
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category, index) => {
            const colorScheme = iconColors[index % iconColors.length];
            return (<Card key={category.id} className="group hover:shadow-md transition-all duration-200">
            <div className="p-5 space-y-4">
              {}
              <div className="flex items-start gap-3">
                <div className={`p-2 ${colorScheme.bg} rounded-lg shrink-0`}>
                  <Package className={`w-5 h-5 ${colorScheme.text}`}/>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-1 line-clamp-1">
                    {category.name}
                  </h3>
                  {category.description ? (<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>) : (<p className="text-xs text-muted-foreground/60 italic">
                      No description
                    </p>)}
                </div>
              </div>

              {}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => onEdit(category.id)}>
                  <Edit className="w-3.5 h-3.5 mr-1.5"/>
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                          <Trash2 className="w-5 h-5 text-destructive"/>
                        </div>
                        Delete Category
                      </AlertDialogTitle>
                      <AlertDialogDescription className="pt-2">
                        Are you sure you want to delete <span className="font-semibold text-foreground">"{category.name}"</span>?
                        This action cannot be undone. Products in this category will be uncategorized.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(category.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete Category
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>);
        })}
    </div>);
}
