import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle, RefreshCw,
  DollarSign, Receipt, TrendingDown, Calendar, Clock, Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStore } from '../store/useStore';
import { useDashboard } from '@/hooks/useDashboard';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeShop } = useStore();
  const { data, loading, refreshData } = useDashboard();

  useEffect(() => {
    if (activeShop?.id) {
      refreshData();
    }
  }, [activeShop?.id, refreshData]);

  const handleRefresh = () => {
    if (!activeShop) {
      toast.error('Please select a shop first');
      return;
    }
    refreshData();
    toast.success('Dashboard refreshed');
  };


  const quickActions = [
    {
      label: 'New Sale',
      icon: ShoppingCart,
      onClick: () => navigate('/pos'),
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      hoverColor: 'hover:from-emerald-600 hover:to-teal-700'
    },
    {
      label: 'Add Product',
      icon: Package,
      onClick: () => navigate('/products'),
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-700'
    },
    {
      label: 'View Reports',
      icon: TrendingUp,
      onClick: () => navigate('/reports'),
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      hoverColor: 'hover:from-purple-600 hover:to-pink-700'
    },
    {
      label: 'Stock Alerts',
      icon: AlertTriangle,
      onClick: () => navigate('/inventory'),
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      hoverColor: 'hover:from-orange-600 hover:to-red-700'
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value) || 0;
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              {activeShop ? (
                <>
                  <Store className="w-4 h-4" />
                  <span className="font-medium">{activeShop.name}</span>
                </>
              ) : (
                <span>Select a shop to view dashboard</span>
              )}
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {!activeShop ? (
          <Card className="p-12 text-center bg-white">
            <Store className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Shop Selected</h3>
            <p className="text-gray-600 mb-6">Please select a shop from the sidebar to view dashboard</p>
            <Button onClick={() => navigate('/my-shops')} className="bg-blue-500 hover:bg-blue-600">
              Go to My Shops
            </Button>
          </Card>
        ) : (
          <>
            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.label}
                    className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${action.color} ${action.hoverColor} text-white border-0`}
                    onClick={action.onClick}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative p-6 flex flex-col items-center text-center gap-3">
                      <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Icon className="w-8 h-8" />
                      </div>
                      <span className="text-base font-bold tracking-wide">{action.label}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Card>
                );
              })}
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {}
              <Card className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <Receipt className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${(data?.metrics?.salesChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {(data?.metrics?.salesChange || 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {formatPercentage(data?.metrics?.salesChange)}
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Today's Sales</h3>
                <p className="text-3xl font-bold text-gray-900">{data?.metrics?.todaySales || 0}</p>
                <p className="text-xs text-gray-500 mt-2">vs yesterday</p>
              </Card>

              {/* Today's Revenue */}
              <Card className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${(data?.metrics?.revenueChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {(data?.metrics?.revenueChange || 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {formatPercentage(data?.metrics?.revenueChange)}
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Today's Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(data?.metrics?.todayRevenue)}</p>
                <p className="text-xs text-gray-500 mt-2">vs yesterday</p>
              </Card>

              {/* Monthly Revenue */}
              <Card className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    This Month
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Monthly Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(data?.metrics?.monthRevenue)}</p>
                <p className="text-xs text-gray-500 mt-2">{data?.metrics?.monthSales || 0} sales</p>
              </Card>

              {/* Low Stock Items */}
              <Card className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  {(data?.metrics?.lowStockCount || 0) > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                      Alert
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Low Stock Items</h3>
                <p className="text-3xl font-bold text-gray-900">{data?.metrics?.lowStockCount || 0}</p>
                <p className="text-xs text-gray-500 mt-2">Need reorder</p>
              </Card>
            </div>

            {/* Sales Trend Chart */}
            <Card className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Sales Trend (Last 7 Days)
              </h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : data?.salesTrend && data.salesTrend.length > 0 ? (
                  <>
                    {data.salesTrend.map((day, index) => {
                      const maxRevenue = Math.max(...data.salesTrend.map(d => d.revenue));
                      const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-medium">{day.formattedDate}</span>
                            <span className="text-gray-900 font-bold">{formatCurrency(day.revenue)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{day.sales} sales</span>
                            <span>Profit: {formatCurrency(day.profit)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">No sales data available</div>
                )}
              </div>
            </Card>

            {/* Low Stock Products & Recent Bills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Low Stock Products */}
              <Card className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Low Stock Products
                </h3>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                    data.lowStockProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">{product.stock} left</p>
                          <p className="text-xs text-gray-500">Min: {product.reorderLevel}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>All products are well stocked!</p>
                    </div>
                  )}
                </div>
                {data?.lowStockProducts && data.lowStockProducts.length > 0 && (
                  <Button
                    onClick={() => navigate('/inventory')}
                    className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white"
                  >
                    View All Stock Alerts
                  </Button>
                )}
              </Card>

              {/* Recent Bills */}
              <Card className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Bills
                </h3>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : data?.recentBills && data.recentBills.length > 0 ? (
                    data.recentBills.map((bill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/invoices/${bill.id}`)}>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{bill.billNumber}</p>
                          <p className="text-xs text-gray-600">{bill.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600">{formatCurrency(bill.totalAmount)}</p>
                          <p className="text-xs text-gray-500">{bill.paymentMode}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                      <p>No bills today</p>
                    </div>
                  )}
                </div>
                {data?.recentBills && data.recentBills.length > 0 && (
                  <Button
                    onClick={() => navigate('/invoices')}
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    View All Invoices
                  </Button>
                )}
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 border-0">
                <h3 className="text-sm font-medium opacity-90 mb-2">Today's Profit</h3>
                <p className="text-3xl font-bold">{formatCurrency(data?.metrics?.todayProfit)}</p>
                <p className="text-xs opacity-75 mt-2">After costs & taxes</p>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl shadow-lg p-6 border-0">
                <h3 className="text-sm font-medium opacity-90 mb-2">Avg Order Value</h3>
                <p className="text-3xl font-bold">{formatCurrency(data?.metrics?.avgOrderValue)}</p>
                <p className="text-xs opacity-75 mt-2">This month</p>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg p-6 border-0">
                <h3 className="text-sm font-medium opacity-90 mb-2">Total Products</h3>
                <p className="text-3xl font-bold">{data?.metrics?.totalProducts || 0}</p>
                <p className="text-xs opacity-75 mt-2">In inventory</p>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
