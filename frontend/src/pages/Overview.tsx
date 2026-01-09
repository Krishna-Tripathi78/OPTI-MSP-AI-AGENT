import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Percent,
  Users as UsersIcon,
  Sparkles,
  Brain,
  Zap,
  Target,
  Shield,
  Globe,
  BarChart3,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Cpu,
  Database,
  Cloud,
  Layers,
  MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useState, useEffect, useRef } from "react";
import { generateInsights, type AIInsight } from "@/services/aiService";
import { mspDataService, type MSPMetrics, type ClientData, type ServiceData, type RevenueData } from "@/services/mspDataService";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ClientDetailView } from "@/components/ClientDetailView";
import { gsap } from 'gsap';
import { useNavigate } from "react-router-dom";

export default function Overview() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [metrics, setMetrics] = useState<MSPMetrics>({
    revenue: 0,
    totalCosts: 0,
    netProfit: 0,
    profitMargin: 0,
    healthScore: 0,
    revenueGrowth: 0,
    clientCount: 0
  });
  const [clients, setClients] = useState<ClientData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<RevenueData[]>([]);
  const [alerts, setAlerts] = useState<Array<{ type: string, message: string, client?: string }>>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  // Load real data
  const loadRealData = async () => {
    try {
      const newMetrics = await mspDataService.getMSPMetrics();
      const newClients = mspDataService.getClientData();
      const newServices = mspDataService.getServiceData();
      const newRevenueHistory = mspDataService.getRevenueHistory();
      const newAlerts = mspDataService.getAlerts();

      setMetrics(newMetrics);
      setClients(newClients);
      setServices(newServices);
      setRevenueHistory(newRevenueHistory);
      setAlerts(newAlerts);
      setLastUpdate(new Date());

      console.log('📊 Real MSP data loaded:', {
        revenue: `$${newMetrics.revenue}M`,
        clients: newClients.length,
        healthScore: newMetrics.healthScore,
        alerts: newAlerts.length
      });
    } catch (error) {
      console.error('Failed to load MSP data:', error);
    }
  };

  useEffect(() => {
    // Load initial data
    loadRealData();

    // Load AI insights
    const loadInsights = async () => {
      try {
        const data = await generateInsights();
        setInsights(data);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setIsLoadingInsights(false);
      }
    };
    loadInsights();

    // Animate dashboard on load
    const timer = setTimeout(() => {
      if (dashboardRef.current) {
        const elements = Array.from(dashboardRef.current.children);
        elements.forEach((element, index) => {
          gsap.fromTo(element,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, delay: index * 0.1, ease: "power2.out" }
          );
        });
      }
    }, 100);

    // Set up real-time data updates every 30 seconds
    const dataInterval = setInterval(() => {
      loadRealData();
    }, 30000);

    // Clean up interval on unmount
    return () => {
      clearInterval(dataInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={dashboardRef} className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-background min-h-screen">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="OptiMSP AI" className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="text-lg sm:text-xl font-semibold">OptiMSP AI</span>
        </div>

        <div className="flex flex-wrap gap-1">
          <Button variant="default" className="bg-primary text-primary-foreground text-xs sm:text-sm px-2 sm:px-4">
            Dashboard
          </Button>
          <Button variant="ghost" className="text-muted-foreground text-xs sm:text-sm px-2 sm:px-4" onClick={() => window.location.href = '/anomalies'}>
            Anomalies
          </Button>
          <Button variant="ghost" className="text-muted-foreground text-xs sm:text-sm px-2 sm:px-4" onClick={() => window.location.href = '/licenses'}>
            Licenses
          </Button>
          <Button variant="ghost" className="text-muted-foreground text-xs sm:text-sm px-2 sm:px-4" onClick={() => {
            // Check if user is logged in
            const isLoggedIn = localStorage.getItem('optimsp_session');
            if (!isLoggedIn) {
              // Auto-login with admin credentials for demo
              localStorage.setItem('optimsp_session', JSON.stringify({
                email: 'admin@optimsp.com',
                name: 'Admin User',
                role: 'admin'
              }));
            }
            window.location.href = '/chatbot';
          }}>
            AI Chat
          </Button>
        </div>
      </div>

      {/* Financial Health Score */}
      <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer" onClick={() => console.log('Drilling down into health score')}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-lg font-semibold">Financial Health Score:
              <AnimatedCounter value={metrics.healthScore} suffix="/100" className="text-primary" />
            </span>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border hover:shadow-lg transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer" onClick={() => console.log('Drilling down into revenue')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Revenue</div>
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={metrics.revenue} prefix="$" suffix="M" />
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer" onClick={() => console.log('Drilling down into costs')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Total Costs</div>
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={1.8} prefix="$" suffix="M" />
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer" onClick={() => console.log('Drilling down into profit')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Net Profit</div>
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={600} prefix="$" suffix="K" />
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer" onClick={() => console.log('Drilling down into margin')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Margin</div>
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={Math.round(metrics.profitMargin)} suffix="%" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Card */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-secondary/5" data-ai-assistant>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">💬 OptiMSP AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Get intelligent insights about your MSP operations</p>
              </div>
            </div>
            <Button
              onClick={() => {
                // Check if user is logged in
                const isLoggedIn = localStorage.getItem('optimsp_session');
                if (!isLoggedIn) {
                  // Auto-login with admin credentials for demo
                  localStorage.setItem('optimsp_session', JSON.stringify({
                    email: 'admin@optimsp.com',
                    name: 'Admin User',
                    role: 'admin'
                  }));
                }
                window.location.href = '/chatbot';
              }}
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profitability Trend Chart */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Profitability Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueHistory}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Client-Level Profitability */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Client-Level Profitability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded hover:bg-muted/80 cursor-pointer transition-colors gap-2"
              onClick={() => setSelectedClient({
                id: '1',
                name: 'Rajesh Sharma',
                company: 'Sharma Technologies',
                status: 'Active',
                since: 'Jan 2022',
                health: 'good',
                revenue: 200,
                costs: 136,
                margin: 32
              })}
            >
              <span className="font-medium">Sharma Technologies</span>
              <div className="flex items-center gap-4 text-xs sm:text-sm">
                <span className="text-muted-foreground">Revenue: $200K</span>
                <span className="text-muted-foreground">Margin: 32%</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded hover:bg-muted/80 cursor-pointer transition-colors gap-2"
              onClick={() => setSelectedClient({
                id: '2',
                name: 'Priya Patel',
                company: 'Patel Manufacturing',
                status: 'Warning',
                since: 'Mar 2021',
                health: 'warning',
                revenue: 180,
                costs: 148,
                margin: 18
              })}
            >
              <span className="font-medium">Patel Manufacturing</span>
              <div className="flex items-center gap-4 text-xs sm:text-sm">
                <span className="text-muted-foreground">Revenue: $180K</span>
                <span className="text-muted-foreground">Margin: 18%</span>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded hover:bg-muted/80 cursor-pointer transition-colors gap-2"
              onClick={() => setSelectedClient({
                id: '3',
                name: 'Amit Kumar',
                company: 'Kumar Enterprises',
                status: 'Active',
                since: 'Aug 2020',
                health: 'critical',
                revenue: 150,
                costs: 158,
                margin: -5
              })}
            >
              <span className="font-medium">Kumar Enterprises</span>
              <div className="flex items-center gap-4 text-xs sm:text-sm">
                <span className="text-muted-foreground">Revenue: $150K</span>
                <span className="text-muted-foreground">Margin: -5%</span>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Services by Revenue */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Top Services by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { service: 'Managed IT', revenue: 800 },
              { service: 'Cloud Services', revenue: 650 },
              { service: 'Security', revenue: 450 },
              { service: 'Backup', revenue: 300 },
              { service: 'Support', revenue: 200 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="service" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailView
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}