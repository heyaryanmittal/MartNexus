import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Download, Filter, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export function CustomDateSalesReport({ data, loading }) {
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Custom Date Sales Report
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

  
  const filteredData = data?.dailySales?.filter(day => {
    if (!dateRange.from || !dateRange.to) return true;
    const dayDate = new Date(day.date);
    return isWithinInterval(dayDate, {
      start: startOfDay(dateRange.from),
      end: endOfDay(dateRange.to)
    });
  }) || [];

  
  const summary = filteredData.reduce((acc, day) => ({
    revenue: acc.revenue + day.revenue,
    cost: acc.cost + day.cost,
    profit: acc.profit + day.profit,
    sales_count: acc.sales_count + day.sales_count
  }), { revenue: 0, cost: 0, profit: 0, sales_count: 0 });

  const handleExportExcel = () => {
    const exportData = filteredData.map(day => ({
      Date: format(new Date(day.date), 'dd MMM yyyy'),
      Revenue: `₹${day.revenue.toFixed(2)}`,
      Cost: `₹${day.cost.toFixed(2)}`,
      Profit: `₹${day.profit.toFixed(2)}`,
      'Sales Count': day.sales_count,
      'Average Sale': `₹${day.sales_count > 0 ? (day.revenue / day.sales_count).toFixed(2) : 0}`,
      'Profit Margin': `${day.revenue > 0 ? (day.profit / day.revenue * 100).toFixed(1) : 0}%`
    }));

    
    exportData.push({
      Date: 'TOTAL',
      Revenue: `₹${summary.revenue.toFixed(2)}`,
      Cost: `₹${summary.cost.toFixed(2)}`,
      Profit: `₹${summary.profit.toFixed(2)}`,
      'Sales Count': summary.sales_count,
      'Average Sale': `₹${summary.sales_count > 0 ? (summary.revenue / summary.sales_count).toFixed(2) : 0}`,
      'Profit Margin': `${summary.revenue > 0 ? (summary.profit / summary.revenue * 100).toFixed(1) : 0}%`
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Custom Date Sales');

    const fileName = dateRange.from && dateRange.to ?
      `custom-sales-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.xlsx` :
      `custom-sales-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const handleExportPDF = () => {
    
    
    const reportContent = `
CUSTOM DATE SALES REPORT
${dateRange.from && dateRange.to ?
        `Period: ${format(dateRange.from, 'dd MMM yyyy')} - ${format(dateRange.to, 'dd MMM yyyy')}` :
        'All Data'
      }

SUMMARY:
Total Revenue: ₹${summary.revenue.toFixed(2)}
Total Cost: ₹${summary.cost.toFixed(2)}
Total Profit: ₹${summary.profit.toFixed(2)}
Total Sales: ${summary.sales_count}
Average Sale Value: ₹${summary.sales_count > 0 ? (summary.revenue / summary.sales_count).toFixed(2) : 0}
Profit Margin: ${summary.revenue > 0 ? (summary.profit / summary.revenue * 100).toFixed(1) : 0}%

DAILY BREAKDOWN:
${filteredData.map(day =>
        `${format(new Date(day.date), 'dd MMM yyyy')}: Revenue ₹${day.revenue.toFixed(2)}, Profit ₹${day.profit.toFixed(2)}, Sales ${day.sales_count}`
      ).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = dateRange.from && dateRange.to ?
      `custom-sales-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.txt` :
      `custom-sales-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Custom Date Sales Report
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze sales for any specific date range
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Date Range:</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, 'PPP') : 'Pick start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                      disabled={(date) => dateRange.to && date > dateRange.to}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-sm text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, 'PPP') : 'Pick end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                      disabled={(date) => dateRange.from && date < dateRange.from}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateRange({ from: null, to: null })}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {dateRange.from && dateRange.to ? 'Selected Period' : 'All Time'} Revenue
                  </p>
                  <p className="text-2xl font-bold">₹{summary.revenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {filteredData.length} days
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
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">{summary.sales_count}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Transactions
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
                  <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold">₹{summary.profit.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.revenue > 0 ? `${(summary.profit / summary.revenue * 100).toFixed(1)}% margin` : '0% margin'}
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
                    ₹{summary.sales_count > 0 ? (summary.revenue / summary.sales_count).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per transaction
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Daily Breakdown
            {dateRange.from && dateRange.to && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({format(dateRange.from, 'dd MMM yyyy')} - {format(dateRange.to, 'dd MMM yyyy')})
              </span>
            )}
          </h3>
          <div className="rounded-md border">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                    <th className="text-right p-3 font-medium">Cost</th>
                    <th className="text-right p-3 font-medium">Profit</th>
                    <th className="text-right p-3 font-medium">Margin</th>
                    <th className="text-right p-3 font-medium">Sales</th>
                    <th className="text-right p-3 font-medium">Avg Sale</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((day, index) => (
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
                      <td className="text-right p-3">
                        <Badge variant={day.revenue > 0 && (day.profit / day.revenue * 100) >= 20 ? 'default' : 'secondary'}>
                          {day.revenue > 0 ? (day.profit / day.revenue * 100).toFixed(1) : 0}%
                        </Badge>
                      </td>
                      <td className="text-right p-3">{day.sales_count}</td>
                      <td className="text-right p-3">
                        ₹{day.sales_count > 0 ? (day.revenue / day.sales_count).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                  {filteredData.length > 0 && (
                    <tr className="border-t-2 bg-muted/50 font-semibold">
                      <td className="p-3">TOTAL</td>
                      <td className="text-right p-3">₹{summary.revenue.toFixed(2)}</td>
                      <td className="text-right p-3">₹{summary.cost.toFixed(2)}</td>
                      <td className="text-right p-3">
                        <Badge variant={summary.profit >= 0 ? 'default' : 'destructive'}>
                          ₹{summary.profit.toFixed(2)}
                        </Badge>
                      </td>
                      <td className="text-right p-3">
                        <Badge variant={summary.revenue > 0 && (summary.profit / summary.revenue * 100) >= 20 ? 'default' : 'secondary'}>
                          {summary.revenue > 0 ? (summary.profit / summary.revenue * 100).toFixed(1) : 0}%
                        </Badge>
                      </td>
                      <td className="text-right p-3">{summary.sales_count}</td>
                      <td className="text-right p-3">
                        ₹{summary.sales_count > 0 ? (summary.revenue / summary.sales_count).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
