import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';
const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
export function ProfitAnalysis({ data, loading }) {
    if (loading) {
        return (<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <Skeleton className="h-[350px] w-full"/>
        </Card>
        <Card className="p-6">
          <Skeleton className="h-[350px] w-full"/>
        </Card>
      </div>);
    }
    if (!data) {
        return (<Card className="p-12 text-center">
        <p className="text-muted-foreground">No profit data available</p>
      </Card>);
    }
    const profitBreakdown = [
        { name: 'Profit', value: data.totalProfit },
        { name: 'Cost', value: data.totalCost },
    ];
    return (<div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-500"/>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold">₹{data.totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500"/>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <h3 className="text-2xl font-bold text-green-600">₹{data.totalProfit.toFixed(2)}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Percent className="w-5 h-5 text-purple-500"/>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <h3 className="text-2xl font-bold text-purple-600">{data.profitMargin.toFixed(1)}%</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue vs Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={profitBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                {profitBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'}/>))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
        }}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Profit by Category</h3>
          {data.byCategory && data.byCategory.length > 0 ? (<div className="space-y-4">
              {data.byCategory.map((category, index) => (<div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.category || 'Uncategorized'}</span>
                    <span className="text-sm text-muted-foreground">{category.margin.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full transition-all" style={{
                    width: `${category.margin}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                }}/>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      ₹{category.profit.toFixed(2)}
                    </span>
                  </div>
                </div>))}
            </div>) : (<div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No category data available
            </div>)}
        </Card>
      </div>
    </div>);
}
