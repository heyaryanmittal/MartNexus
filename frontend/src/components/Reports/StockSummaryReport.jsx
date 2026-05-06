import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, TrendingDown, AlertTriangle, Download, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

export function StockSummaryReport({ stockData, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Summary Report
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

  
  const mockStockData = [
    { id: 1, name: 'Rice Basmati 1kg', sku: 'RICE001', category: 'Grains', currentStock: 45, minStock: 10, maxStock: 100, unitPrice: 120, cost: 100, lastRestocked: '2024-01-15' },
    { id: 2, name: 'Wheat Flour 5kg', sku: 'WHEAT001', category: 'Grains', currentStock: 8, minStock: 15, maxStock: 50, unitPrice: 200, cost: 180, lastRestocked: '2024-01-10' },
    { id: 3, name: 'Sugar 1kg', sku: 'SUG001', category: 'Sugar', currentStock: 25, minStock: 20, maxStock: 80, unitPrice: 45, cost: 40, lastRestocked: '2024-01-12' },
    { id: 4, name: 'Cooking Oil 1L', sku: 'OIL001', category: 'Oil', currentStock: 3, minStock: 10, maxStock: 40, unitPrice: 150, cost: 130, lastRestocked: '2024-01-08' },
    { id: 5, name: 'Tea Powder 250g', sku: 'TEA001', category: 'Beverages', currentStock: 60, minStock: 5, maxStock: 30, unitPrice: 80, cost: 70, lastRestocked: '2024-01-14' },
    { id: 6, name: 'Coffee Powder 100g', sku: 'COF001', category: 'Beverages', currentStock: 15, minStock: 8, maxStock: 25, unitPrice: 120, cost: 100, lastRestocked: '2024-01-11' },
    { id: 7, name: 'Biscuits Parle G', sku: 'BIS001', category: 'Snacks', currentStock: 120, minStock: 20, maxStock: 200, unitPrice: 10, cost: 8, lastRestocked: '2024-01-13' },
    { id: 8, name: 'Salt 1kg', sku: 'SALT001', category: 'Spices', currentStock: 35, minStock: 15, maxStock: 60, unitPrice: 20, cost: 18, lastRestocked: '2024-01-09' },
  ];

  const products = stockData || mockStockData;

  
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = product.currentStock <= product.minStock;
      } else if (stockFilter === 'overstock') {
        matchesStock = product.currentStock >= product.maxStock;
      } else if (stockFilter === 'normal') {
        matchesStock = product.currentStock > product.minStock && product.currentStock < product.maxStock;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  
  const summary = useMemo(() => {
    const totalProducts = products.length;
    const lowStockItems = products.filter(p => p.currentStock <= p.minStock).length;
    const outOfStockItems = products.filter(p => p.currentStock === 0).length;
    const overstockItems = products.filter(p => p.currentStock >= p.maxStock).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
    const totalCostValue = products.reduce((sum, p) => sum + (p.currentStock * p.cost), 0);

    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      overstockItems,
      totalStockValue,
      totalCostValue,
      potentialProfit: totalStockValue - totalCostValue
    };
  }, [products]);

  const handleExportExcel = () => {
    const exportData = filteredProducts.map(product => ({
      'Product Name': product.name,
      SKU: product.sku,
      Category: product.category,
      'Current Stock': product.currentStock,
      'Min Stock': product.minStock,
      'Max Stock': product.maxStock,
      'Unit Price': `₹${product.unitPrice}`,
      'Cost': `₹${product.cost}`,
      'Stock Value': `₹${(product.currentStock * product.unitPrice).toFixed(2)}`,
      'Cost Value': `₹${(product.currentStock * product.cost).toFixed(2)}`,
      'Potential Profit': `₹${(product.currentStock * (product.unitPrice - product.cost)).toFixed(2)}`,
      'Status': product.currentStock === 0 ? 'Out of Stock' : 
                product.currentStock <= product.minStock ? 'Low Stock' :
                product.currentStock >= product.maxStock ? 'Overstock' : 'Normal',
      'Last Restocked': product.lastRestocked
    }));

    
    exportData.push({
      'Product Name': 'TOTAL',
      'Stock Value': `₹${filteredProducts.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0).toFixed(2)}`,
      'Cost Value': `₹${filteredProducts.reduce((sum, p) => sum + (p.currentStock * p.cost), 0).toFixed(2)}`,
      'Potential Profit': `₹${filteredProducts.reduce((sum, p) => sum + (product.currentStock * (product.unitPrice - product.cost)), 0).toFixed(2)}`
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Summary');
    XLSX.writeFile(wb, `stock-summary-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStockStatusBadge = (product) => {
    if (product.currentStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.currentStock <= product.minStock) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (product.currentStock >= product.maxStock) {
      return <Badge variant="secondary">Overstock</Badge>;
    } else {
      return <Badge variant="default">Normal</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Summary Report
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Current inventory status and stock levels
          </p>
        </div>
        <Button onClick={handleExportExcel} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{summary.totalProducts}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    In inventory
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
                <Package className="h-8 w-8 text-muted-foreground" />
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
                <TrendingDown className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="overstock">Overstock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Inventory Details 
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
                    <th className="text-right p-3 font-medium">Stock Value</th>
                    <th className="text-right p-3 font-medium">Profit</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
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
                      <td className="text-right p-3 font-medium">
                        {product.currentStock}
                      </td>
                      <td className="text-right p-3 text-sm">
                        {product.minStock} / {product.maxStock}
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
