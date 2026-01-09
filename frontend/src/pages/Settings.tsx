import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Zap, Globe, Mail } from 'lucide-react';
import { gsap } from 'gsap';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: string;
}

const settingsData: SettingItem[] = [
  {
    id: '1',
    title: 'Real-time Notifications',
    description: 'Receive instant alerts for anomalies and critical issues',
    enabled: true,
    category: 'notifications'
  },
  {
    id: '2',
    title: 'Email Reports',
    description: 'Weekly summary reports sent to your email',
    enabled: true,
    category: 'notifications'
  },
  {
    id: '3',
    title: 'Auto-optimization',
    description: 'Automatically optimize licenses and resources',
    enabled: false,
    category: 'automation'
  },
  {
    id: '4',
    title: 'Data Retention',
    description: 'Keep historical data for 12 months',
    enabled: true,
    category: 'data'
  },
  {
    id: '5',
    title: 'Two-Factor Authentication',
    description: 'Enhanced security for account access',
    enabled: true,
    category: 'security'
  },
  {
    id: '6',
    title: 'API Access',
    description: 'Enable third-party integrations via API',
    enabled: false,
    category: 'integrations'
  }
];

const integrations = [
  { name: 'Microsoft 365', status: 'connected', icon: '🔗' },
  { name: 'AWS', status: 'connected', icon: '☁️' },
  { name: 'Slack', status: 'disconnected', icon: '💬' },
  { name: 'Salesforce', status: 'pending', icon: '📊' }
];

export default function Settings() {
  const [settings, setSettings] = useState<SettingItem[]>(settingsData);
  const [activeTab, setActiveTab] = useState('general');
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

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'disconnected': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  const filteredSettings = activeTab === 'general' 
    ? settings 
    : settings.filter(setting => setting.category === activeTab);

  return (
    <div ref={pageRef} className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">System configuration and preferences</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Settings Content */}
      {activeTab !== 'integrations' ? (
        <div className="space-y-4">
          {filteredSettings.map((setting) => (
            <Card key={setting.id} className="border hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{setting.title}</h3>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                    className="ml-4"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Integrations Tab */
        <div className="space-y-6">
          <Card className="border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Connected Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {integration.status === 'connected' && 'Syncing data automatically'}
                          {integration.status === 'disconnected' && 'Not connected'}
                          {integration.status === 'pending' && 'Connection in progress'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Button 
                        variant={integration.status === 'connected' ? 'outline' : 'default'}
                        size="sm"
                        className="hover:scale-105 transition-transform"
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-medium text-primary">API Key</span>
                  </div>
                  <div className="font-mono text-sm text-muted-foreground bg-background p-2 rounded border">
                    opt_sk_live_••••••••••••••••••••••••••••••••••••
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">Regenerate</Button>
                    <Button size="sm" variant="outline">Copy</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Rate Limit</div>
                    <div className="text-2xl font-bold">1,000</div>
                    <div className="text-xs text-muted-foreground">requests/hour</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Usage</div>
                    <div className="text-2xl font-bold">247</div>
                    <div className="text-xs text-muted-foreground">requests today</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Information */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Organization</div>
              <div className="font-medium">Team OpsMind</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Plan</div>
              <div className="font-medium">Enterprise</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Admin Email</div>
              <div className="font-medium">admin@optimsp.ai</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Last Login</div>
              <div className="font-medium">Today, 2:30 PM</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button className="bg-primary hover:bg-primary/90 hover:scale-105 transition-all">
          Save Changes
        </Button>
        <Button variant="outline" className="hover:scale-105 transition-transform">
          Export Settings
        </Button>
        <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:scale-105 transition-all">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}