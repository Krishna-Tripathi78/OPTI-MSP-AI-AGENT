import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  message?: string;
}

export const useWebSocket = (endpoint: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  const connect = () => {
    if (!user?.id) return;

    const wsUrl = `ws://localhost:8000/ws/${endpoint}/${user.id}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log(`WebSocket connected to ${endpoint}`);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log(`WebSocket disconnected from ${endpoint}`);
      
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (user?.id) connect();
      }, 3000);
    };

    ws.current.onerror = (error) => {
      setConnectionError('WebSocket connection failed');
      console.error('WebSocket error:', error);
    };
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const disconnect = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [user?.id, endpoint]);

  return {
    isConnected,
    lastMessage,
    connectionError,
    sendMessage,
    reconnect: connect
  };
};

// Specific hooks for different endpoints
export const useDashboardWebSocket = () => {
  const { lastMessage, sendMessage, isConnected } = useWebSocket('dashboard');
  
  const requestUpdate = () => {
    sendMessage({ type: 'request_update' });
  };

  return { lastMessage, requestUpdate, isConnected };
};

export const useNotificationsWebSocket = () => {
  const { lastMessage, sendMessage, isConnected } = useWebSocket('notifications');
  
  const markAsRead = (notificationId: string) => {
    sendMessage({ 
      type: 'notification_read', 
      notification_id: notificationId 
    });
  };

  return { lastMessage, markAsRead, isConnected };
};

export const useTeamWebSocket = () => {
  const { lastMessage, sendMessage, isConnected } = useWebSocket('team');
  
  const broadcastTeamUpdate = (data: any) => {
    sendMessage({ 
      type: 'team_member_added', 
      data 
    });
  };

  return { lastMessage, broadcastTeamUpdate, isConnected };
};