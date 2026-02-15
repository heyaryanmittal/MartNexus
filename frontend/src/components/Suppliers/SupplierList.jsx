import { useState } from 'react';
import { Edit, Trash2, Phone, Mail, MapPin, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { SupplierProductsModal } from './SupplierProductsModal';
import { useSuppliers } from '@/hooks/useSuppliers';
export function SupplierList({ suppliers, onEdit, onRefresh }) {
    const [deleteId, setDeleteId] = useState(null);
    const [productsModalSupplier, setProductsModalSupplier] = useState(null);
    const { deleteSupplier } = useSuppliers();
    const handleDelete = async () => {
        if (deleteId) {
            const success = await deleteSupplier(deleteId);
            if (success)
                onRefresh();
            setDeleteId(null);
        }
    };
    if (suppliers.length === 0) {
        return (<Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground"/>
          </div>
          <h3 className="text-lg font-semibold mb-2">No suppliers yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Add your first supplier to start managing purchases and inventory.
          </p>
        </CardContent>
      </Card>);
    }
    return (<>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supplier) => (<Card key={supplier.id} className="group relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            {}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            
            {}
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-primary/5 group-hover:scale-150 transition-transform duration-500"/>
            
            <CardHeader className="pb-3 relative">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                    {supplier.name}
                  </CardTitle>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge variant={supplier.is_active ? 'default' : 'secondary'} className="text-xs font-mono">
                      {supplier.code}
                    </Badge>
                    {!supplier.is_active && (<Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>)}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2.5 relative">
              {supplier.contact_person && (<div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary">
                      {supplier.contact_person.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{supplier.contact_person}</p>
                </div>)}
              
              {supplier.phone && (<div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group/item">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"/>
                  </div>
                  <span className="truncate">{supplier.phone}</span>
                </div>)}
              
              {supplier.email && (<div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group/item">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                    <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400"/>
                  </div>
                  <span className="truncate">{supplier.email}</span>
                </div>)}
              
              {supplier.city && (<div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group/item">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"/>
                  </div>
                  <span className="truncate">{supplier.city}</span>
                </div>)}
              
              {supplier.payment_terms && (<div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Payment Terms:</span> {supplier.payment_terms}
                  </p>
                </div>)}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1 border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300" onClick={() => setProductsModalSupplier(supplier)}>
                  <Link2 className="w-3.5 h-3.5 mr-1.5"/>
                  <span className="text-xs sm:text-sm">Products</span>
                </Button>
                <Button variant="outline" size="sm" className="border-2 hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300" onClick={() => onEdit(supplier.id)}>
                  <Edit className="w-3.5 h-3.5"/>
                </Button>
                <Button variant="outline" size="sm" className="border-2 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300" onClick={() => setDeleteId(supplier.id)}>
                  <Trash2 className="w-3.5 h-3.5"/>
                </Button>
              </div>
            </CardContent>
          </Card>))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also remove all supplier-product links and may affect purchase orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {productsModalSupplier && (<SupplierProductsModal supplier={productsModalSupplier} open={!!productsModalSupplier} onClose={() => setProductsModalSupplier(null)}/>)}
    </>);
}
