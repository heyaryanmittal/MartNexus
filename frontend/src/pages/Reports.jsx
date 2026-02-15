import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, TrendingUp, Package, Calculator, Receipt, BarChart3 } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { SalesOverview } from '@/components/Reports/SalesOverview';
import { RevenueChart } from '@/components/Reports/RevenueChart';
import { TopProducts } from '@/components/Reports/TopProducts';
import { ProfitAnalysis } from '@/components/Reports/ProfitAnalysis';
import { DailySalesReport } from '@/components/Reports/DailySalesReport';
import { MonthlySalesReport } from '@/components/Reports/MonthlySalesReport';
import { CustomDateSalesReport } from '@/components/Reports/CustomDateSalesReport';
import { StockSummaryReport } from '@/components/Reports/StockSummaryReport';
import { StockPeriodReport } from '@/components/Reports/StockPeriodReport';
import { CustomStockReport } from '@/components/Reports/CustomStockReport';
import { ProfitCalculationReport } from '@/components/Reports/ProfitCalculationReport';
import { GSTSummaryReport } from '@/components/Reports/GSTSummaryReport';
import { ProductWiseReport } from '@/components/Reports/ProductWiseReport';
import { useReports } from '@/hooks/useReports';
export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [period, setPeriod] = useState('daily');
  const { data, loading } = useReports(startOfDay(dateRange.from).toISOString(), endOfDay(dateRange.to).toISOString());
  const handleExport = () => {
    
    const csvData = [
      ['Sales Report', `${format(dateRange.from, 'PP')} - ${format(dateRange.to, 'PP')}`],
      [],
      ['Summary'],
      ['Total Sales', data?.summary.totalSales || 0],
      ['Total Revenue', `₹${data?.summary.totalRevenue.toFixed(2) || 0}`],
      ['Total Profit', `₹${data?.summary.totalProfit.toFixed(2) || 0}`],
      ['Average Order Value', `₹${data?.summary.averageOrderValue.toFixed(2) || 0}`],
      [],
      ['Top Products'],
      ['Product', 'Quantity Sold', 'Revenue', 'Profit'],
      ...(data?.topProducts || []).map(p => [
        p.product_name,
        p.total_quantity,
        `₹${p.total_revenue.toFixed(2)}`,
        `₹${p.total_profit.toFixed(2)}`
      ])
    ];
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (<div className="space-y-4 sm:space-y-6 pb-4">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Reports & Analytics
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Comprehensive business insights and performance metrics
        </p>
      </div>
    </div>

    <Tabs defaultValue="sales" className="space-y-4">
      <TabsList className="w-full grid grid-cols-2 lg:grid-cols-5 h-auto">
        <TabsTrigger value="sales" className="text-xs sm:text-sm py-2">
          <TrendingUp className="h-4 w-4 mr-2 hidden sm:inline" />
          Sales
        </TabsTrigger>
        <TabsTrigger value="stock" className="text-xs sm:text-sm py-2">
          <Package className="h-4 w-4 mr-2 hidden sm:inline" />
          Stock
        </TabsTrigger>
        <TabsTrigger value="profit" className="text-xs sm:text-sm py-2">
          <Calculator className="h-4 w-4 mr-2 hidden sm:inline" />
          Profit
        </TabsTrigger>
        <TabsTrigger value="gst" className="text-xs sm:text-sm py-2">
          <Receipt className="h-4 w-4 mr-2 hidden sm:inline" />
          GST
        </TabsTrigger>
        <TabsTrigger value="products" className="text-xs sm:text-sm py-2">
          <BarChart3 className="h-4 w-4 mr-2 hidden sm:inline" />
          Products
        </TabsTrigger>
      </TabsList>

      {}
      <TabsContent value="sales" className="space-y-6">
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="daily" className="text-xs sm:text-sm py-2">Daily</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs sm:text-sm py-2">Monthly</TabsTrigger>
            <TabsTrigger value="custom" className="text-xs sm:text-sm py-2">Custom Date</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <DailySalesReport data={data} loading={loading} />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlySalesReport data={data} loading={loading} />
          </TabsContent>

          <TabsContent value="custom">
            <CustomDateSalesReport data={data} loading={loading} />
          </TabsContent>
        </Tabs>

        {}
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
            <div className="flex flex-row gap-2 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start flex-1 sm:flex-initial px-2 sm:px-4 h-9 sm:h-10">
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate text-xs sm:text-sm">{format(dateRange.from, 'PP')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                    disabled={(date) => dateRange.to && date > dateRange.to}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-sm text-muted-foreground shrink-0">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start flex-1 sm:flex-initial px-2 sm:px-4 h-9 sm:h-10">
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate text-xs sm:text-sm">{format(dateRange.to, 'PP')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                    disabled={(date) => dateRange.from && date < dateRange.from}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant={period === 'daily' ? 'default' : 'outline'} size="sm" className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm" onClick={() => setPeriod('daily')}>
                Daily
              </Button>
              <Button variant={period === 'weekly' ? 'default' : 'outline'} size="sm" className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm" onClick={() => setPeriod('weekly')}>
                Weekly
              </Button>
              <Button variant={period === 'monthly' ? 'default' : 'outline'} size="sm" className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm" onClick={() => setPeriod('monthly')}>
                Monthly
              </Button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm" onClick={() => setDateRange({
                from: subDays(new Date(), 7),
                to: new Date(),
              })}>
                <span className="hidden sm:inline">Last 7 Days</span>
                <span className="sm:hidden">7D</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial h-8 text-xs sm:text-sm" onClick={() => setDateRange({
                from: subDays(new Date(), 30),
                to: new Date(),
              })}>
                <span className="hidden sm:inline">Last 30 Days</span>
                <span className="sm:hidden">30D</span>
              </Button>
            </div>
          </div>
        </Card>

        <SalesOverview data={data?.summary} loading={loading} />

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="revenue" className="text-xs sm:text-sm py-2 whitespace-nowrap">
              <span className="hidden sm:inline">Revenue Trends</span>
              <span className="sm:hidden">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm py-2 whitespace-nowrap">
              <span className="hidden sm:inline">Top Products</span>
              <span className="sm:hidden">Products</span>
            </TabsTrigger>
            <TabsTrigger value="profit" className="text-xs sm:text-sm py-2 whitespace-nowrap">
              <span className="hidden sm:inline">Profit Analysis</span>
              <span className="sm:hidden">Profit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <RevenueChart data={data?.dailySales} loading={loading} period={period} />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <TopProducts data={data?.topProducts} loading={loading} />
          </TabsContent>

          <TabsContent value="profit" className="space-y-4">
            <ProfitAnalysis data={data?.profitAnalysis} loading={loading} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {}
      <TabsContent value="stock" className="space-y-6">
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="summary" className="text-xs sm:text-sm py-2">Summary</TabsTrigger>
            <TabsTrigger value="7days" className="text-xs sm:text-sm py-2">7 Days</TabsTrigger>
            <TabsTrigger value="15days" className="text-xs sm:text-sm py-2">15 Days</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs sm:text-sm py-2">Monthly</TabsTrigger>
            <TabsTrigger value="custom" className="text-xs sm:text-sm py-2">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <StockSummaryReport stockData={data?.stockData} loading={loading} />
          </TabsContent>

          <TabsContent value="7days">
            <StockPeriodReport stockData={data?.stockData} loading={loading} />
          </TabsContent>

          <TabsContent value="15days">
            <StockPeriodReport stockData={data?.stockData} loading={loading} />
          </TabsContent>

          <TabsContent value="monthly">
            <StockPeriodReport stockData={data?.stockData} loading={loading} />
          </TabsContent>

          <TabsContent value="custom">
            <CustomStockReport stockData={data?.stockData} loading={loading} />
          </TabsContent>

        </Tabs>
      </TabsContent>

      {}
      <TabsContent value="profit" className="space-y-6">
        <ProfitCalculationReport data={data} loading={loading} />
      </TabsContent>

      {}
      <TabsContent value="gst" className="space-y-6">
        <GSTSummaryReport data={data} loading={loading} />
      </TabsContent>

      {}
      <TabsContent value="products" className="space-y-6">
        <ProductWiseReport data={data?.topProducts} loading={loading} />
      </TabsContent>
    </Tabs>
  </div>);
}
