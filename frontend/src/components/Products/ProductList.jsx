import { Edit, Trash2, Package, DollarSign, Box, AlertTriangle, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { useState } from 'react';

export function ProductList({ products, loading, onEdit, onDelete }) {
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (<Card key={i} className="p-5">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-16 w-full mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </Card>))}
    </div>);
  }
  if (products.length === 0) {
    return (<Card className="p-16 text-center border-dashed">
      <div className="inline-flex p-4 rounded-full bg-muted mb-4">
        <Package className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No products found</h3>
      <p className="text-muted-foreground text-sm">
        Get started by adding your first product to your inventory
      </p>
    </Card>);
  }

  const getUnitLabel = (type) => {
    switch (type) {
      case 'KG': return 'kg';
      case 'LITERS': return 'L';
      default: return 'pcs';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedProducts.map((product) => {
          const isLowStock = product.stock <= (product.reorderLevel || 5);
          return (<Card key={product.id} className={`group transition-all duration-200 ${product.isActive
            ? 'shadow-sm shadow-green-500/20 hover:shadow-md hover:shadow-green-500/30 border-green-500/20'
            : 'shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-red-500/30 border-red-500/20 opacity-70'}`}>
            <div className="p-5 space-y-4">
              {}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-base leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  {!product.isActive && <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Inactive</span>}
                </div>

                <p className="text-xs text-muted-foreground font-mono">
                  SKU: {product.sku || 'N/A'}
                </p>

                {}
                {product.barcode && (<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Barcode className="w-3.5 h-3.5" />
                  <span className="font-mono">{product.barcode}</span>
                </div>)}
              </div>

              {}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-md bg-muted/50 border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-muted-foreground">Price</span>
                  </div>
                  <p className="font-semibold text-sm text-green-600 dark:text-green-400">
                    ₹{parseFloat(product.sellingPrice).toFixed(2)}
                  </p>
                </div>

                <div className={`p-2.5 rounded-md border ${isLowStock
                  ? 'bg-destructive/5 border-destructive/20'
                  : 'bg-muted/50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Box className={`w-3.5 h-3.5 ${isLowStock ? 'text-destructive' : 'text-blue-600 dark:text-blue-400'}`} />
                    <span className="text-xs text-muted-foreground">Stock</span>
                  </div>
                  <p className={`font-semibold text-sm ${isLowStock ? 'text-destructive' : 'text-blue-600 dark:text-blue-400'}`}>
                    {parseFloat(product.stock)} {getUnitLabel(product.quantityType)}
                  </p>
                </div>
              </div>

              {}
              {isLowStock && (<div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                <span className="text-xs font-medium text-destructive">
                  Low Stock (Reorder: {product.reorderLevel})
                </span>
              </div>)}

              {}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => onEdit(product.id)}>
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                          <Trash2 className="w-5 h-5 text-destructive" />
                        </div>
                        Delete Product
                      </AlertDialogTitle>
                      <AlertDialogDescription className="pt-2">
                        Are you sure you want to delete <span className="font-semibold text-foreground">"{product.name}"</span>?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(product.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>);
        })}
      </div>

      {}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
