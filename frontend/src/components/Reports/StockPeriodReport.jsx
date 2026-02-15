import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, TrendingUp, TrendingDown, Download, BarChart3, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import * as XLSX from 'xlsx';

export function StockPeriodReport({ stockData, salesData, loading }) {
  const [period, setPeriod] = useState('7days');

  const mockStockData = useMemo(() => [
    { id: 1, name: 'Rice Basmati 1kg', sku: 'RICE001', category: 'Grains', currentStock: 45, openingStock: 60, unitPrice: 120, cost: 100 },
    { id: 2, name: 'Wheat Flour 5kg', sku: 'WHEAT001', category: 'Grains', currentStock: 8, openingStock: 25, unitPrice: 200, cost: 180 },
    { id: 3, name: 'Sugar 1kg', sku: 'SUG001', category: 'Sugar', currentStock: 25, openingStock: 30, unitPrice: 45, cost: 40 },
    { id: 4, name: 'Cooking Oil 1L', sku: 'OIL001', category: 'Oil', currentStock: 3, openingStock: 20, unitPrice: 150, cost: 130 },
    { id: 5, name: 'Tea Powder 250g', sku: 'TEA001', category: 'Beverages', currentStock: 60, openingStock: 40, unitPrice: 80, cost: 70 },
    { id: 6, name: 'Coffee Powder 100g', sku: 'COF001', category: 'Beverages', currentStock: 15, openingStock: 18, unitPrice: 120, cost: 100 },
    { id: 7, name: 'Biscuits Parle G', sku: 'BIS001', category: 'Snacks', currentStock: 120, openingStock: 80, unitPrice: 10, cost: 8 },
    { id: 8, name: 'Salt 1kg', sku: 'SALT001', category: 'Spices', currentStock: 35, openingStock: 35, unitPrice: 20, cost: 18 },
  ], []);

  const products = stockData || mockStockData;

  
  const stockMovement = useMemo(() => {
    return products.map(product => {
      const quantitySold = product.openingStock - product.currentStock;
      const salesOfItemRevenue = Math.abs(quantitySold) * product.unitPrice;
      const salesOfItemCost = Math.abs(quantitySold) * product.cost;
      const profit = salesOfItemRevenue - salesOfItemCost;
      const movementPercentage = product.openingStock > 0 ?
        ((product.openingStock - product.currentStock) / product.openingStock * 100) : 0;

      return {
        ...product,
        quantitySold,
        salesRevenue: salesOfItemRevenue,
        salesCost: salesOfItemCost,
        profit,
        movementPercentage,
        stockTurnover: product.openingStock > 0 ? Math.abs(quantitySold) / product.openingStock : 0
      };
    });
  }, [products]);

  
  const summary = useMemo(() => {
    const totalProducts = products.length;
    const totalOpeningStock = products.reduce((sum, p) => sum + p.openingStock, 0);
    const totalCurrentStock = products.reduce((sum, p) => sum + p.currentStock, 0);
    const totalQuantitySold = stockMovement.reduce((sum, p) => sum + Math.abs(p.quantitySold), 0);
    const totalSalesRevenue = stockMovement.reduce((sum, p) => sum + p.salesRevenue, 0);
    const totalProfitOfItems = stockMovement.reduce((sum, p) => sum + p.profit, 0);
    const fastMovingItemsCount = stockMovement.filter(p => p.stockTurnover >= 0.5).length;
    const slowMovingItemsCount = stockMovement.filter(p => p.stockTurnover < 0.1).length;

    return {
      totalProducts,
      totalOpeningStock,
      totalCurrentStock,
      totalQuantitySold,
      totalSalesRevenue,
      totalProfit: totalProfitOfItems,
      fastMovingItems: fastMovingItemsCount,
      slowMovingItems: slowMovingItemsCount,
      stockChange: totalCurrentStock - totalOpeningStock
    };
  }, [products, stockMovement]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Movement Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleExportExcel = () => {
    const exportData = stockMovement.map(product => ({
      'Product Name': product.name,
      SKU: product.sku,
      Category: product.category,
      'Opening Stock': product.openingStock,
      'Current Stock': product.currentStock,
      'Quantity Sold': Math.abs(product.quantitySold),
      'Sales Revenue': `₹${product.salesRevenue.toFixed(2)}`,
      'Cost': `₹${product.salesCost.toFixed(2)}`,
      'Profit': `₹${product.profit.toFixed(2)}`,
      'Stock Turnover': product.stockTurnover.toFixed(2),
      'Movement %': `${product.movementPercentage.toFixed(1)}%`,
      'Movement Type': product.quantitySold > 0 ? 'Sold' : product.quantitySold < 0 ? 'Restocked' : 'No Change'
    }));

    
    exportData.push({
      'Product Name': 'TOTAL',
      'Opening Stock': summary.totalOpeningStock,
      'Current Stock': summary.totalCurrentStock,
      'Quantity Sold': summary.totalQuantitySold,
      'Sales Revenue': `₹${summary.totalSalesRevenue.toFixed(2)}`,
      'Profit': `₹${summary.totalProfit.toFixed(2)}`
    });

    const periodLabel = period === '7days' ? '7-Days' : period === '15days' ? '15-Days' : 'Monthly';
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${periodLabel} Stock Report`);
    XLSX.writeFile(wb, `stock-movement-${period}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getMovementBadge = (product) => {
    if (product.quantitySold > 0) {
      return <Badge variant="default">Sold</Badge>;
    } else if (product.quantitySold < 0) {
      return <Badge variant="secondary">Restocked</Badge>;
    } else {
      return <Badge variant="outline">No Change</Badge>;
    }
  };

  const getTurnoverBadge = (turnover) => {
    if (turnover >= 0.5) {
      return <Badge variant="default">Fast Moving</Badge>;
    } else if (turnover < 0.1) {
      return <Badge variant="destructive">Slow Moving</Badge>;
    } else {
      return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const periodOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '15days', label: 'Last 15 Days' },
    { value: 'monthly', label: 'Last Month' }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Movement Report
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Track inventory movement and turnover rates
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportExcel} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Stock Change</p>
                  <p className="text-2xl font-bold">
                    {summary.stockChange >= 0 ? '+' : ''}{summary.stockChange}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.stockChange >= 0 ? 'Stock increased' : 'Stock decreased'}
                  </p>
                </div>
                {summary.stockChange >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items Sold</p>
                  <p className="text-2xl font-bold">{summary.totalQuantitySold}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total units sold
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sales Revenue</p>
                  <p className="text-2xl font-bold">₹{summary.totalSalesRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From stock sales
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fast Moving</p>
                  <p className="text-2xl font-bold text-green-600">{summary.fastMovingItems}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.slowMovingItems} slow moving
                  </p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Stock Movement Details
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({periodOptions.find(p => p.value === period)?.label})
            </span>
          </h3>
          <div className="rounded-md border">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Opening</th>
                    <th className="text-right p-3 font-medium">Current</th>
                    <th className="text-right p-3 font-medium">Sold</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                    <th className="text-right p-3 font-medium">Profit</th>
                    <th className="text-center p-3 font-medium">Turnover</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovement.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/25">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sku}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="text-right p-3">{product.openingStock}</td>
                      <td className="text-right p-3 font-medium">{product.currentStock}</td>
                      <td className="text-right p-3">
                        <span className={product.quantitySold > 0 ? 'text-red-600' : 'text-green-600'}>
                          {Math.abs(product.quantitySold)}
                        </span>
                      </td>
                      <td className="text-right p-3">₹{product.salesRevenue.toFixed(2)}</td>
                      <td className="text-right p-3">
                        <span className={product.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ₹{product.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        {getTurnoverBadge(product.stockTurnover)}
                      </td>
                      <td className="text-center p-3">
                        {getMovementBadge(product)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
