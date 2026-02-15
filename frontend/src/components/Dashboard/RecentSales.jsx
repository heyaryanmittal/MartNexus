import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Receipt } from 'lucide-react';
import { format } from 'date-fns';
export function RecentSales({ sales, loading }) {
    const navigate = useNavigate();
    if (loading) {
        return (<Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4"/>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-16 w-full"/>))}
        </div>
      </Card>);
    }
    if (!sales || sales.length === 0) {
        return (<Card className="p-12 text-center">
        <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
        <h3 className="text-lg font-semibold mb-2">No recent sales</h3>
        <p className="text-muted-foreground mb-4">
          Start making sales to see them here
        </p>
        <Button onClick={() => navigate('/pos')}>Go to POS</Button>
      </Card>);
    }
    return (<Card>
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-lg">Recent Transactions</h2>
          <p className="text-sm text-muted-foreground">Latest sales activity</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/sales')}>
          View All
          <ArrowRight className="w-4 h-4 ml-2"/>
        </Button>
      </div>

      <div className="p-6 space-y-4">
        {sales.slice(0, 5).map((sale) => (<div key={sale.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold">{sale.sale_number}</span>
                <Badge variant="secondary">
                  {sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{format(new Date(sale.created_at), 'PPp')}</span>
                <span>•</span>
                <span>{sale.sale_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-primary">
                ₹{Number(sale.total_amount).toFixed(2)}
              </div>
            </div>
          </div>))}
      </div>
    </Card>);
}
