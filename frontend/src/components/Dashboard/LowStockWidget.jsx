import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Package } from 'lucide-react';
export function LowStockWidget({ products, loading }) {
    const navigate = useNavigate();
    if (loading) {
        return (<Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4"/>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-16 w-full"/>))}
        </div>
      </Card>);
    }
    if (!products || products.length === 0) {
        return (<Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-green-500"/>
          <h3 className="font-semibold text-lg">Stock Status</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-green-500"/>
          </div>
          <p className="text-sm text-muted-foreground">All stock levels are healthy!</p>
        </div>
      </Card>);
    }
    return (<Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500"/>
          <h3 className="font-semibold text-lg">Low Stock Alert</h3>
        </div>
        <Badge variant="destructive">{products.length}</Badge>
      </div>

      <div className="space-y-3 mb-4">
        {products.slice(0, 5).map((product) => (<div key={product.id} className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-sm">{product.name}</span>
              <Badge variant="secondary" className="text-xs">
                {product.stock} left
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{product.sku}</span>
              <span>Reorder at: {product.reorder_level}</span>
            </div>
          </div>))}
      </div>

      {products.length > 5 && (<p className="text-sm text-muted-foreground mb-4 text-center">
          +{products.length - 5} more items need attention
        </p>)}

      <Button variant="outline" className="w-full" onClick={() => navigate('/inventory')}>
        View All Low Stock
      </Button>
    </Card>);
}
