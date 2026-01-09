import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Clock, MapPin, Monitor, Wifi } from 'lucide-react';
import { userService } from '@/services/userService';
import { webSocketService } from '@/services/webSocketService';

interface LoginLog {
  id: string;
  email: string;
  name: string;
  timestamp: Date;
  ipAddress: string;
  device: string;
  location: string;
  status: 'success' | 'failed';
}

export default function AdminPanel() {
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = userService.isAdmin();
    setIsAdmin(adminStatus);
    
    if (!adminStatus) return;
    // Load existing logs
    const logs = JSON.parse(localStorage.getItem('loginLogs') || '[]').map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
    setLoginLogs(logs);

    // WebSocket connection status
    const handleConnection = () => setIsConnected(true);
    const handleDisconnection = () => setIsConnected(false);
    
    // Real-time login updates
    const handleLoginUpdate = (updatedLogs: any[]) => {
      const formattedLogs = updatedLogs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
      setLoginLogs(formattedLogs);
    };

    // Listen for WebSocket events
    webSocketService.on('connected', handleConnection);
    webSocketService.on('disconnected', handleDisconnection);
    webSocketService.on('loginUpdate', handleLoginUpdate);

    // Listen for direct login events
    const handleDirectLogin = (event: CustomEvent) => {
      const newLog = {
        ...event.detail,
        timestamp: new Date(event.detail.timestamp)
      };
      setLoginLogs(prev => [newLog, ...prev]);
    };
    
    window.addEventListener('loginEvent', handleDirectLogin as EventListener);

    // Real-time updates every 2 seconds as fallback
    const interval = setInterval(() => {
      const updatedLogs = JSON.parse(localStorage.getItem('loginLogs') || '[]').map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
      setLoginLogs(updatedLogs);
    }, 2000);

    return () => {
      webSocketService.off('connected', handleConnection);
      webSocketService.off('disconnected', handleDisconnection);
      webSocketService.off('loginUpdate', handleLoginUpdate);
      window.removeEventListener('loginEvent', handleDirectLogin as EventListener);
      clearInterval(interval);
    };
  }, []);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center gap-3 border-b pb-4">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Real-time login monitoring</p>
            <div className="flex items-center gap-1">
              <Wifi className={`h-3 w-3 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {loginLogs.filter(log => log.status === 'success').length}
            </div>
            <div className="text-sm text-muted-foreground">Successful Logins</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive mb-1">
              {loginLogs.filter(log => log.status === 'failed').length}
            </div>
            <div className="text-sm text-muted-foreground">Failed Attempts</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {new Set(loginLogs.map(log => log.email)).size}
            </div>
            <div className="text-sm text-muted-foreground">Unique Users</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Login Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loginLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No login activity yet</p>
            ) : (
              loginLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{log.name}</p>
                      <p className="text-sm text-muted-foreground">{log.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Monitor className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{log.device}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{log.location}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="mb-1">
                        {log.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}