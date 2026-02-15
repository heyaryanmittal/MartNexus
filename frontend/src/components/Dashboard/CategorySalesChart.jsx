import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(215 20% 65%)',
];
export function CategorySalesChart({ data, loading }) {
    if (loading) {
        return (<Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4"/>
        <Skeleton className="h-[250px] w-full"/>
      </Card>);
    }
    if (!data || data.length === 0) {
        return (<Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">Sales by Category</h2>
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          No category data available
        </div>
      </Card>);
    }
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return (<Card className="p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">Sales by Category</h2>
        <p className="text-sm text-muted-foreground">Last 30 days distribution</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
            {data.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
          </Pie>
          <Tooltip contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
        }} formatter={(value) => [
            `₹${value.toFixed(2)} (${((value / total) * 100).toFixed(1)}%)`,
            'Revenue'
        ]}/>
          <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}/>
        </PieChart>
      </ResponsiveContainer>
    </Card>);
}
