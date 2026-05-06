import { useState, useEffect } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SupplierList } from '@/components/Suppliers/SupplierList';
import { SupplierForm } from '@/components/Suppliers/SupplierForm';
import { PurchaseOrderList } from '@/components/Suppliers/PurchaseOrderList';
import { PurchaseOrderForm } from '@/components/Suppliers/PurchaseOrderForm';
import { useSuppliers } from '@/hooks/useSuppliers';
export default function Suppliers() {
    const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
    const [isPOFormOpen, setIsPOFormOpen] = useState(false);
    const [editingSupplierId, setEditingSupplierId] = useState(null);
    const { suppliers, purchaseOrders, fetchSuppliers, fetchPurchaseOrders } = useSuppliers();
    useEffect(() => {
        fetchSuppliers();
        fetchPurchaseOrders();
    }, []);
    const pendingPOs = purchaseOrders.filter(po => po.status === 'pending' || po.status === 'draft');
    return (<div className="space-y-4 sm:space-y-6 pb-4">
      {}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Supplier Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage suppliers, products, and purchase orders
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsPOFormOpen(true)} className="w-full sm:w-auto border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
            <ShoppingCart className="w-4 h-4 mr-2"/>
            New Purchase Order
          </Button>
          <Button onClick={() => setIsSupplierFormOpen(true)} className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="w-4 h-4 mr-2"/>
            Add Supplier
          </Button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 p-4 sm:p-6 border-0 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-blue-500/10 group-hover:scale-150 transition-transform duration-500"/>
          <div className="relative space-y-1">
            <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Total Suppliers</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{suppliers.length}</p>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950 p-4 sm:p-6 border-0 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-emerald-500/10 group-hover:scale-150 transition-transform duration-500"/>
          <div className="relative space-y-1">
            <p className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Orders</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-900 dark:text-emerald-100">{purchaseOrders.length}</p>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-950 p-4 sm:p-6 border-0 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-orange-500/10 group-hover:scale-150 transition-transform duration-500"/>
          <div className="relative space-y-1">
            <p className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">Pending Orders</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">{pendingPOs.length}</p>
          </div>
        </div>
      </div>

      {}
      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2 h-auto p-1 bg-muted/50">
          <TabsTrigger value="suppliers" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 py-2.5 sm:py-3">
            <span className="text-xs sm:text-sm font-medium">Suppliers ({suppliers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="purchase-orders" className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 py-2.5 sm:py-3">
            <span className="text-xs sm:text-sm font-medium">
              Purchase Orders 
              {pendingPOs.length > 0 && (<span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-orange-500 text-white">
                  {pendingPOs.length}
                </span>)}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4 mt-4">
          <SupplierList suppliers={suppliers} onEdit={(id) => {
            setEditingSupplierId(id);
            setIsSupplierFormOpen(true);
        }} onRefresh={fetchSuppliers}/>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4 mt-4">
          <PurchaseOrderList purchaseOrders={purchaseOrders} onRefresh={fetchPurchaseOrders}/>
        </TabsContent>
      </Tabs>

      <SupplierForm open={isSupplierFormOpen} supplierId={editingSupplierId} onClose={() => {
            setIsSupplierFormOpen(false);
            setEditingSupplierId(null);
        }} onSuccess={() => {
            setIsSupplierFormOpen(false);
            setEditingSupplierId(null);
            fetchSuppliers();
        }}/>

      <PurchaseOrderForm open={isPOFormOpen} suppliers={suppliers} onClose={() => setIsPOFormOpen(false)} onSuccess={() => {
            setIsPOFormOpen(false);
            fetchPurchaseOrders();
        }}/>
    </div>);
}
