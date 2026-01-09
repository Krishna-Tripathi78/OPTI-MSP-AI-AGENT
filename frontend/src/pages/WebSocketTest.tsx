import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Wifi, WifiOff, Send, Activity, Users, Bell } from 'lucide-react';

interface WebSocketConnection {
  id: string;
  name: string;
  url: string;
  socket: WebSocket | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  messages: Array<{ type: 'sent' | 'received', data: any, timestamp: string }>;
}

export default function WebSocketTest() {
  const [connections, setConnections] = useState<WebSocketConnection[]>([
    { id: 'dashboard', name: 'Dashboard Updates', url: '/ws/dashboard/test-user', socket: null, status: 'disconnected', messages: [] },
    { id: 'notifications', name: 'Notifications', url: '/ws/notifications/test-user', socket: null, status: 'disconnected', messages: [] },
    { id: 'team', name: 'Team Collaboration', url: '/ws/team/test-user', socket: null, status: 'disconnected', messages: [] }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [connections]);

  const connectWebSocket = (connectionId: string) => {
    setConnections(prev => prev.map(conn => {
      if (conn.id === connectionId) {
        if (conn.socket) {
          conn.socket.close();
        }

        const wsUrl = `ws://127.0.0.1:8000${conn.url}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setConnections(prev => prev.map(c => 
            c.id === connectionId 
              ? { ...c, status: 'connected', messages: [...c.messages, { type: 'received', data: 'Connected to WebSocket', timestamp: new Date().toLocaleTimeString() }] }
              : c
          ));
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setConnections(prev => prev.map(c => 
            c.id === connectionId 
              ? { ...c, messages: [...c.messages, { type: 'received', data, timestamp: new Date().toLocaleTimeString() }] }
              : c
          ));
        };

        socket.onclose = () => {
          setConnections(prev => prev.map(c => 
            c.id === connectionId 
              ? { ...c, status: 'disconnected', socket: null, messages: [...c.messages, { type: 'received', data: 'Disconnected from WebSocket', timestamp: new Date().toLocaleTimeString() }] }
              : c
          ));
        };

        socket.onerror = () => {
          setConnections(prev => prev.map(c => 
            c.id === connectionId 
              ? { ...c, status: 'error', messages: [...c.messages, { type: 'received', data: 'WebSocket error occurred', timestamp: new Date().toLocaleTimeString() }] }
              : c
          ));
        };

        return { ...conn, socket, status: 'connecting' as const };
      }
      return conn;
    }));
  };

  const disconnectWebSocket = (connectionId: string) => {
    setConnections(prev => prev.map(conn => {
      if (conn.id === connectionId && conn.socket) {
        conn.socket.close();
        return { ...conn, socket: null, status: 'disconnected' };
      }
      return conn;
    }));
  };

  const sendMessage = (connectionId: string, message: any) => {
    const connection = connections.find(c => c.id === connectionId);
    if (connection?.socket && connection.status === 'connected') {
      const messageData = typeof message === 'string' ? JSON.parse(message) : message;
      connection.socket.send(JSON.stringify(messageData));
      
      setConnections(prev => prev.map(c => 
        c.id === connectionId 
          ? { ...c, messages: [...c.messages, { type: 'sent', data: messageData, timestamp: new Date().toLocaleTimeString() }] }
          : c
      ));
    }
  };

  const sendPredefinedMessage = (connectionId: string, messageType: string) => {
    const messages = {
      ping: { type: 'ping', timestamp: Date.now() },
      request_update: { type: 'request_update' },
      team_member_added: { type: 'team_member_added', data: { name: 'John Doe', department: 'Technical' } },
      notification_read: { type: 'notification_read', notification_id: '123' }
    };

    sendMessage(connectionId, messages[messageType as keyof typeof messages]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="w-4 h-4 text-emerald-500" />;
      case 'connecting': return <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />;
      case 'error': return <WifiOff className="w-4 h-4 text-destructive" />;
      default: return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'connecting': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">WebSocket Testing</h1>
            <p className="text-sm text-muted-foreground">Test real-time WebSocket connections</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <Card key={connection.id} className="border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {connection.id === 'dashboard' && <Activity className="w-5 h-5 text-primary" />}
                  {connection.id === 'notifications' && <Bell className="w-5 h-5 text-primary" />}
                  {connection.id === 'team' && <Users className="w-5 h-5 text-primary" />}
                  {connection.name}
                </div>
                {getStatusIcon(connection.status)}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(connection.status)}>
                  {connection.status}
                </Badge>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {connection.url}
                </code>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {connection.status === 'disconnected' ? (
                  <Button 
                    onClick={() => connectWebSocket(connection.id)}
                    size="sm"
                    className="flex-1"
                  >
                    Connect
                  </Button>
                ) : (
                  <Button 
                    onClick={() => disconnectWebSocket(connection.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Disconnect
                  </Button>
                )}
              </div>

              {connection.status === 'connected' && (
                <div className="space-y-2">
                  <div className="flex gap-1 flex-wrap">
                    <Button 
                      onClick={() => sendPredefinedMessage(connection.id, 'ping')}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      Ping
                    </Button>
                    {connection.id === 'dashboard' && (
                      <Button 
                        onClick={() => sendPredefinedMessage(connection.id, 'request_update')}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        Request Update
                      </Button>
                    )}
                    {connection.id === 'team' && (
                      <Button 
                        onClick={() => sendPredefinedMessage(connection.id, 'team_member_added')}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        Add Member
                      </Button>
                    )}
                    {connection.id === 'notifications' && (
                      <Button 
                        onClick={() => sendPredefinedMessage(connection.id, 'notification_read')}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-3 h-48 overflow-y-auto">
                <div className="space-y-2 text-xs">
                  {connection.messages.map((message, index) => (
                    <div key={index} className={`flex gap-2 ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-2 rounded ${
                        message.type === 'sent' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background border'
                      }`}>
                        <div className="font-mono">
                          {typeof message.data === 'string' ? message.data : JSON.stringify(message.data, null, 2)}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Custom Message Sender</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder='{"type": "custom", "data": "test message"}'
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => {
                const activeConnection = connections.find(c => c.status === 'connected');
                if (activeConnection && messageInput.trim()) {
                  try {
                    sendMessage(activeConnection.id, messageInput);
                    setMessageInput('');
                  } catch (error) {
                    console.error('Invalid JSON:', error);
                  }
                }
              }}
              disabled={!connections.some(c => c.status === 'connected') || !messageInput.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Send custom JSON messages to the first connected WebSocket
          </p>
        </CardContent>
      </Card>
    </div>
  );
}