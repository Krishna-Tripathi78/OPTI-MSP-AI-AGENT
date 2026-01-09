import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Eye, CheckCircle, AlertCircle, Clock, X, Calendar, DollarSign, User, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { gsap } from 'gsap';
import { anomalyService } from '@/services/anomalyService';

interface Anomaly {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  client: string;
  metric: string;
  value: string;
  rootCause: string;
  timestamp: Date;
  resolved: boolean;
}

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const loadRealTimeData = async () => {
    anomalyService.simulateRealTimeUpdates();
    const data = await anomalyService.getAnomalies();
    setAnomalies(data);
    setTrendData(anomalyService.getTrendData());
  };

  useEffect(() => {
    // Load initial data
    loadRealTimeData();

    // Animate page entrance
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

    // Set up real-time updates every 15 seconds
    const interval = setInterval(loadRealTimeData, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'LOW': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🔵';
      default: return '⚪';
    }
  };

  const handleViewDetails = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
  };

  const handleResolve = async (id: string) => {
    await anomalyService.resolveAnomaly(id);
    const data = await anomalyService.getAnomalies();
    setAnomalies(data);
    if (selectedAnomaly?.id === id) {
      setSelectedAnomaly(null);
    }
  };

  const activeAlerts = anomalies.filter(a => !a.resolved).length;

  return (
    <div ref={pageRef} className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Anomaly Detection</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">AI-powered cost and usage anomaly monitoring</p>
          </div>
        </div>
        <Badge variant="destructive" className="text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
          Active Alerts: {activeAlerts}
        </Badge>
      </div>

      {/* Anomaly Cards */}
      <div className="space-y-4">
        {anomalies.map((anomaly) => (
          <Card
            key={anomaly.id}
            className={`border-l-4 hover:shadow-lg transition-all duration-300 cursor-pointer ${anomaly.severity === 'HIGH' ? 'border-l-destructive' :
              anomaly.severity === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-primary'
              } ${anomaly.resolved ? 'opacity-60' : ''}`}
            onClick={() => console.log('Drilling down into anomaly:', anomaly.id)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <span className="text-xl sm:text-2xl">{getSeverityIcon(anomaly.severity)}</span>
                    <Badge className={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity}
                    </Badge>
                    <h3 className="text-base sm:text-lg font-semibold">{anomaly.title}</h3>
                    {anomaly.resolved && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">Client:</span>
                      <span className="text-xs sm:text-sm">{anomaly.client}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">Impact:</span>
                      <span className="text-xs sm:text-sm">{anomaly.metric}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">Cost:</span>
                      <span className="text-xs sm:text-sm font-bold">{anomaly.value}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">Root Cause:</span>
                      <span className="text-xs sm:text-sm">{anomaly.rootCause}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(anomaly);
                    }}>
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">Details</span>
                  </Button>
                  {!anomaly.resolved && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(anomaly.id);
                      }}
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 hover:scale-105 transition-all"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Mark Resolved</span>
                      <span className="sm:hidden">Resolve</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anomaly Trend Chart */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            📊 Anomaly Trend Analysis
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">Historical anomalies detected over the last 6 months</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
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
                dataKey="anomalies"
                stroke="hsl(var(--destructive))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: 'hsl(var(--destructive))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => console.log('Drilling down into high priority')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-destructive mb-1">
              {anomalies.filter(a => a.severity === 'HIGH' && !a.resolved).length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => console.log('Drilling down into medium priority')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">
              {anomalies.filter(a => a.severity === 'MEDIUM' && !a.resolved).length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Medium Priority</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => console.log('Drilling down into resolved')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {anomalies.filter(a => a.resolved).length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => console.log('Drilling down into average')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary mb-1">
              {trendData.length > 0 ? Math.round(trendData.reduce((acc: number, curr: any) => acc + curr.anomalies, 0) / trendData.length) : 0}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Avg/Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Details Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="relative">
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{getSeverityIcon(selectedAnomaly.severity)}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityColor(selectedAnomaly.severity)}>
                      {selectedAnomaly.severity}
                    </Badge>
                    {selectedAnomaly.resolved && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{selectedAnomaly.title}</h2>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Client</p>
                    <p className="font-semibold">{selectedAnomaly.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cost Impact</p>
                    <p className="font-semibold">{selectedAnomaly.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Metric</p>
                    <p className="font-semibold">{selectedAnomaly.metric}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Detected</p>
                    <p className="font-semibold">{selectedAnomaly.timestamp.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Root Cause Analysis</h3>
                    <p className="text-amber-700 dark:text-amber-300">{selectedAnomaly.rootCause}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Recommended Actions</h3>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Review resource allocation for {selectedAnomaly.client}</li>
                  <li>• Implement cost monitoring alerts</li>
                  <li>• Schedule optimization review with client</li>
                  <li>• Update service level agreements if needed</li>
                </ul>
              </div>

              {!selectedAnomaly.resolved && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleResolve(selectedAnomaly.id)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}