import { useState, useEffect } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [newNotificationId, setNewNotificationId] = useState<string | null>(null);
  const { notifications, unreadCount, markAsRead, dismissNotification, markAllAsRead, clearAll } = useNotifications();

  useEffect(() => {
    // Check for new notifications
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (!latestNotification.read && latestNotification.timestamp.getTime() > Date.now() - 5000) {
        setNewNotificationId(latestNotification.id);
        
        // Clear the animation after 3 seconds
        setTimeout(() => {
          setNewNotificationId(null);
        }, 3000);
      }
    }
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative transition-all duration-300 ${
          newNotificationId ? 'animate-pulse bg-primary/10' : ''
        }`}
      >
        <Bell className={`h-5 w-5 transition-all duration-300 ${
          newNotificationId ? 'animate-bounce text-primary' : ''
        }`} />
        {unreadCount > 0 && (
          <Badge className={`absolute -top-1 -right-1 h-5 w-5 p-0 text-xs transition-all duration-300 ${
            newNotificationId ? 'animate-pulse bg-primary scale-110' : 'bg-destructive'
          }`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs h-6 px-2 text-destructive hover:text-destructive"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">You'll see real-time updates here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border last:border-b-0 transition-all duration-300 cursor-pointer hover:bg-muted/20 ${
                    !notification.read ? 'bg-muted/30 border-l-4 border-l-primary' : ''
                  } ${
                    newNotificationId === notification.id ? 'animate-in slide-in-from-right-2 bg-primary/5' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium text-sm ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 h-2 w-2 bg-primary rounded-full inline-block animate-pulse"></span>
                          )}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <span>{formatTimeAgo(notification.timestamp)}</span>
                        {newNotificationId === notification.id && (
                          <span className="text-primary font-medium animate-pulse">• NEW</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}