import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Calculator, Download, PieChart } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import * as XLSX from 'xlsx';

export function ProfitCalculationReport({ data, loading }) {
  const [period, setPeriod] = useState('monthly');
  const [viewMode, setViewMode] = useState('summary');

  const mockProfitData = useMemo(() => ({
    summary: {
      totalRevenue: 125000,
      totalCost: 95000,
      totalProfit: 30000,
      profitMargin: 24,
      grossMargin: 28,
      netMargin: 22,
      operatingExpenses: 5000
    },
    categoryBreakdown: [
      { category: 'Grains', revenue: 45000, cost: 35000, profit: 10000, margin: 22.2, itemsSold: 380 },
      { category: 'Beverages', revenue: 25000, cost: 18000, profit: 7000, margin: 28, itemsSold: 220 },
      { category: 'Snacks', revenue: 20000, cost: 15000, profit: 5000, margin: 25, itemsSold: 450 },
      { category: 'Oil', revenue: 18000, cost: 14000, profit: 4000, margin: 22.2, itemsSold: 120 },
      { category: 'Spices', revenue: 12000, cost: 9000, profit: 3000, margin: 25, itemsSold: 180 },
      { category: 'Sugar', revenue: 5000, cost: 4000, profit: 1000, margin: 20, itemsSold: 95 }
    ],
    productProfitability: [
      { name: 'Rice Basmati 1kg', sku: 'RICE001', revenue: 15000, cost: 12000, profit: 3000, margin: 20, quantity: 125 },
      { name: 'Wheat Flour 5kg', sku: 'WHEAT001', revenue: 12000, cost: 9500, profit: 2500, margin: 20.8, quantity: 60 },
      { name: 'Cooking Oil 1L', sku: 'OIL001', revenue: 10000, cost: 7500, profit: 2500, margin: 25, quantity: 67 },
      { name: 'Tea Powder 250g', sku: 'TEA001', revenue: 8000, cost: 6000, profit: 2000, margin: 25, quantity: 100 },
      { name: 'Biscuits Parle G', sku: 'BIS001', revenue: 7000, cost: 5000, profit: 2000, margin: 28.6, quantity: 700 },
      { name: 'Sugar 1kg', sku: 'SUG001', revenue: 5000, cost: 4000, profit: 1000, margin: 20, quantity: 111 }
    ],
    monthlyTrend: [
      { month: 'Jan', revenue: 95000, cost: 72000, profit: 23000, margin: 24.2 },
      { month: 'Feb', revenue: 105000, cost: 78000, profit: 27000, margin: 25.7 },
      { month: 'Mar', revenue: 125000, cost: 95000, profit: 30000, margin: 24 }
    ]
  }), []);

  const profitData = data || mockProfitData;

  
  const metrics = useMemo(() => {
    const { summary } = profitData;
    return {
      revenueGrowth: summary.totalRevenue > 0 ? ((summary.totalProfit / summary.totalRevenue) * 100) : 0,
      costEfficiency: summary.totalRevenue > 0 ? ((summary.totalRevenue - summary.totalCost) / summary.totalRevenue * 100) : 0,
      breakEvenPoint: summary.totalCost / (summary.totalRevenue > 0 ? summary.totalRevenue / 100 : 1),
      returnOnInvestment: summary.totalCost > 0 ? (summary.totalProfit / summary.totalCost * 100) : 0
    };
  }, [profitData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Profit Calculation Report
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
    
    const summaryData = [
      { Metric: 'Total Revenue', Value: `₹${profitData.summary.totalRevenue.toFixed(2)}` },
      { Metric: 'Total Cost', Value: `₹${profitData.summary.totalCost.toFixed(2)}` },
      { Metric: 'Total Profit', Value: `₹${profitData.summary.totalProfit.toFixed(2)}` },
      { Metric: 'Profit Margin', Value: `${profitData.summary.profitMargin.toFixed(1)}%` },
      { Metric: 'Gross Margin', Value: `${profitData.summary.grossMargin.toFixed(1)}%` },
      { Metric: 'Net Margin', Value: `${profitData.summary.netMargin.toFixed(1)}%` },
      { Metric: 'Operating Expenses', Value: `₹${profitData.summary.operatingExpenses.toFixed(2)}` },
      { Metric: 'Revenue Growth', Value: `${metrics.revenueGrowth.toFixed(1)}%` },
      { Metric: 'Cost Efficiency', Value: `${metrics.costEfficiency.toFixed(1)}%` },
      { Metric: 'Return on Investment', Value: `${metrics.returnOnInvestment.toFixed(1)}%` }
    ];

    
    const categoryData = profitData.categoryBreakdown.map(cat => ({
      Category: cat.category,
      Revenue: `₹${cat.revenue.toFixed(2)}`,
      Cost: `₹${cat.cost.toFixed(2)}`,
      Profit: `₹${cat.profit.toFixed(2)}`,
      'Profit Margin': `${cat.margin.toFixed(1)}%`,
      'Items Sold': cat.itemsSold
    }));

    
    const productData = profitData.productProfitability.map(product => ({
      'Product Name': product.name,
      SKU: product.sku,
      Revenue: `₹${product.revenue.toFixed(2)}`,
      Cost: `₹${product.cost.toFixed(2)}`,
      Profit: `₹${product.profit.toFixed(2)}`,
      'Profit Margin': `${product.margin.toFixed(1)}%`,
      'Quantity Sold': product.quantity
    }));

    const wb = XLSX.utils.book_new();

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const categoryWs = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categoryWs, 'Category Breakdown');

    const productWs = XLSX.utils.json_to_sheet(productData);
    XLSX.utils.book_append_sheet(wb, productWs, 'Product Profitability');

    XLSX.writeFile(wb, `profit-calculation-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getMarginColor = (margin) => {
    if (margin >= 25) return 'text-green-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarginBadge = (margin) => {
    if (margin >= 25) return <Badge variant="default">Excellent</Badge>;
    if (margin >= 15) return <Badge variant="secondary">Good</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Profit Calculation Report
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed profit analysis and margins
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="product">Product</SelectItem>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold text-green-600">₹{profitData.summary.totalProfit.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profitData.summary.profitMargin.toFixed(1)}% margin
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
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{profitData.summary.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gross sales
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-red-600">₹{profitData.summary.totalCost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cost of goods
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ROI</p>
                  <p className="text-2xl font-bold">{metrics.returnOnInvestment.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Return on investment
                  </p>
                </div>
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Gross Margin</span>
                  <span className={`text-sm font-bold ${getMarginColor(profitData.summary.grossMargin)}`}>
                    {profitData.summary.grossMargin.toFixed(1)}%
                  </span>
                </div>
                <Progress value={profitData.summary.grossMargin} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Net Margin</span>
                  <span className={`text-sm font-bold ${getMarginColor(profitData.summary.netMargin)}`}>
                    {profitData.summary.netMargin.toFixed(1)}%
                  </span>
                </div>
                <Progress value={profitData.summary.netMargin} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cost Efficiency</span>
                  <span className={`text-sm font-bold ${getMarginColor(metrics.costEfficiency)}`}>
                    {metrics.costEfficiency.toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.costEfficiency} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        {viewMode === 'category' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Profit by Category</h3>
            <div className="rounded-md border">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-right p-3 font-medium">Revenue</th>
                      <th className="text-right p-3 font-medium">Cost</th>
                      <th className="text-right p-3 font-medium">Profit</th>
                      <th className="text-right p-3 font-medium">Margin</th>
                      <th className="text-right p-3 font-medium">Items Sold</th>
                      <th className="text-center p-3 font-medium">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitData.categoryBreakdown.map((category, index) => (
                      <tr key={index} className="border-b hover:bg-muted/25">
                        <td className="p-3 font-medium">{category.category}</td>
                        <td className="text-right p-3">₹{category.revenue.toFixed(2)}</td>
                        <td className="text-right p-3">₹{category.cost.toFixed(2)}</td>
                        <td className="text-right p-3 font-medium">
                          <span className={category.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ₹{category.profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-right p-3">
                          <span className={`font-medium ${getMarginColor(category.margin)}`}>
                            {category.margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right p-3">{category.itemsSold}</td>
                        <td className="text-center p-3">
                          {getMarginBadge(category.margin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'product' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Product Profitability</h3>
            <div className="rounded-md border">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-left p-3 font-medium">SKU</th>
                      <th className="text-right p-3 font-medium">Revenue</th>
                      <th className="text-right p-3 font-medium">Cost</th>
                      <th className="text-right p-3 font-medium">Profit</th>
                      <th className="text-right p-3 font-medium">Margin</th>
                      <th className="text-right p-3 font-medium">Quantity</th>
                      <th className="text-center p-3 font-medium">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitData.productProfitability.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-muted/25">
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3 text-sm text-muted-foreground">{product.sku}</td>
                        <td className="text-right p-3">₹{product.revenue.toFixed(2)}</td>
                        <td className="text-right p-3">₹{product.cost.toFixed(2)}</td>
                        <td className="text-right p-3 font-medium">
                          <span className={product.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ₹{product.profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-right p-3">
                          <span className={`font-medium ${getMarginColor(product.margin)}`}>
                            {product.margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right p-3">{product.quantity}</td>
                        <td className="text-center p-3">
                          {getMarginBadge(product.margin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'summary' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Monthly Profit Trend</h3>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Month</th>
                      <th className="text-right p-3 font-medium">Revenue</th>
                      <th className="text-right p-3 font-medium">Cost</th>
                      <th className="text-right p-3 font-medium">Profit</th>
                      <th className="text-right p-3 font-medium">Margin</th>
                      <th className="text-center p-3 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitData.monthlyTrend.map((month, index) => {
                      const prevMonth = profitData.monthlyTrend[index - 1];
                      const profitChange = prevMonth ?
                        ((month.profit - prevMonth.profit) / prevMonth.profit * 100) : 0;

                      return (
                        <tr key={index} className="border-b hover:bg-muted/25">
                          <td className="p-3 font-medium">{month.month}</td>
                          <td className="text-right p-3">₹{month.revenue.toFixed(2)}</td>
                          <td className="text-right p-3">₹{month.cost.toFixed(2)}</td>
                          <td className="text-right p-3 font-medium">
                            <span className={month.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ₹{month.profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-right p-3">
                            <span className={`font-medium ${getMarginColor(month.margin)}`}>
                              {month.margin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-center p-3">
                            {index > 0 && (
                              <Badge variant={profitChange >= 0 ? 'default' : 'destructive'}>
                                {profitChange >= 0 ? '+' : ''}{profitChange.toFixed(1)}%
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
