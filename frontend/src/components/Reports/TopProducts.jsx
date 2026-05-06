import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';
export function TopProducts({ data, loading }) {
    if (loading) {
        return (<Card className="p-6">
        <Skeleton className="h-8 w-48 mb-4"/>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-16 w-full"/>))}
        </div>
      </Card>);
    }
    if (!data || data.length === 0) {
        return (<Card className="p-12 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
        <p className="text-muted-foreground">No product sales data available</p>
      </Card>);
    }
    return (<Card>
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500"/>
          <h3 className="font-semibold text-lg">Top Selling Products</h3>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Qty Sold</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 10).map((product, index) => (<TableRow key={product.product_id}>
              <TableCell>
                <div className="flex items-center justify-center">
                  {index === 0 && <Badge className="bg-yellow-500">🥇</Badge>}
                  {index === 1 && <Badge className="bg-gray-400">🥈</Badge>}
                  {index === 2 && <Badge className="bg-amber-600">🥉</Badge>}
                  {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.product_name}</TableCell>
              <TableCell className="text-muted-foreground">{product.product_sku}</TableCell>
              <TableCell className="text-right font-semibold">
                {product.total_quantity}
              </TableCell>
              <TableCell className="text-right">
                ₹{product.total_revenue.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-green-600 font-medium">
                ₹{product.total_profit.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600"/>
                  <span className={product.profit_margin > 30 ? 'text-green-600 font-medium' : ''}>
                    {product.profit_margin.toFixed(1)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>))}
        </TableBody>
      </Table>
    </Card>);
}
