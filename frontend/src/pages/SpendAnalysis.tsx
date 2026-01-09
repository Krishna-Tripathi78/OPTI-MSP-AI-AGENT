import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, PieChart, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { gsap } from 'gsap';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const spendData = [
  { month: 'Jan', total: 180, cloud: 65, licenses: 45, infrastructure: 35, other: 35 },
  { month: 'Feb', total: 195, cloud: 70, licenses: 48, infrastructure: 37, other: 40 },
  { month: 'Mar', total: 210, cloud: 75, licenses: 52, infrastructure: 40, other: 43 },
  { month: 'Apr', total: 225, cloud: 80, licenses: 55, infrastructure: 42, other: 48 },
  { month: 'May', total: 240, cloud: 85, licenses: 58, infrastructure: 45, other: 52 },
  { month: 'Jun', total: 255, cloud: 90, licenses: 62, infrastructure: 48, other: 55 }
];

const categoryData = [
  { name: 'Cloud Services', value: 35, amount: 90000, color: '#2563eb' },
  { name: 'Software Licenses', value: 24, amount: 62000, color: '#16a34a' },
  { name: 'Infrastructure', value: 19, amount: 48000, color: '#dc2626' },
  { name: 'Personnel', value: 15, amount: 38000, color: '#ca8a04' },
  { name: 'Other', value: 7, amount: 17000, color: '#7c3aed' }
];

const budgetItems = [
  { category: 'Cloud Services', budget: 95000, actual: 90000, variance: -5000 },
  { category: 'Software Licenses', budget: 58000, actual: 62000, variance: 4000 },
  { category: 'Infrastructure', budget: 50000, actual: 48000, variance: -2000 },
  { category: 'Personnel', budget: 40000, actual: 38000, variance: -2000 }
];

export default function SpendAnalysis() {
  const [selectedView, setSelectedView] = useState('monthly');
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pageRef.current) {
        const elements = Array.from(pageRef.current.children);
        elements.forEach((element, index) => {
          gsap.fromTo(element, 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.6, delay: index * 0.1, ease: "power2.out" }
          );
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const totalSpend = categoryData.reduce((sum, item) => sum + item.amount, 0);
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budget, 0);
  const totalVariance = budgetItems.reduce((sum, item) => sum + item.variance, 0);

  return (
    <div ref={pageRef} className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Spend Analysis</h1>
            <p className="text-sm text-muted-foreground">Cost optimization and budget tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['monthly', 'quarterly', 'yearly'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1 rounded text-sm transition-colors capitalize ${
                selectedView === view 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              <AnimatedCounter value={Math.round(totalSpend / 1000)} prefix="$" suffix="K" />
            </div>
            <div className="text-sm text-muted-foreground">Total Spend</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              <AnimatedCounter value={Math.round(totalBudget / 1000)} prefix="$" suffix="K" />
            </div>
            <div className="text-sm text-muted-foreground">Budget</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 text-center">
            <TrendingDown className={`h-8 w-8 mx-auto mb-2 ${totalVariance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`} />
            <div className={`text-2xl font-bold ${totalVariance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
              <AnimatedCounter value={Math.abs(Math.round(totalVariance / 1000))} prefix={totalVariance < 0 ? '-$' : '+$'} suffix="K" />
            </div>
            <div className="text-sm text-muted-foreground">Variance</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              <AnimatedCounter value={23} suffix="%" />
            </div>
            <div className="text-sm text-muted-foreground">Savings Potential</div>
          </CardContent>
        </Card>
      </div>

      {/* Spend Trend */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Spend Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} name="Total ($K)" />
              <Line type="monotone" dataKey="cloud" stroke="#16a34a" strokeWidth={2} name="Cloud ($K)" />
              <Line type="monotone" dataKey="licenses" stroke="#dc2626" strokeWidth={2} name="Licenses ($K)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Spend by Category */}
        <Card className="border hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Spend by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card className="border hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Budget vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className={item.variance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
                      {item.variance < 0 ? '-' : '+'}${Math.abs(item.variance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Budget: ${item.budget.toLocaleString()}</span>
                    <span>Actual: ${item.actual.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={(item.actual / item.budget) * 100} 
                    className={`h-2 ${item.variance > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Optimization Opportunities */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Cost Optimization Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg">
              <div>
                <div className="font-medium text-emerald-600 dark:text-emerald-400">Unused Cloud Resources</div>
                <div className="text-sm text-emerald-600/80 dark:text-emerald-400/80">23 idle EC2 instances detected</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">$8,400</div>
                <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80">monthly savings</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-lg">
              <div>
                <div className="font-medium text-amber-600 dark:text-amber-400">License Optimization</div>
                <div className="text-sm text-amber-600/80 dark:text-amber-400/80">47 unused software licenses</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">$5,200</div>
                <div className="text-xs text-amber-600/80 dark:text-amber-400/80">monthly savings</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <div>
                <div className="font-medium text-primary">Storage Optimization</div>
                <div className="text-sm text-primary/80">Backup retention policy review</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">$2,800</div>
                <div className="text-xs text-primary/80">monthly savings</div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                Total Monthly Savings Potential:
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                $16,400
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}