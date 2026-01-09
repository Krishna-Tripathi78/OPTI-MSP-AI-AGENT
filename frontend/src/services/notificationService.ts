export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeNotifications();
    this.startRealTimeUpdates();
  }

  private initializeNotifications() {
    this.notifications = [
      {
        id: '1',
        type: 'warning',
        title: 'High Resource Usage',
        message: 'Server CPU usage exceeded 85% threshold',
        timestamp: new Date(Date.now() - 300000),
        read: false
      },
      {
        id: '2',
        type: 'success',
        title: 'Cost Optimization Applied',
        message: 'Successfully reduced cloud costs by $2,400/month',
        timestamp: new Date(Date.now() - 600000),
        read: false
      }
    ];
  }

  private startRealTimeUpdates() {
    this.intervalId = setInterval(() => {
      this.generateRandomNotification();
    }, 15000 + Math.random() * 30000); // 15-45 seconds
  }

  private generateRandomNotification() {
    const notificationTypes = [
      {
        type: 'success' as const,
        titles: ['Cost Optimization', 'Performance Improved', 'Backup Completed', 'License Renewed'],
        messages: [
          'Successfully reduced monthly costs by $1,200',
          'System performance improved by 23%',
          'Daily backup completed successfully',
          'Microsoft 365 licenses renewed automatically'
        ]
      },
      {
        type: 'warning' as const,
        titles: ['Resource Alert', 'License Expiry', 'High Usage', 'Security Alert'],
        messages: [
          'Memory usage reached 90% on server-prod-01',
          'Adobe CC licenses expire in 7 days',
          'Bandwidth usage exceeded 80% threshold',
          'Failed login attempts detected from unknown IP'
        ]
      },
      {
        type: 'info' as const,
        titles: ['Scheduled Maintenance', 'Client Update', 'System Report', 'New Feature'],
        messages: [
          'Maintenance window scheduled for tonight 2-4 AM',
          'TechCorp Inc. requested additional licenses',
          'Weekly system report is now available',
          'New AI insights feature is now available'
        ]
      },
      {
        type: 'error' as const,
        titles: ['Service Down', 'Backup Failed', 'Connection Lost', 'Critical Alert'],
        messages: [
          'Email service is currently unavailable',
          'Backup failed for client database',
          'Lost connection to monitoring server',
          'Critical security vulnerability detected'
        ]
      }
    ];

    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const randomTitle = randomType.titles[Math.floor(Math.random() * randomType.titles.length)];
    const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: randomType.type,
      title: randomTitle,
      message: randomMessage,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 20 notifications
    if (this.notifications.length > 20) {
      this.notifications = this.notifications.slice(0, 20);
    }

    this.notifyListeners();
  }

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
    callback(this.notifications); // Send current notifications immediately
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifyListeners();
  }

  dismissNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  getNotifications() {
    return [...this.notifications];
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners = [];
  }
}

export const notificationService = new NotificationService();