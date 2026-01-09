import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardWebSocket } from '@/hooks/useWebSocket';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Zap,
  RefreshCw
} from 'lucide-react';

interface IntegrationData {
  connectwise?: any;
  microsoft365?: any;
  azure?: any;
  kaseya?: any;
}

export const IntegrationsPage: React.FC = () => {
  const [integrationData, setIntegrationData] = useState<IntegrationData>({});
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const { lastMessage, isConnected } = useDashboardWebSocket();

  // Listen for real-time updates
  useEffect(() => {
    if (lastMessage?.type === 'integration_update') {
      setIntegrationData(prev => ({
        ...prev,
        [lastMessage.integration]: lastMessage.data
      }));
    }
  }, [lastMessage]);

  const fetchIntegrationData = async () => {
    setLoading(true);
    try {
      // Fetch ConnectWise tickets
      const cwResponse = await fetch('/api/integrations/connectwise/tickets');
      const cwData = await cwResponse.json();
      
      // Fetch Microsoft 365 licenses
      const m365Response = await fetch('/api/integrations/microsoft365/licenses');
      const m365Data = await m365Response.json();
      
      // Fetch Azure costs
      const azureResponse = await fetch('/api/integrations/azure/cost-analysis/subscription-123');
      const azureData = await azureResponse.json();
      
      // Fetch Kaseya agents
      const kaseyaResponse = await fetch('/api/integrations/kaseya/agents');
      const kaseyaData = await kaseyaResponse.json();
      
      setIntegrationData({
        connectwise: cwData,
        microsoft365: m365Data,
        azure: azureData,
        kaseya: kaseyaData
      });
      
      setLastSync(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to fetch integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncAllIntegrations = async () => {
    try {
      await fetch('/api/integrations/sync-all', { method: 'GET' });
      // Show success message
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">MSP Tool Integrations</h1>
          <p className="text-muted-foreground">
            Real-time data from your MSP tools and platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button onClick={syncAllIntegrations} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ConnectWise</p>
                <p className="text-2xl font-bold">
                  {integrationData.connectwise?.total_tickets || 0}
                </p>
                <p className="text-xs text-muted-foreground">Open Tickets</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Microsoft 365</p>
                <p className="text-2xl font-bold">
                  {integrationData.microsoft365?.license_usage?.utilization_rate?.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-muted-foreground">License Utilization</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Azure Costs</p>
                <p className="text-2xl font-bold">
                  ${integrationData.azure?.cost_analysis?.total_cost?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kaseya Agents</p>
                <p className="text-2xl font-bold">
                  {integrationData.kaseya?.availability_rate?.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-muted-foreground">Online Rate</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Integration Data */}
      <Tabs defaultValue="connectwise" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connectwise">ConnectWise</TabsTrigger>
          <TabsTrigger value="microsoft365">Microsoft 365</TabsTrigger>
          <TabsTrigger value="azure">Azure</TabsTrigger>
          <TabsTrigger value="kaseya">Kaseya</TabsTrigger>
        </TabsList>

        <TabsContent value="connectwise">
          <Card>
            <CardHeader>
              <CardTitle>ConnectWise Manage - Active Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationData.connectwise?.tickets?.slice(0, 10).map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{ticket.summary}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.client} • {ticket.assigned_to}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ticket.priority === 'High' ? 'destructive' : 'secondary'}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="microsoft365">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>License Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Users:</span>
                    <span className="font-bold">
                      {integrationData.microsoft365?.license_usage?.total_users || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users:</span>
                    <span className="font-bold text-green-600">
                      {integrationData.microsoft365?.license_usage?.active_users || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilization Rate:</span>
                    <span className="font-bold">
                      {integrationData.microsoft365?.license_usage?.utilization_rate?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">
                      {integrationData.microsoft365?.optimization_opportunities?.unused_licenses || 0} unused licenses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      Potential savings: ${integrationData.microsoft365?.optimization_opportunities?.potential_savings || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="azure">
          <Card>
            <CardHeader>
              <CardTitle>Azure Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-blue-600">
                      ${integrationData.azure?.cost_analysis?.total_cost?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-green-600">
                      {integrationData.azure?.cost_analysis?.cost_by_resource_group?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Resource Groups</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-orange-600">
                      ${integrationData.azure?.optimization_insights?.highest_cost_resource_group?.cost?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Highest Cost RG</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kaseya">
          <Card>
            <CardHeader>
              <CardTitle>Kaseya VSA - Agent Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-green-600">
                      {integrationData.kaseya?.online_agents || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Online Agents</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-red-600">
                      {integrationData.kaseya?.offline_agents || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Offline Agents</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <p className="text-2xl font-bold text-blue-600">
                      {integrationData.kaseya?.availability_rate?.toFixed(1) || 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Availability Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {lastSync && (
        <p className="text-sm text-muted-foreground text-center">
          Last synchronized: {lastSync}
        </p>
      )}
    </div>
  );
};