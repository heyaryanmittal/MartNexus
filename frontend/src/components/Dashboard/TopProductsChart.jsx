import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export function TopProductsChart({ data, loading }) {
    if (loading) {
        return (<Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4"/>
        <Skeleton className="h-[250px] w-full"/>
      </Card>);
    }
    const chartData = data?.map(item => ({
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        fullName: item.name,
        revenue: item.revenue,
        quantity: item.quantity,
    })) || [];
    if (chartData.length === 0) {
        return (<Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">Top Selling Products</h2>
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          No sales data available
        </div>
      </Card>);
    }
    return (<Card className="p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">Top Selling Products</h2>
        <p className="text-sm text-muted-foreground">Last 30 days by revenue</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false}/>
          <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `₹${value}`}/>
          <YAxis dataKey="name" type="category" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={100}/>
          <Tooltip contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
        }} formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']} labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}/>
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}/>
        </BarChart>
      </ResponsiveContainer>
    </Card>);
}
