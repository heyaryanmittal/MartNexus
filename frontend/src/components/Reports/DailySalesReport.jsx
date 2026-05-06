import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export function DailySalesReport({ data, loading, onExport }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Sales Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todayData = data?.dailySales?.[data?.dailySales?.length - 1] || {};
  const yesterdayData = data?.dailySales?.[data?.dailySales?.length - 2] || {};

  const todayRevenue = todayData.revenue || 0;
  const yesterdayRevenue = yesterdayData.revenue || 0;
  const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : 0;

  const handleExportExcel = () => {
    const exportData = data?.dailySales?.map(day => ({
      Date: format(new Date(day.date), 'dd MMM yyyy'),
      Revenue: `₹${day.revenue.toFixed(2)}`,
      Cost: `₹${day.cost.toFixed(2)}`,
      Profit: `₹${day.profit.toFixed(2)}`,
      'Sales Count': day.sales_count,
      'Average Sale': `₹${day.sales_count > 0 ? (day.revenue / day.sales_count).toFixed(2) : 0}`
    })) || [];

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Sales');
    XLSX.writeFile(wb, `daily-sales-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Sales Report
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Today's performance and daily breakdown
          </p>
        </div>
        <Button onClick={handleExportExcel} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold">₹{todayRevenue.toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    {revenueChange >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {revenueChange}% from yesterday
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
                  <p className="text-2xl font-bold">{todayData.sales_count || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total transactions today
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Profit</p>
                  <p className="text-2xl font-bold">₹{(todayData.profit || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenue minus cost
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
                  <p className="text-sm font-medium text-muted-foreground">Average Sale</p>
                  <p className="text-2xl font-bold">
                    ₹{todayData.sales_count > 0 ? (todayRevenue / todayData.sales_count).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per transaction value
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div>
          <h3 className="text-lg font-semibold mb-4">Daily Breakdown</h3>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">

                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                    <th className="text-right p-3 font-medium">Cost</th>
                    <th className="text-right p-3 font-medium">Profit</th>
                    <th className="text-right p-3 font-medium">Sales</th>
                    <th className="text-right p-3 font-medium">Avg Sale</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.dailySales?.slice(-7).map((day, index) => (
                    <tr key={index} className="border-b hover:bg-muted/25">
                      <td className="p-3">
                        {format(new Date(day.date), 'dd MMM yyyy')}
                      </td>
                      <td className="text-right p-3 font-medium">
                        ₹{day.revenue.toFixed(2)}
                      </td>
                      <td className="text-right p-3">
                        ₹{day.cost.toFixed(2)}
                      </td>
                      <td className="text-right p-3">
                        <Badge variant={day.profit >= 0 ? 'default' : 'destructive'}>
                          ₹{day.profit.toFixed(2)}
                        </Badge>
                      </td>
                      <td className="text-right p-3">{day.sales_count}</td>
                      <td className="text-right p-3">
                        ₹{day.sales_count > 0 ? (day.revenue / day.sales_count).toFixed(2) : '0.00'}
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
