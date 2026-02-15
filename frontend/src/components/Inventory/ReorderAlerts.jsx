import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { useReorderAlerts } from '@/hooks/useReorderAlerts';
export const ReorderAlerts = () => {
    const { lowStockProducts, isLoading, refetch } = useReorderAlerts();
    if (isLoading) {
        return (<Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading reorder alerts...
        </CardContent>
      </Card>);
    }
    const outOfStockCount = lowStockProducts.filter(p => p.stock === 0).length;
    return (<div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
                <p className="text-sm text-muted-foreground">Products Below Reorder Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Package className="h-6 w-6 text-orange-500"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive"/>
            Low Stock Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (<div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500"/>
              <h3 className="text-lg font-semibold">All Stock Levels OK</h3>
              <p className="text-muted-foreground">No products are below their reorder level</p>
            </div>) : (<Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Reorder Level</TableHead>
                  <TableHead className="text-right">Suggested Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (<TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={product.stock === 0 ? 'destructive' : 'secondary'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{product.reorder_level}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{product.shortage} units</span>
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>)}
        </CardContent>
      </Card>
    </div>);
};
