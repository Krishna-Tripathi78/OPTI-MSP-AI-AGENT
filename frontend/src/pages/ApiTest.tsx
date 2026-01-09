import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, CheckCircle, XCircle, Database } from 'lucide-react';

const apiEndpoints = [
  { name: 'Churn Prediction', url: '/ai-analytics/churn-prediction', category: 'AI Analytics' },
  { name: 'Revenue Forecast', url: '/ai-analytics/revenue-forecast', category: 'AI Analytics' },
  { name: 'Cost Anomalies', url: '/ai-analytics/cost-anomalies', category: 'AI Analytics' },
  { name: 'ConnectWise Tickets', url: '/integrations/connectwise/tickets', category: 'MSP Tools' },
  { name: 'Microsoft 365 Licenses', url: '/integrations/microsoft365/licenses', category: 'MSP Tools' },
  { name: 'Azure Cost Analysis', url: '/integrations/azure/cost-analysis/sub-123', category: 'MSP Tools' },
  { name: 'Kaseya Agents', url: '/integrations/kaseya/agents', category: 'MSP Tools' }
];

export default function ApiTest() {
  const [apiTests, setApiTests] = useState<Record<string, { status: 'idle' | 'testing' | 'success' | 'error', data?: any, error?: string }>>({});

  const testApiEndpoint = async (endpoint: typeof apiEndpoints[0]) => {
    setApiTests(prev => ({ ...prev, [endpoint.url]: { status: 'testing' } }));
    
    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint.url}`);
      const data = await response.json();
      
      if (response.ok) {
        setApiTests(prev => ({ ...prev, [endpoint.url]: { status: 'success', data } }));
      } else {
        setApiTests(prev => ({ ...prev, [endpoint.url]: { status: 'error', error: data.detail || 'API Error' } }));
      }
    } catch (error) {
      setApiTests(prev => ({ ...prev, [endpoint.url]: { status: 'error', error: 'Network Error' } }));
    }
  };

  const testAllEndpoints = async () => {
    for (const endpoint of apiEndpoints) {
      await testApiEndpoint(endpoint);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <TestTube className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">API Testing</h1>
            <p className="text-sm text-muted-foreground">Test backend API endpoints</p>
          </div>
        </div>
        <Button onClick={testAllEndpoints} className="hover:scale-105 transition-transform">
          Test All Endpoints
        </Button>
      </div>

      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-primary" />
            API Endpoint Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiEndpoints.map((endpoint) => {
              const test = apiTests[endpoint.url] || { status: 'idle' };
              return (
                <div key={endpoint.url} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {test.status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                      {test.status === 'error' && <XCircle className="w-5 h-5 text-destructive" />}
                      {test.status === 'testing' && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                      {test.status === 'idle' && <div className="w-5 h-5 bg-muted-foreground/20 rounded-full" />}
                    </div>
                    <div>
                      <div className="font-medium">{endpoint.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.category} • {endpoint.url}
                      </div>
                      {test.error && (
                        <div className="text-sm text-destructive mt-1">{test.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${
                      test.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      test.status === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      test.status === 'testing' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                      {test.status}
                    </Badge>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => testApiEndpoint(endpoint)}
                      disabled={test.status === 'testing'}
                      className="hover:scale-105 transition-transform"
                    >
                      Test
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {Object.entries(apiTests).some(([_, test]) => test.data) && (
        <Card className="border hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Latest API Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm">
                {JSON.stringify(
                  Object.entries(apiTests).find(([_, test]) => test.data)?.[1]?.data,
                  null,
                  2
                )}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}