import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Download, Filter, CalendarIcon, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

export function CustomStockReport({ stockData, loading }) {
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');

  const mockStockData = useMemo(() => [
    {
      id: 1,
      name: 'Rice Basmati 1kg',
      sku: 'RICE001',
      category: 'Grains',
      currentStock: 45,
      minStock: 10,
      maxStock: 100,
      unitPrice: 120,
      cost: 100,
      supplier: 'Grains Corp',
      lastRestocked: '2024-01-15',
      daysSinceRestock: 5,
      monthlyConsumption: 25,
      reorderPoint: 15,
      safetyStock: 5
    },
    {
      id: 2,
      name: 'Wheat Flour 5kg',
      sku: 'WHEAT001',
      category: 'Grains',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unitPrice: 200,
      cost: 180,
      supplier: 'Flour Mills',
      lastRestocked: '2024-01-10',
      daysSinceRestock: 10,
      monthlyConsumption: 20,
      reorderPoint: 20,
      safetyStock: 8
    },
    {
      id: 3,
      name: 'Sugar 1kg',
      sku: 'SUG001',
      category: 'Sugar',
      currentStock: 25,
      minStock: 20,
      maxStock: 80,
      unitPrice: 45,
      cost: 40,
      supplier: 'Sugar Co',
      lastRestocked: '2024-01-12',
      daysSinceRestock: 8,
      monthlyConsumption: 30,
      reorderPoint: 25,
      safetyStock: 10
    },
    {
      id: 4,
      name: 'Cooking Oil 1L',
      sku: 'OIL001',
      category: 'Oil',
      currentStock: 3,
      minStock: 10,
      maxStock: 40,
      unitPrice: 150,
      cost: 130,
      supplier: 'Oil Industries',
      lastRestocked: '2024-01-08',
      daysSinceRestock: 12,
      monthlyConsumption: 15,
      reorderPoint: 12,
      safetyStock: 5
    },
    {
      id: 5,
      name: 'Tea Powder 250g',
      sku: 'TEA001',
      category: 'Beverages',
      currentStock: 60,
      minStock: 5,
      maxStock: 30,
      unitPrice: 80,
      cost: 70,
      supplier: 'Tea Gardens',
      lastRestocked: '2024-01-14',
      daysSinceRestock: 6,
      monthlyConsumption: 12,
      reorderPoint: 8,
      safetyStock: 3
    },
    {
      id: 6,
      name: 'Coffee Powder 100g',
      sku: 'COF001',
      category: 'Beverages',
      currentStock: 15,
      minStock: 8,
      maxStock: 25,
      unitPrice: 120,
      cost: 100,
      supplier: 'Coffee Roasters',
      lastRestocked: '2024-01-11',
      daysSinceRestock: 9,
      monthlyConsumption: 8,
      reorderPoint: 10,
      safetyStock: 4
    },
    {
      id: 7,
      name: 'Biscuits Parle G',
      sku: 'BIS001',
      category: 'Snacks',
      currentStock: 120,
      minStock: 20,
      maxStock: 200,
      unitPrice: 10,
      cost: 8,
      supplier: 'Biscuit Co',
      lastRestocked: '2024-01-13',
      daysSinceRestock: 7,
      monthlyConsumption: 50,
      reorderPoint: 30,
      safetyStock: 15
    },
    {
      id: 8,
      name: 'Salt 1kg',
      sku: 'SALT001',
      category: 'Spices',
      currentStock: 35,
      minStock: 15,
      maxStock: 60,
      unitPrice: 20,
      cost: 18,
      supplier: 'Salt Works',
      lastRestocked: '2024-01-09',
      daysSinceRestock: 11,
      monthlyConsumption: 18,
      reorderPoint: 20,
      safetyStock: 8
    }
  ], []);

  const products = stockData || mockStockData;

  
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const restockDate = new Date(product.lastRestocked);
        matchesDate = isWithinInterval(restockDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to)
        });
      }

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

      let matchesStockStatus = true;
      if (stockStatusFilter === 'low') {
        matchesStockStatus = product.currentStock <= product.minStock;
      } else if (stockStatusFilter === 'normal') {
        matchesStockStatus = product.currentStock > product.minStock && product.currentStock < product.maxStock;
      } else if (stockStatusFilter === 'overstock') {
        matchesStockStatus = product.currentStock >= product.maxStock;
      } else if (stockStatusFilter === 'critical') {
        matchesStockStatus = product.currentStock <= product.reorderPoint;
      }

      return matchesDate && matchesCategory && matchesStockStatus;
    });
  }, [products, dateRange, categoryFilter, stockStatusFilter]);

  
  const summary = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const lowStockItems = filteredProducts.filter(p => p.currentStock <= p.minStock).length;
    const criticalItems = filteredProducts.filter(p => p.currentStock <= p.reorderPoint).length;
    const outOfStockItems = filteredProducts.filter(p => p.currentStock === 0).length;
    const overstockItems = filteredProducts.filter(p => p.currentStock >= p.maxStock).length;
    const totalStockValue = filteredProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
    const totalCostValue = filteredProducts.reduce((sum, p) => sum + (p.currentStock * p.cost), 0);
    const potentialProfit = totalStockValue - totalCostValue;

    return {
      totalProducts,
      lowStockItems,
      criticalItems,
      outOfStockItems,
      overstockItems,
      totalStockValue,
      totalCostValue,
      potentialProfit
    };
  }, [filteredProducts]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Custom Stock Report
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
    const exportData = filteredProducts.map(product => ({
      'Product Name': product.name,
      SKU: product.sku,
      Category: product.category,
      'Current Stock': product.currentStock,
      'Min Stock': product.minStock,
      'Max Stock': product.maxStock,
      'Reorder Point': product.reorderPoint,
      'Safety Stock': product.safetyStock,
      'Monthly Consumption': product.monthlyConsumption,
      'Days of Stock': product.monthlyConsumption > 0 ? Math.round(product.currentStock / (product.monthlyConsumption / 30)) : 0,
      'Unit Price': `₹${product.unitPrice}`,
      'Cost': `₹${product.cost}`,
      'Stock Value': `₹${(product.currentStock * product.unitPrice).toFixed(2)}`,
      'Cost Value': `₹${(product.currentStock * product.cost).toFixed(2)}`,
      'Potential Profit': `₹${(product.currentStock * (product.unitPrice - product.cost)).toFixed(2)}`,
      Supplier: product.supplier,
      'Last Restocked': product.lastRestocked,
      'Days Since Restock': product.daysSinceRestock,
      'Stock Status': product.currentStock === 0 ? 'Out of Stock' :
        product.currentStock <= product.reorderPoint ? 'Critical' :
          product.currentStock <= product.minStock ? 'Low Stock' :
            product.currentStock >= product.maxStock ? 'Overstock' : 'Normal'
    }));

    
    exportData.push({
      'Product Name': 'TOTAL',
      'Current Stock': filteredProducts.reduce((sum, p) => sum + p.currentStock, 0),
      'Stock Value': `₹${summary.totalStockValue.toFixed(2)}`,
      'Cost Value': `₹${summary.totalCostValue.toFixed(2)}`,
      'Potential Profit': `₹${summary.potentialProfit.toFixed(2)}`
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Custom Stock Report');

    const fileName = dateRange.from && dateRange.to ?
      `custom-stock-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.xlsx` :
      `custom-stock-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const getStockStatusBadge = (product) => {
    if (product.currentStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.currentStock <= product.reorderPoint) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (product.currentStock <= product.minStock) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (product.currentStock >= product.maxStock) {
      return <Badge variant="secondary">Overstock</Badge>;
    } else {
      return <Badge variant="default">Normal</Badge>;
    }
  };

  const getDaysOfStockColor = (days) => {
    if (days <= 7) return 'text-red-600';
    if (days <= 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Custom Stock Report
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced inventory analysis with custom filters
          </p>
        </div>
        <Button onClick={handleExportExcel} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <div className="flex flex-row gap-2 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, 'PPP') : 'Restock From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-sm text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, 'PPP') : 'Restock To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="overstock">Overstock</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange({ from: null, to: null });
                  setCategoryFilter('all');
                  setStockStatusFilter('all');
                }}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Filtered Products</p>
                  <p className="text-2xl font-bold">{summary.totalProducts}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.criticalItems} critical items
                  </p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">{summary.lowStockItems}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.outOfStockItems} out of stock
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Value</p>
                  <p className="text-2xl font-bold">₹{summary.totalStockValue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current inventory value
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
                  <p className="text-sm font-medium text-muted-foreground">Potential Profit</p>
                  <p className="text-2xl font-bold text-green-600">₹{summary.potentialProfit.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    If all sold
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Custom Stock Analysis
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredProducts.length} products)
            </span>
          </h3>
          <div className="rounded-md border">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Stock</th>
                    <th className="text-right p-3 font-medium">Min/Max</th>
                    <th className="text-right p-3 font-medium">Days Stock</th>
                    <th className="text-right p-3 font-medium">Stock Value</th>
                    <th className="text-right p-3 font-medium">Profit</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const daysOfStock = product.monthlyConsumption > 0 ?
                      Math.round(product.currentStock / (product.monthlyConsumption / 30)) : 0;

                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/25">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.sku}</div>
                            <div className="text-xs text-muted-foreground">{product.supplier}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{product.category}</Badge>
                        </td>
                        <td className="text-right p-3 font-medium">{product.currentStock}</td>
                        <td className="text-right p-3 text-sm">
                          {product.minStock} / {product.maxStock}
                        </td>
                        <td className="text-right p-3">
                          <span className={`font-medium ${getDaysOfStockColor(daysOfStock)}`}>
                            {daysOfStock} days
                          </span>
                        </td>
                        <td className="text-right p-3">
                          ₹{(product.currentStock * product.unitPrice).toFixed(2)}
                        </td>
                        <td className="text-right p-3">
                          <span className={product.currentStock * (product.unitPrice - product.cost) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ₹{(product.currentStock * (product.unitPrice - product.cost)).toFixed(2)}
                          </span>
                        </td>
                        <td className="text-center p-3">
                          {getStockStatusBadge(product)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
