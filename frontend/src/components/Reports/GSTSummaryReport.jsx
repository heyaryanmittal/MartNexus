import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Receipt, Download, Calculator, TrendingUp, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import * as XLSX from 'xlsx';

export function GSTSummaryReport({ data, loading }) {
  const [period, setPeriod] = useState('current');
  const [gstType, setGstType] = useState('all');

  const mockGSTData = useMemo(() => ({
    summary: {
      totalTaxableAmount: 125000,
      totalCGST: 11250,
      totalSGST: 11250,
      totalIGST: 0,
      totalGST: 22500,
      exemptedAmount: 8500,
      zeroRatedAmount: 3200,
      totalInvoices: 156,
      gstPercentage: 18
    },
    monthlyBreakdown: [
      {
        month: 'Jan 2024',
        taxableAmount: 95000,
        cgst: 8550,
        sgst: 8550,
        igst: 0,
        totalGST: 17100,
        invoices: 98,
        exempted: 6500,
        zeroRated: 2800
      },
      {
        month: 'Feb 2024',
        taxableAmount: 105000,
        cgst: 9450,
        sgst: 9450,
        igst: 0,
        totalGST: 18900,
        invoices: 112,
        exempted: 7200,
        zeroRated: 3000
      },
      {
        month: 'Mar 2024',
        taxableAmount: 125000,
        cgst: 11250,
        sgst: 11250,
        igst: 0,
        totalGST: 22500,
        invoices: 156,
        exempted: 8500,
        zeroRated: 3200
      }
    ],
    categoryGST: [
      {
        category: 'Grains',
        taxableAmount: 45000,
        cgst: 4050,
        sgst: 4050,
        igst: 0,
        totalGST: 8100,
        gstRate: 18,
        invoices: 45,
        exempted: 0
      },
      {
        category: 'Beverages',
        taxableAmount: 25000,
        cgst: 2250,
        sgst: 2250,
        igst: 0,
        totalGST: 4500,
        gstRate: 18,
        invoices: 28,
        exempted: 2000
      },
      {
        category: 'Snacks',
        taxableAmount: 20000,
        cgst: 1800,
        sgst: 1800,
        igst: 0,
        totalGST: 3600,
        gstRate: 18,
        invoices: 35,
        exempted: 1500
      },
      {
        category: 'Essential Items',
        taxableAmount: 12000,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalGST: 0,
        gstRate: 0,
        invoices: 18,
        exempted: 5000
      },
      {
        category: 'Spices',
        taxableAmount: 15000,
        cgst: 1350,
        sgst: 1350,
        igst: 0,
        totalGST: 2700,
        gstRate: 18,
        invoices: 22,
        exempted: 0
      },
      {
        category: 'Sugar',
        taxableAmount: 8000,
        cgst: 720,
        sgst: 720,
        igst: 0,
        totalGST: 1440,
        gstRate: 18,
        invoices: 8,
        exempted: 0
      }
    ],
    gstRates: [
      { rate: 0, taxableAmount: 12000, gstAmount: 0, invoices: 18 },
      { rate: 5, taxableAmount: 8000, gstAmount: 400, invoices: 8 },
      { rate: 12, taxableAmount: 15000, gstAmount: 1800, invoices: 15 },
      { rate: 18, taxableAmount: 90000, gstAmount: 16200, invoices: 115 }
    ]
  }), []);

  const gstData = data || mockGSTData;

  
  const metrics = useMemo(() => {
    const { summary } = gstData;
    return {
      effectiveGSTRate: summary.totalTaxableAmount > 0 ?
        (summary.totalGST / summary.totalTaxableAmount * 100) : 0,
      averageGSTPerInvoice: summary.totalInvoices > 0 ?
        (summary.totalGST / summary.totalInvoices) : 0,
      taxablePercentage: summary.totalTaxableAmount > 0 ?
        ((summary.totalTaxableAmount / (summary.totalTaxableAmount + summary.exemptedAmount + summary.zeroRatedAmount)) * 100) : 0,
      monthlyGSTGrowth: gstData.monthlyBreakdown.length >= 2 ?
        ((gstData.monthlyBreakdown[2].totalGST - gstData.monthlyBreakdown[1].totalGST) / gstData.monthlyBreakdown[1].totalGST * 100) : 0
    };
  }, [gstData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            GST Summary Report
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
      { Metric: 'Total Taxable Amount', Value: `₹${gstData.summary.totalTaxableAmount.toFixed(2)}` },
      { Metric: 'Total CGST', Value: `₹${gstData.summary.totalCGST.toFixed(2)}` },
      { Metric: 'Total SGST', Value: `₹${gstData.summary.totalSGST.toFixed(2)}` },
      { Metric: 'Total IGST', Value: `₹${gstData.summary.totalIGST.toFixed(2)}` },
      { Metric: 'Total GST', Value: `₹${gstData.summary.totalGST.toFixed(2)}` },
      { Metric: 'Exempted Amount', Value: `₹${gstData.summary.exemptedAmount.toFixed(2)}` },
      { Metric: 'Zero Rated Amount', Value: `₹${gstData.summary.zeroRatedAmount.toFixed(2)}` },
      { Metric: 'Total Invoices', Value: gstData.summary.totalInvoices },
      { Metric: 'Average GST per Invoice', Value: `₹${metrics.averageGSTPerInvoice.toFixed(2)}` },
      { Metric: 'Effective GST Rate', Value: `${metrics.effectiveGSTRate.toFixed(2)}%` }
    ];

    
    const monthlyData = gstData.monthlyBreakdown.map(month => ({
      Month: month.month,
      'Taxable Amount': `₹${month.taxableAmount.toFixed(2)}`,
      CGST: `₹${month.cgst.toFixed(2)}`,
      SGST: `₹${month.sgst.toFixed(2)}`,
      IGST: `₹${month.igst.toFixed(2)}`,
      'Total GST': `₹${month.totalGST.toFixed(2)}`,
      Invoices: month.invoices,
      Exempted: `₹${month.exempted.toFixed(2)}`,
      'Zero Rated': `₹${month.zeroRated.toFixed(2)}`
    }));

    
    const categoryData = gstData.categoryGST.map(cat => ({
      Category: cat.category,
      'Taxable Amount': `₹${cat.taxableAmount.toFixed(2)}`,
      CGST: `₹${cat.cgst.toFixed(2)}`,
      SGST: `₹${cat.sgst.toFixed(2)}`,
      IGST: `₹${cat.igst.toFixed(2)}`,
      'Total GST': `₹${cat.totalGST.toFixed(2)}`,
      'GST Rate': `${cat.gstRate}%`,
      Invoices: cat.invoices,
      Exempted: `₹${cat.exempted.toFixed(2)}`
    }));

    
    const ratesData = gstData.gstRates.map(rate => ({
      'GST Rate': `${rate.rate}%`,
      'Taxable Amount': `₹${rate.taxableAmount.toFixed(2)}`,
      'GST Amount': `₹${rate.gstAmount.toFixed(2)}`,
      Invoices: rate.invoices
    }));

    const wb = XLSX.utils.book_new();

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'GST Summary');

    const monthlyWs = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, monthlyWs, 'Monthly Breakdown');

    const categoryWs = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categoryWs, 'Category GST');

    const ratesWs = XLSX.utils.json_to_sheet(ratesData);
    XLSX.utils.book_append_sheet(wb, ratesWs, 'GST Rates');

    XLSX.writeFile(wb, `gst-summary-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportGSTReturn = () => {
    
    const gstReturnData = {
      'GSTIN': 'XXXXXXXXXXXXXXXXXX', 
      'Period': format(new Date(), 'MMM yyyy'),
      'Total Taxable Supplies': gstData.summary.totalTaxableAmount.toFixed(2),
      'Total CGST': gstData.summary.totalCGST.toFixed(2),
      'Total SGST': gstData.summary.totalSGST.toFixed(2),
      'Total IGST': gstData.summary.totalIGST.toFixed(2),
      'Total Tax': gstData.summary.totalGST.toFixed(2),
      'Exempted Supplies': gstData.summary.exemptedAmount.toFixed(2),
      'Zero Rated Supplies': gstData.summary.zeroRatedAmount.toFixed(2),
      'Total Invoices': gstData.summary.totalInvoices
    };

    const returnContent = `
GST RETURN SUMMARY - GSTR-1
Period: ${format(new Date(), 'MMM yyyy')}
GSTIN: XXXXXXXXXXXXXXXXXX

SUMMARY:
- Total Taxable Supplies: ₹${gstData.summary.totalTaxableAmount.toFixed(2)}
- Total CGST: ₹${gstData.summary.totalCGST.toFixed(2)}
- Total SGST: ₹${gstData.summary.totalSGST.toFixed(2)}
- Total IGST: ₹${gstData.summary.totalIGST.toFixed(2)}
- Total GST: ₹${gstData.summary.totalGST.toFixed(2)}
- Exempted Supplies: ₹${gstData.summary.exemptedAmount.toFixed(2)}
- Zero Rated Supplies: ₹${gstData.summary.zeroRatedAmount.toFixed(2)}
- Total Invoices: ${gstData.summary.totalInvoices}

CATEGORY BREAKDOWN:
${gstData.categoryGST.map(cat =>
      `${cat.category}: Taxable ₹${cat.taxableAmount.toFixed(2)}, GST ₹${cat.totalGST.toFixed(2)}, Rate ${cat.gstRate}%`
    ).join('\n')}

Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm:ss')}
    `;

    const blob = new Blob([returnContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GST-Return-${format(new Date(), 'MMM-yyyy')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getGSTRateColor = (rate) => {
    if (rate === 0) return 'text-green-600';
    if (rate <= 5) return 'text-blue-600';
    if (rate <= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            GST Summary Report
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive GST analysis and compliance report
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportGSTReturn} size="sm" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            GST Return
          </Button>
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
                  <p className="text-sm font-medium text-muted-foreground">Total GST</p>
                  <p className="text-2xl font-bold text-blue-600">₹{gstData.summary.totalGST.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {gstData.summary.totalInvoices} invoices
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CGST + SGST</p>
                  <p className="text-2xl font-bold">₹{(gstData.summary.totalCGST + gstData.summary.totalSGST).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CGST: ₹{gstData.summary.totalCGST.toFixed(2)}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxable Amount</p>
                  <p className="text-2xl font-bold">₹{gstData.summary.totalTaxableAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.taxablePercentage.toFixed(1)}% of total
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
                  <p className="text-sm font-medium text-muted-foreground">Exempted</p>
                  <p className="text-2xl font-bold text-green-600">₹{gstData.summary.exemptedAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Zero rated: ₹{gstData.summary.zeroRatedAmount.toFixed(2)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
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
                  <span className="text-sm font-medium">CGST</span>
                  <span className="text-sm font-bold">₹{gstData.summary.totalCGST.toFixed(2)}</span>
                </div>
                <Progress value={(gstData.summary.totalCGST / gstData.summary.totalGST) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">SGST</span>
                  <span className="text-sm font-bold">₹{gstData.summary.totalSGST.toFixed(2)}</span>
                </div>
                <Progress value={(gstData.summary.totalSGST / gstData.summary.totalGST) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">IGST</span>
                  <span className="text-sm font-bold">₹{gstData.summary.totalIGST.toFixed(2)}</span>
                </div>
                <Progress value={(gstData.summary.totalIGST / gstData.summary.totalGST) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div>
          <h3 className="text-lg font-semibold mb-4">GST by Category</h3>
          <div className="rounded-md border">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Taxable Amount</th>
                    <th className="text-right p-3 font-medium">CGST</th>
                    <th className="text-right p-3 font-medium">SGST</th>
                    <th className="text-right p-3 font-medium">Total GST</th>
                    <th className="text-right p-3 font-medium">GST Rate</th>
                    <th className="text-right p-3 font-medium">Invoices</th>
                    <th className="text-right p-3 font-medium">Exempted</th>
                  </tr>
                </thead>
                <tbody>
                  {gstData.categoryGST.map((category, index) => (
                    <tr key={index} className="border-b hover:bg-muted/25">
                      <td className="p-3 font-medium">{category.category}</td>
                      <td className="text-right p-3">₹{category.taxableAmount.toFixed(2)}</td>
                      <td className="text-right p-3">₹{category.cgst.toFixed(2)}</td>
                      <td className="text-right p-3">₹{category.sgst.toFixed(2)}</td>
                      <td className="text-right p-3 font-medium">
                        <span className="text-blue-600">₹{category.totalGST.toFixed(2)}</span>
                      </td>
                      <td className="text-right p-3">
                        <span className={`font-medium ${getGSTRateColor(category.gstRate)}`}>
                          {category.gstRate}%
                        </span>
                      </td>
                      <td className="text-right p-3">{category.invoices}</td>
                      <td className="text-right p-3">
                        {category.exempted > 0 ? (
                          <Badge variant="secondary">₹{category.exempted.toFixed(2)}</Badge>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {}
        <div>
          <h3 className="text-lg font-semibold mb-4">GST Rates Distribution</h3>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">GST Rate</th>
                    <th className="text-right p-3 font-medium">Taxable Amount</th>
                    <th className="text-right p-3 font-medium">GST Amount</th>
                    <th className="text-right p-3 font-medium">Invoices</th>
                    <th className="text-center p-3 font-medium">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {gstData.gstRates.map((rate, index) => (
                    <tr key={index} className="border-b hover:bg-muted/25">
                      <td className="p-3">
                        <Badge variant={rate.rate === 0 ? 'secondary' : 'default'}>
                          {rate.rate}%
                        </Badge>
                      </td>
                      <td className="text-right p-3">₹{rate.taxableAmount.toFixed(2)}</td>
                      <td className="text-right p-3 font-medium">
                        <span className={getGSTRateColor(rate.rate)}>
                          ₹{rate.gstAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-right p-3">{rate.invoices}</td>
                      <td className="text-center p-3">
                        <div className="flex items-center justify-center">
                          <Progress
                            value={(rate.taxableAmount / gstData.summary.totalTaxableAmount) * 100}
                            className="w-16 h-2 mr-2"
                          />
                          <span className="text-sm">
                            {((rate.taxableAmount / gstData.summary.totalTaxableAmount) * 100).toFixed(1)}%
                          </span>
                        </div>
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
