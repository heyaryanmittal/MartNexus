import { DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown, Users, Calendar, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
export function MetricsCards({ data, loading }) {
    if (loading) {
        return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(8)].map((_, i) => (<Card key={i} className="p-4 sm:p-6">
            <Skeleton className="h-4 w-24 mb-2"/>
            <Skeleton className="h-8 w-32 mb-2"/>
            <Skeleton className="h-3 w-20"/>
          </Card>))}
      </div>);
    }
    const metrics = [
        {
            label: "Today's Revenue",
            value: data?.todayRevenue || 0,
            format: 'currency',
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            change: data?.revenueChange || 0,
            changeLabel: 'vs yesterday',
        },
        {
            label: "Today's Sales",
            value: data?.todaySales || 0,
            format: 'number',
            icon: ShoppingCart,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            change: data?.salesChange || 0,
            changeLabel: 'vs yesterday',
        },
        {
            label: "Today's Profit",
            value: data?.todayProfit || 0,
            format: 'currency',
            icon: TrendingUp,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
        {
            label: 'Low Stock Items',
            value: data?.lowStockCount || 0,
            format: 'number',
            icon: Package,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            alert: (data?.lowStockCount || 0) > 0,
        },
        {
            label: 'Monthly Revenue',
            value: data?.monthRevenue || 0,
            format: 'currency',
            icon: Calendar,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            label: 'Monthly Sales',
            value: data?.monthSales || 0,
            format: 'number',
            icon: ShoppingCart,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
        },
        {
            label: 'Avg Order Value',
            value: data?.avgOrderValue || 0,
            format: 'currency',
            icon: Target,
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-500/10',
        },
        {
            label: 'Total Customers',
            value: data?.totalCustomers || 0,
            format: 'number',
            icon: Users,
            color: 'text-pink-500',
            bgColor: 'bg-pink-500/10',
            subtitle: `+${data?.newCustomersThisMonth || 0} this month`,
        },
    ];
    const formatValue = (value, format) => {
        switch (format) {
            case 'currency':
                return `₹${value.toFixed(2)}`;
            default:
                return value.toLocaleString();
        }
    };
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((metric) => {
            const Icon = metric.icon;
            const isPositiveChange = (metric.change || 0) >= 0;
            const ChangeIcon = isPositiveChange ? TrendingUp : TrendingDown;
            return (<Card key={metric.label} className={`p-4 sm:p-6 hover:shadow-lg transition-shadow ${metric.alert ? 'border-orange-500/50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{metric.label}</p>
                <h3 className="text-xl sm:text-2xl font-bold mb-1 truncate">
                  {formatValue(metric.value, metric.format)}
                </h3>
                {metric.change !== undefined && (<div className={`flex items-center gap-1 text-xs sm:text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                    <ChangeIcon className="w-3 h-3"/>
                    <span>{Math.abs(metric.change).toFixed(1)}%</span>
                    <span className="text-muted-foreground text-xs ml-1 hidden sm:inline">
                      {metric.changeLabel}
                    </span>
                  </div>)}
                {metric.subtitle && (<p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>)}
                {metric.alert && (<p className="text-xs text-orange-600 mt-1">Requires attention</p>)}
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${metric.bgColor} shrink-0`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.color}`}/>
              </div>
            </div>
          </Card>);
        })}
    </div>);
}
