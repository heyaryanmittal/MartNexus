import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

export function RevenueChart({ data, loading, period }) {
  if (loading) {
    return (<Card className="p-6">
      <Skeleton className="h-[400px] w-full" />
    </Card>);
  }

  if (!data || data.length === 0) {
    return (<Card className="p-12 text-center">
      <p className="text-muted-foreground">No sales data available for the selected period</p>
    </Card>);
  }

  const chartData = data.map(item => ({
    date: format(parseISO(item.date), period === 'daily' ? 'dd MMM' : 'MMM yyyy'),
    Revenue: item.revenue,
    Profit: item.profit,
    Sales: item.sales_count,
  }));

  return (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Revenue & Profit Trends</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
          <XAxis dataKey="date" className="text-xs font-medium" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis className="text-xs font-medium" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `₹${val}`} />
          <Tooltip contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>

    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Sales Volume</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
          <XAxis dataKey="date" className="text-xs font-medium" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis className="text-xs font-medium" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="Sales" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  </div>);
}
