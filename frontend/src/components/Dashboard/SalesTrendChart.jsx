import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
export function SalesTrendChart({ data, loading }) {
    if (loading) {
        return (<Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4"/>
        <Skeleton className="h-[300px] w-full"/>
      </Card>);
    }
    
    const chartData = data && data.length > 0
        ? data.map(item => ({
            date: format(new Date(item.date), 'MMM dd'),
            Revenue: item.revenue,
            Sales: item.sales,
        }))
        : Array.from({ length: 7 }, (_, i) => ({
            date: format(subDays(new Date(), 6 - i), 'MMM dd'),
            Revenue: 0,
            Sales: 0,
        }));
    return (<Card className="p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">Sales Trend (Last 7 Days)</h2>
        <p className="text-sm text-muted-foreground">Daily revenue and sales count</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>
          <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }}/>
          <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }}/>
          <Tooltip contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
        }} formatter={(value, name) => {
            if (name === 'Revenue')
                return `₹${value.toFixed(2)}`;
            return value;
        }}/>
          <Area type="monotone" dataKey="Revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)"/>
        </AreaChart>
      </ResponsiveContainer>
    </Card>);
}
