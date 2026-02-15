import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
export function LowStockAlerts({ products }) {
    if (products.length === 0) {
        return (<Card className="p-12 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
        <h3 className="text-lg font-semibold mb-2">No low stock alerts</h3>
        <p className="text-muted-foreground">
          All products are above their reorder levels
        </p>
      </Card>);
    }
    return (<Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Current Stock</TableHead>
            <TableHead className="text-right">Reorder Level</TableHead>
            <TableHead className="text-right">Shortage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const shortage = Math.max(0, product.reorder_level - product.stock);
            const isOutOfStock = product.stock === 0;
            return (<TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell className="text-right font-semibold text-destructive">
                  {product.stock}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {product.reorder_level}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {shortage} units
                </TableCell>
                <TableCell>
                  <Badge variant={isOutOfStock ? "destructive" : "secondary"}>
                    {isOutOfStock ? "Out of Stock" : "Low Stock"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Order Now
                  </Button>
                </TableCell>
              </TableRow>);
        })}
        </TableBody>
      </Table>
    </Card>);
}
