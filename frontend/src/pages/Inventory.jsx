import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Calendar, Bell, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryList } from '@/components/Inventory/InventoryList';
import { StockMovementForm } from '@/components/Inventory/StockMovementForm';
import { LowStockAlerts } from '@/components/Inventory/LowStockAlerts';
import { ExpiringItems } from '@/components/Inventory/ExpiringItems';
import { ReorderAlerts } from '@/components/Inventory/ReorderAlerts';
import { StocktakeList } from '@/components/Inventory/StocktakeList';
import { useProducts } from '@/hooks/useProducts';
import { useReorderAlerts } from '@/hooks/useReorderAlerts';
export default function Inventory() {
    const [isMovementFormOpen, setIsMovementFormOpen] = useState(false);
    const { products, fetchProducts } = useProducts();
    const { suggestedPOs } = useReorderAlerts();
    useEffect(() => {
        fetchProducts();
    }, []);
    const lowStockProducts = products.filter((p) => p.stock <= p.reorder_level);
    const expiringProducts = products.filter((p) => {
        if (!p.expiry_date)
            return false;
        const expiryDate = new Date(p.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    });
    return (<div className="space-y-4 sm:space-y-6 pb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Inventory Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track stock levels, movements, and alerts
          </p>
        </div>
        <Button onClick={() => setIsMovementFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2"/>
          Add Stock Movement
        </Button>
      </div>

      {(lowStockProducts.length > 0 || expiringProducts.length > 0) && (<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {lowStockProducts.length > 0 && (<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive"/>
                <h3 className="font-semibold text-sm sm:text-base text-destructive">
                  {lowStockProducts.length} Low Stock Alert{lowStockProducts.length > 1 ? 's' : ''}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Products need restocking
              </p>
            </div>)}

          {expiringProducts.length > 0 && (<div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500"/>
                <h3 className="font-semibold text-sm sm:text-base text-orange-500">
                  {expiringProducts.length} Expiring Soon
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Products expiring within 30 days
              </p>
            </div>)}
        </div>)}

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="inventory" className="text-xs sm:text-sm whitespace-nowrap">All Inventory</TabsTrigger>
          <TabsTrigger value="stocktake" className="flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap">
            <ClipboardCheck className="h-3 w-3 sm:h-4 sm:w-4"/>
            Stocktake
          </TabsTrigger>
          <TabsTrigger value="reorder-alerts" className="flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4"/>
            <span className="hidden sm:inline">Reorder Alerts</span>
            <span className="sm:hidden">Reorder</span>
            {suggestedPOs.length > 0 && ` (${suggestedPOs.length})`}
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="text-xs sm:text-sm whitespace-nowrap">
            <span className="hidden sm:inline">Low Stock ({lowStockProducts.length})</span>
            <span className="sm:hidden">Low ({lowStockProducts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="expiring" className="text-xs sm:text-sm whitespace-nowrap">
            <span className="hidden sm:inline">Expiring Soon ({expiringProducts.length})</span>
            <span className="sm:hidden">Expiring ({expiringProducts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <InventoryList products={products} onRefresh={fetchProducts}/>
        </TabsContent>

        <TabsContent value="stocktake">
          <StocktakeList />
        </TabsContent>

        <TabsContent value="reorder-alerts">
          <ReorderAlerts />
        </TabsContent>

        <TabsContent value="low-stock">
          <LowStockAlerts products={lowStockProducts} onRefresh={fetchProducts}/>
        </TabsContent>

        <TabsContent value="expiring">
          <ExpiringItems products={expiringProducts} onRefresh={fetchProducts}/>
        </TabsContent>
      </Tabs>

      <StockMovementForm open={isMovementFormOpen} onClose={() => setIsMovementFormOpen(false)} onSuccess={() => {
            setIsMovementFormOpen(false);
            fetchProducts();
        }}/>
    </div>);
}
