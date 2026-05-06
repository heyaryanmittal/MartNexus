import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export function MonthlySalesReport({ data, loading }) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Sales Report
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


  const monthlyData = data?.dailySales?.reduce((acc, day) => {
    const monthKey = day.date.substring(0, 7);
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        revenue: 0,
        cost: 0,
        profit: 0,
        sales_count: 0,
        days: []
      };
    }
    acc[monthKey].revenue += day.revenue;
    acc[monthKey].cost += day.cost;
    acc[monthKey].profit += day.profit;
    acc[monthKey].sales_count += day.sales_count;
    acc[monthKey].days.push(day);
    return acc;
  }, {}) || {};

  const monthlyArray = Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
  const defaultData = {
    month: selectedMonth || format(new Date(), 'yyyy-MM'),
    revenue: 0,
    cost: 0,
    profit: 0,
    sales_count: 0,
    days: []
  };

  const currentMonthData = monthlyArray.find(m => m.month === selectedMonth) || monthlyArray[0] || defaultData;
  const previousMonthData = monthlyArray[1] || defaultData;

  const revenueChange = previousMonthData.revenue > 0 ?
    ((currentMonthData.revenue - previousMonthData.revenue) / previousMonthData.revenue * 100).toFixed(1) : 0;

  const handleExportExcel = () => {
    const exportData = monthlyArray.map(month => ({
      Month: format(new Date(month.month + '-01'), 'MMM yyyy'),
      Revenue: `₹${month.revenue.toFixed(2)}`,
      Cost: `₹${month.cost.toFixed(2)}`,
      Profit: `₹${month.profit.toFixed(2)}`,
      'Sales Count': month.sales_count,
      'Average Daily Revenue': `₹${(month.revenue / month.days.length).toFixed(2)}`,
      'Profit Margin': `${month.revenue > 0 ? (month.profit / month.revenue * 100).toFixed(1) : 0}%`
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Sales');
    XLSX.writeFile(wb, `monthly-sales-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const generateMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMM yyyy');
      options.push({ value, label });
    }
    return options;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Sales Report
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Monthly performance and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map(option => (
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
        { }
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {format(new Date(currentMonthData.month + '-01'), 'MMM yyyy')} Revenue
                  </p>
                  <p className="text-2xl font-bold">₹{currentMonthData.revenue.toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    {revenueChange >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {revenueChange}% from last month
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sales Count</p>
                  <p className="text-2xl font-bold">{currentMonthData.sales_count || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total transactions
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
                  <p className="text-sm font-medium text-muted-foreground">Monthly Profit</p>
                  <p className="text-2xl font-bold">₹{(currentMonthData.profit || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentMonthData.revenue > 0 ?
                      `${(currentMonthData.profit / currentMonthData.revenue * 100).toFixed(1)}% margin` :
                      '0% margin'
                    }
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                  <p className="text-2xl font-bold">
                    ₹{currentMonthData.days?.length > 0 ?
                      (currentMonthData.revenue / currentMonthData.days.length).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per day revenue
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        { }
        <div>
          <h3 className="text-lg font-semibold mb-4">Monthly Comparison</h3>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Month</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                    <th className="text-right p-3 font-medium">Cost</th>
                    <th className="text-right p-3 font-medium">Profit</th>
                    <th className="text-right p-3 font-medium">Margin</th>
                    <th className="text-right p-3 font-medium">Sales</th>
                    <th className="text-right p-3 font-medium">Daily Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyArray.slice(0, 6).map((month, index) => (
                    <tr key={index} className="border-b hover:bg-muted/25">
                      <td className="p-3 font-medium">
                        {format(new Date(month.month + '-01'), 'MMM yyyy')}
                      </td>
                      <td className="text-right p-3 font-medium">
                        ₹{month.revenue.toFixed(2)}
                      </td>
                      <td className="text-right p-3">
                        ₹{month.cost.toFixed(2)}
                      </td>
                      <td className="text-right p-3">
                        <Badge variant={month.profit >= 0 ? 'default' : 'destructive'}>
                          ₹{month.profit.toFixed(2)}
                        </Badge>
                      </td>
                      <td className="text-right p-3">
                        <Badge variant={month.revenue > 0 && (month.profit / month.revenue * 100) >= 20 ? 'default' : 'secondary'}>
                          {month.revenue > 0 ? (month.profit / month.revenue * 100).toFixed(1) : 0}%
                        </Badge>
                      </td>
                      <td className="text-right p-3">{month.sales_count}</td>
                      <td className="text-right p-3">
                        ₹{(month.revenue / month.days.length).toFixed(2)}
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
