import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Calendar, Activity, DollarSign, TrendingUp, Shield, Cloud, HardDrive, AlertTriangle, X } from "lucide-react";

interface ClientDetailViewProps {
  client: {
    id: string;
    name: string;
    company: string;
    status: 'Active' | 'Warning' | 'Inactive';
    since: string;
    health: 'good' | 'warning' | 'critical';
    revenue: number;
    costs: number;
    margin: number;
  };
  onClose: () => void;
}

const mockTrendData = [
  { month: 'Jan', revenue: 16.5, costs: 11.2 },
  { month: 'Feb', revenue: 17.2, costs: 11.8 },
  { month: 'Mar', revenue: 16.8, costs: 11.5 },
  { month: 'Apr', revenue: 18.1, costs: 12.3 },
  { month: 'May', revenue: 17.9, costs: 12.1 },
  { month: 'Jun', revenue: 18.5, costs: 12.6 },
  { month: 'Jul', revenue: 19.2, costs: 13.1 },
  { month: 'Aug', revenue: 18.8, costs: 12.8 },
  { month: 'Sep', revenue: 19.5, costs: 13.3 },
  { month: 'Oct', revenue: 20.1, costs: 13.7 },
  { month: 'Nov', revenue: 19.8, costs: 13.5 },
  { month: 'Dec', revenue: 20.5, costs: 13.9 }
];

const services = [
  { name: 'Managed IT Support', cost: 5000 },
  { name: 'Cloud Infrastructure', cost: 3200 },
  { name: 'Security Monitoring', cost: 2800 },
  { name: 'Backup & DR', cost: 1500 }
];

const licenses = [
  { name: 'Microsoft 365', count: 32 },
  { name: 'Adobe CC', count: 8 },
  { name: 'Slack', count: 45 }
];

const anomalies = [
  { type: 'Storage overage', amount: 450, period: 'Last month' },
  { type: 'Support hours spike', increase: '30%', period: '2 weeks ago' }
];

export function ClientDetailView({ client, onClose }: ClientDetailViewProps) {
  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good': return '🟢';
      case 'warning': return '🟡';
      case 'critical': return '🔴';
      default: return '🟢';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-xl">{client.name} - {client.company}</CardTitle>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Since: {client.since}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Health:</span>
                <span className="text-lg">{getHealthIcon(client.health)}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">${client.revenue}K/yr</div>
                </CardContent>
              </Card>
              <Card className="border">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Costs</div>
                  <div className="text-2xl font-bold text-gray-900">${client.costs}K/yr</div>
                </CardContent>
              </Card>
              <Card className="border">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Profit Margin</div>
                  <div className="text-2xl font-bold text-gray-900">{client.margin}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue vs Cost Trend */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  📊 Revenue vs Cost Trend (12 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="costs" 
                      stroke="#dc2626" 
                      strokeWidth={3}
                      name="Costs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Active Services */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  💼 Active Services ({services.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-sm font-semibold text-blue-600">${service.cost.toLocaleString()}/mo</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Licenses */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  📦 Licenses ({licenses.reduce((sum, l) => sum + l.count, 0)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {licenses.map((license, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {license.name} ({license.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Anomalies */}
            <Card className="border border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  🚨 Recent Anomalies ({anomalies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies.map((anomaly, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                      <span className="font-medium text-orange-800">{anomaly.type}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-orange-600">
                          {anomaly.amount ? `+$${anomaly.amount}` : `+${anomaly.increase}`}
                        </div>
                        <div className="text-xs text-orange-600">{anomaly.period}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}