import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Target } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { gsap } from 'gsap';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const revenueData = [
  { month: 'Jan', revenue: 2100, profit: 630 },
  { month: 'Feb', revenue: 2300, profit: 690 },
  { month: 'Mar', revenue: 2200, profit: 660 },
  { month: 'Apr', revenue: 2400, profit: 720 },
  { month: 'May', revenue: 2600, profit: 780 },
  { month: 'Jun', revenue: 2800, profit: 840 }
];

const serviceData = [
  { name: 'Managed IT', value: 35, color: '#2563eb' },
  { name: 'Cloud Services', value: 28, color: '#16a34a' },
  { name: 'Security', value: 20, color: '#dc2626' },
  { name: 'Backup', value: 12, color: '#ca8a04' },
  { name: 'Support', value: 5, color: '#7c3aed' }
];

const clientMetrics = [
  { client: 'TechCorp Inc', revenue: 45000, growth: 12, satisfaction: 94 },
  { client: 'StartupXYZ', revenue: 32000, growth: -5, satisfaction: 87 },
  { client: 'MidSize LLC', revenue: 28000, growth: 8, satisfaction: 91 },
  { client: 'Enterprise Co', revenue: 52000, growth: 15, satisfaction: 96 }
];

export default function Metrics() {
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
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

  return (
    <div ref={pageRef} className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Metrics & Analytics</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Comprehensive business performance insights</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['1M', '3M', '6M', '1Y'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded text-xs sm:text-sm transition-colors ${
                selectedPeriod === period 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => console.log('Drilling down into revenue growth')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={23} suffix="%" />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Revenue Growth</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => console.log('Drilling down into client retention')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={94} suffix="%" />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Client Retention</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => console.log('Drilling down into active clients')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={157} />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Active Clients</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => console.log('Drilling down into health score')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={87} suffix="/100" />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Health Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Profit Trend */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue & Profit Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} name="Revenue ($K)" />
              <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={3} name="Profit ($K)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Service Distribution */}
        <Card className="border hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Service Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card className="border hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top Client Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientMetrics.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{client.client}</div>
                    <div className="text-sm text-muted-foreground">${client.revenue.toLocaleString()}/month</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={client.growth >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'}>
                      {client.growth >= 0 ? '+' : ''}{client.growth}%
                    </Badge>
                    <Badge className="bg-primary/10 text-primary">
                      {client.satisfaction}% sat
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Operational Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">2.3h</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">99.8%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">4.8/5</div>
              <div className="text-sm text-muted-foreground">Client Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">12</div>
              <div className="text-sm text-muted-foreground">Open Tickets</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}