import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, TrendingUp, TrendingDown, Download, Search, Filter, BarChart3, Star } from 'lucide-react';
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

export function ProductWiseReport({ data, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');
  const [viewMode, setViewMode] = useState('detailed');

  const mockProductData = useMemo(() => [
    {
      id: 1,
      name: 'Rice Basmati 1kg',
      sku: 'RICE001',
      category: 'Grains',
      quantitySold: 125,
      revenue: 15000,
      cost: 12000,
      profit: 3000,
      profitMargin: 20,
      averagePrice: 120,
      currentStock: 45,
      reorderLevel: 10,
      supplier: 'Grains Corp',
      lastSold: '2024-01-20',
      rating: 4.5,
      returnRate: 2.1
    },
    {
      id: 2,
      name: 'Wheat Flour 5kg',
      sku: 'WHEAT001',
      category: 'Grains',
      quantitySold: 60,
      revenue: 12000,
      cost: 9500,
      profit: 2500,
      profitMargin: 20.8,
      averagePrice: 200,
      currentStock: 8,
      reorderLevel: 15,
      supplier: 'Flour Mills',
      lastSold: '2024-01-19',
      rating: 4.2,
      returnRate: 1.5
    },
    {
      id: 3,
      name: 'Sugar 1kg',
      sku: 'SUG001',
      category: 'Sugar',
      quantitySold: 111,
      revenue: 5000,
      cost: 4000,
      profit: 1000,
      profitMargin: 20,
      averagePrice: 45,
      currentStock: 25,
      reorderLevel: 20,
      supplier: 'Sugar Co',
      lastSold: '2024-01-20',
      rating: 4.0,
      returnRate: 0.8
    },
    {
      id: 4,
      name: 'Cooking Oil 1L',
      sku: 'OIL001',
      category: 'Oil',
      quantitySold: 67,
      revenue: 10000,
      cost: 7500,
      profit: 2500,
      profitMargin: 25,
      averagePrice: 150,
      currentStock: 3,
      reorderLevel: 10,
      supplier: 'Oil Industries',
      lastSold: '2024-01-18',
      rating: 4.7,
      returnRate: 1.2
    },
    {
      id: 5,
      name: 'Tea Powder 250g',
      sku: 'TEA001',
      category: 'Beverages',
      quantitySold: 100,
      revenue: 8000,
      cost: 6000,
      profit: 2000,
      profitMargin: 25,
      averagePrice: 80,
      currentStock: 60,
      reorderLevel: 5,
      supplier: 'Tea Gardens',
      lastSold: '2024-01-20',
      rating: 4.8,
      returnRate: 0.5
    },
    {
      id: 6,
      name: 'Coffee Powder 100g',
      sku: 'COF001',
      category: 'Beverages',
      quantitySold: 42,
      revenue: 5040,
      cost: 4200,
      profit: 840,
      profitMargin: 16.7,
      averagePrice: 120,
      currentStock: 15,
      reorderLevel: 8,
      supplier: 'Coffee Roasters',
      lastSold: '2024-01-19',
      rating: 4.6,
      returnRate: 2.3
    },
    {
      id: 7,
      name: 'Biscuits Parle G',
      sku: 'BIS001',
      category: 'Snacks',
      quantitySold: 700,
      revenue: 7000,
      cost: 5000,
      profit: 2000,
      profitMargin: 28.6,
      averagePrice: 10,
      currentStock: 120,
      reorderLevel: 20,
      supplier: 'Biscuit Co',
      lastSold: '2024-01-20',
      rating: 4.1,
      returnRate: 3.2
    },
    {
      id: 8,
      name: 'Salt 1kg',
      sku: 'SALT001',
      category: 'Spices',
      quantitySold: 175,
      revenue: 3500,
      cost: 3150,
      profit: 350,
      profitMargin: 10,
      averagePrice: 20,
      currentStock: 35,
      reorderLevel: 15,
      supplier: 'Salt Works',
      lastSold: '2024-01-20',
      rating: 3.9,
      returnRate: 0.3
    }
  ], []);

  const products = data || mockProductData;

  
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category_name || p.category || 'Uncategorized'))];
    return cats.sort();
  }, [products]);

  
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const name = product.product_name || product.name || '';
      const sku = product.product_sku || product.sku || '';
      const category = product.category_name || product.category || 'Uncategorized';

      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    
    filtered.sort((a, b) => {
      const aRev = a.total_revenue || a.revenue || 0;
      const bRev = b.total_revenue || b.revenue || 0;
      const aQty = a.total_quantity || a.quantitySold || 0;
      const bQty = b.total_quantity || b.quantitySold || 0;
      const aProf = a.total_profit || a.profit || 0;
      const bProf = b.total_profit || b.profit || 0;
      const aMargin = a.profit_margin || a.profitMargin || 0;
      const bMargin = b.profit_margin || b.profitMargin || 0;
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      const aName = a.product_name || a.name || '';
      const bName = b.product_name || b.name || '';

      switch (sortBy) {
        case 'revenue':
          return bRev - aRev;
        case 'quantity':
          return bQty - aQty;
        case 'profit':
          return bProf - aProf;
        case 'margin':
          return bMargin - aMargin;
        case 'rating':
          return bRating - aRating;
        case 'name':
          return aName.localeCompare(bName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, sortBy]);

  
  const summary = useMemo(() => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => sum + (p.total_revenue || p.revenue || 0), 0);
    const totalProfit = products.reduce((sum, p) => sum + (p.total_profit || p.profit || 0), 0);
    const totalQuantity = products.reduce((sum, p) => sum + (p.total_quantity || p.quantitySold || 0), 0);
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;

    
    const margins = products.map(p => p.profit_margin || p.profitMargin || 0);
    const topPerformers = margins.filter(m => m >= 25).length;
    const lowPerformers = margins.filter(m => m < 15).length;

    const totalRating = products.reduce((sum, p) => sum + (p.rating || 0), 0);
    const averageRating = totalProducts > 0 ? totalRating / totalProducts : 0;

    return {
      totalProducts,
      totalRevenue,
      totalProfit,
      totalQuantity,
      averageMargin,
      topPerformers,
      lowPerformers,
      averageRating
    };
  }, [products]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product-wise Report
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
    const exportData = filteredAndSortedProducts.map(product => {
      const name = product.product_name || product.name || '';
      const sku = product.product_sku || product.sku || '';
      const category = product.category_name || product.category || 'Uncategorized';
      const qty = product.total_quantity || product.quantitySold || 0;
      const rev = product.total_revenue || product.revenue || 0;
      const cost = product.total_cost || product.cost || 0;
      const profit = product.total_profit || product.profit || 0;
      const margin = product.profit_margin || product.profitMargin || 0;
      const avgPrice = product.averagePrice || (qty > 0 ? rev / qty : 0);
      const stock = product.currentStock || 0;
      const rating = product.rating || 0;

      return {
        'Product Name': name,
        SKU: sku,
        Category: category,
        'Quantity Sold': qty,
        Revenue: `₹${rev.toFixed(2)}`,
        Cost: `₹${cost.toFixed(2)}`,
        Profit: `₹${profit.toFixed(2)}`,
        'Profit Margin': `${margin.toFixed(1)}%`,
        'Average Price': `₹${avgPrice.toFixed(2)}`,
        'Current Stock': stock,
        'Reorder Level': product.reorderLevel || 0,
        Supplier: product.supplier || 'N/A',
        Rating: rating.toFixed(1),
        'Return Rate': `${product.returnRate || 0}%`,
        'Stock Status': stock <= (product.reorderLevel || 0) ? 'Low Stock' : 'Normal'
      };
    });

    
    exportData.push({
      'Product Name': 'TOTAL',
      'Quantity Sold': summary.totalQuantity,
      Revenue: `₹${summary.totalRevenue.toFixed(2)}`,
      Cost: `₹${(summary.totalRevenue - summary.totalProfit).toFixed(2)}`,
      Profit: `₹${summary.totalProfit.toFixed(2)}`,
      'Profit Margin': `${summary.averageMargin.toFixed(1)}%`
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Product Report');
    XLSX.writeFile(wb, `product-wise-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getPerformanceBadge = (margin) => {
    if (margin >= 25) return <Badge variant="default">High</Badge>;
    if (margin >= 15) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  const getStockBadge = (current, reorder) => {
    if (current === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (current <= reorder) return <Badge variant="destructive">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-200 text-yellow-400" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="h-3 w-3 text-gray-300" />);
    }

    return stars;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product-wise Report
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed performance analysis for each product
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{summary.totalProducts}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.topPerformers} high performers
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
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{summary.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {summary.totalQuantity} units sold
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
                  <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold text-green-600">₹{summary.totalProfit.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.averageMargin.toFixed(1)}% average margin
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{summary.averageRating.toFixed(1)}</p>
                  <div className="flex mt-1">
                    {getRatingStars(summary.averageRating)}
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
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
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="margin">Margin</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Product Performance
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredAndSortedProducts.length} products)
            </span>
          </h3>
          <div className="rounded-md border">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Sold</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                    <th className="text-right p-3 font-medium">Profit</th>
                    <th className="text-right p-3 font-medium">Margin</th>
                    <th className="text-right p-3 font-medium">Stock</th>
                    <th className="text-center p-3 font-medium">Rating</th>
                    <th className="text-center p-3 font-medium">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProducts.map((product) => {
                    const name = product.product_name || product.name || '';
                    const sku = product.product_sku || product.sku || '';
                    const category = product.category_name || product.category || 'Uncategorized';
                    const qty = product.total_quantity || product.quantitySold || 0;
                    const rev = product.total_revenue || product.revenue || 0;
                    const profit = product.total_profit || product.profit || 0;
                    const margin = product.profit_margin || product.profitMargin || 0;
                    const stock = product.currentStock || 0;
                    const reorder = product.reorderLevel || 0;

                    return (
                      <tr key={product.product_id || product.id} className="border-b hover:bg-muted/25">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{name}</div>
                            <div className="text-sm text-muted-foreground">{sku}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{category}</Badge>
                        </td>
                        <td className="text-right p-3 font-medium">{qty}</td>
                        <td className="text-right p-3">₹{rev.toFixed(2)}</td>
                        <td className="text-right p-3">
                          <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ₹{profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-right p-3">
                          <span className={`font-medium ${margin >= 25 ? 'text-green-600' :
                            margin >= 15 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right p-3">
                          {getStockBadge(stock, reorder)}
                        </td>
                        <td className="text-center p-3">
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex">
                              {getRatingStars(product.rating)}
                            </div>
                            <span className="text-xs text-muted-foreground ml-1">
                              {(product.rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          {getPerformanceBadge(margin)}
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          </div>
        </div>

        {}
        {viewMode === 'summary' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">By Revenue</h4>
                  <div className="space-y-2">
                    {filteredAndSortedProducts.slice(0, 3).map((product, index) => (
                      <div key={product.product_id || product.id} className="flex justify-between items-center">
                        <span className="text-sm truncate">{product.product_name || product.name}</span>
                        <span className="text-sm font-medium">₹{(product.total_revenue || product.revenue || 0).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">By Profit Margin</h4>
                  <div className="space-y-2">
                    {[...filteredAndSortedProducts]
                      .sort((a, b) => (b.profit_margin || b.profitMargin || 0) - (a.profit_margin || a.profitMargin || 0))
                      .slice(0, 3)
                      .map((product) => (
                        <div key={product.product_id || product.id} className="flex justify-between items-center">
                          <span className="text-sm truncate">{product.product_name || product.name}</span>
                          <span className="text-sm font-medium">{(product.profit_margin || product.profitMargin || 0).toFixed(1)}%</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">By Quantity Sold</h4>
                  <div className="space-y-2">
                    {[...filteredAndSortedProducts]
                      .sort((a, b) => (b.total_quantity || b.quantitySold || 0) - (a.total_quantity || a.quantitySold || 0))
                      .slice(0, 3)
                      .map((product) => (
                        <div key={product.product_id || product.id} className="flex justify-between items-center">
                          <span className="text-sm truncate">{product.product_name || product.name}</span>
                          <span className="text-sm font-medium">{product.total_quantity || product.quantitySold || 0}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
