import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Percent } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SalesOverview({ data, loading }) {
    if (loading) {
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (<Card key={i} className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
            </Card>))}
        </div>);
    }

    const metrics = [
        {
            label: 'Total Revenue',
            value: data?.totalRevenue || 0,
            icon: DollarSign,
            format: 'currency',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
        },
        {
            label: 'Total Profit',
            value: data?.totalProfit || 0,
            icon: TrendingUp,
            format: 'currency',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-100',
        },
        {
            label: 'Total Sales',
            value: data?.totalSales || 0,
            icon: ShoppingCart,
            format: 'number',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-100',
        },
        {
            label: 'Average Order Value',
            value: data?.averageOrderValue || 0,
            icon: DollarSign,
            format: 'currency',
            color: 'text-violet-600',
            bgColor: 'bg-violet-50',
            borderColor: 'border-violet-100',
        },
        {
            label: 'Items Sold',
            value: data?.itemsSold || 0,
            icon: Package,
            format: 'number',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-100',
        },
        {
            label: 'Profit Margin',
            value: data?.profitMargin || 0,
            icon: Percent,
            format: 'percent',
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-100',
        },
    ];

    const formatValue = (value, format) => {
        const num = Number(value) || 0;
        switch (format) {
            case 'currency':
                return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            case 'percent':
                return `${num.toFixed(1)}%`;
            default:
                return num.toLocaleString('en-IN');
        }
    };

    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
            const Icon = metric.icon;
            const isPositive = metric.value > 0;
            return (<Card key={metric.label} className={`p-6 border-l-4 ${metric.borderColor} hover:shadow-md transition-all duration-200 group`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">{metric.label}</p>
                        <h3 className="text-3xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                            {formatValue(metric.value, metric.format)}
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {isPositive ? 'Active' : 'No Data'}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">vs previous period</span>
                        </div>
                    </div>
                    <div className={`p-4 rounded-2xl ${metric.bgColor} transform group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`w-7 h-7 ${metric.color}`} />
                    </div>
                </div>
            </Card>);
        })}
    </div>);
}
