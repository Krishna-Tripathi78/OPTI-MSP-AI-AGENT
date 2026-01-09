interface ClientData {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'warning';
  revenue: number;
  costs: number;
  margin: number;
  services: string[];
  joinDate: string;
  lastContact: Date;
  healthScore: number;
}

interface ServiceData {
  id: string;
  name: string;
  category: string;
  monthlyRevenue: number;
  monthlyCost: number;
  clientCount: number;
  profitMargin: number;
  status: 'active' | 'inactive';
}

interface MSPMetrics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  clientCount: number;
  activeServices: number;
  healthScore: number;
  monthlyGrowth: number;
}

class ComprehensiveDataService {
  private storageKeys = {
    clients: 'optimsp_clients',
    services: 'optimsp_services',
    metrics: 'optimsp_metrics',
    lastUpdate: 'optimsp_last_update'
  };

  private clients: ClientData[] = [];
  private services: ServiceData[] = [];
  private metrics: MSPMetrics = {
    totalRevenue: 0,
    totalCosts: 0,
    netProfit: 0,
    profitMargin: 0,
    clientCount: 0,
    activeServices: 0,
    healthScore: 0,
    monthlyGrowth: 0
  };

  constructor() {
    this.loadFromStorage();
    this.startRealTimeUpdates();
  }

  private loadFromStorage(): void {
    try {
      const savedClients = localStorage.getItem(this.storageKeys.clients);
      const savedServices = localStorage.getItem(this.storageKeys.services);
      const savedMetrics = localStorage.getItem(this.storageKeys.metrics);

      if (savedClients) {
        this.clients = JSON.parse(savedClients).map((client: any) => ({
          ...client,
          lastContact: new Date(client.lastContact)
        }));
      } else {
        this.initializeDefaultClients();
      }

      if (savedServices) {
        this.services = JSON.parse(savedServices);
      } else {
        this.initializeDefaultServices();
      }

      if (savedMetrics) {
        this.metrics = JSON.parse(savedMetrics);
      } else {
        this.calculateMetrics();
      }
    } catch (error) {
      console.error('Failed to load data from storage:', error);
      this.initializeDefaultData();
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKeys.clients, JSON.stringify(this.clients));
      localStorage.setItem(this.storageKeys.services, JSON.stringify(this.services));
      localStorage.setItem(this.storageKeys.metrics, JSON.stringify(this.metrics));
      localStorage.setItem(this.storageKeys.lastUpdate, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save data to storage:', error);
    }
  }

  private initializeDefaultClients(): void {
    this.clients = [
      {
        id: '1',
        name: 'Rajesh Sharma',
        company: 'Sharma Technologies',
        email: 'rajesh@sharmatech.com',
        phone: '+91-9876543210',
        status: 'active',
        revenue: 200000,
        costs: 136000,
        margin: 32,
        services: ['Managed IT', 'Cloud Services', 'Security'],
        joinDate: '2022-01-15',
        lastContact: new Date(),
        healthScore: 92
      },
      {
        id: '2',
        name: 'Priya Patel',
        company: 'Patel Manufacturing',
        email: 'priya@patelmanuf.com',
        phone: '+91-9876543211',
        status: 'warning',
        revenue: 180000,
        costs: 148000,
        margin: 18,
        services: ['Managed IT', 'Backup'],
        joinDate: '2021-03-22',
        lastContact: new Date(),
        healthScore: 76
      },
      {
        id: '3',
        name: 'Amit Kumar',
        company: 'Kumar Enterprises',
        email: 'amit@kumarenterprises.com',
        phone: '+91-9876543212',
        status: 'inactive',
        revenue: 150000,
        costs: 158000,
        margin: -5,
        services: ['Support'],
        joinDate: '2020-08-10',
        lastContact: new Date(),
        healthScore: 45
      }
    ];
    this.saveToStorage();
  }

  private initializeDefaultServices(): void {
    this.services = [
      {
        id: '1',
        name: 'Managed IT Services',
        category: 'Infrastructure',
        monthlyRevenue: 85000,
        monthlyCost: 52000,
        clientCount: 45,
        profitMargin: 39,
        status: 'active'
      },
      {
        id: '2',
        name: 'Cloud Services',
        category: 'Cloud',
        monthlyRevenue: 65000,
        monthlyCost: 42000,
        clientCount: 32,
        profitMargin: 35,
        status: 'active'
      },
      {
        id: '3',
        name: 'Security Services',
        category: 'Security',
        monthlyRevenue: 45000,
        monthlyCost: 28000,
        clientCount: 28,
        profitMargin: 38,
        status: 'active'
      }
    ];
    this.saveToStorage();
  }

  private initializeDefaultData(): void {
    this.initializeDefaultClients();
    this.initializeDefaultServices();
    this.calculateMetrics();
  }

  private calculateMetrics(): void {
    const totalRevenue = this.clients.reduce((sum, client) => sum + client.revenue, 0);
    const totalCosts = this.clients.reduce((sum, client) => sum + client.costs, 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const avgHealthScore = this.clients.reduce((sum, client) => sum + client.healthScore, 0) / this.clients.length;

    this.metrics = {
      totalRevenue,
      totalCosts,
      netProfit,
      profitMargin,
      clientCount: this.clients.length,
      activeServices: this.services.filter(s => s.status === 'active').length,
      healthScore: Math.round(avgHealthScore),
      monthlyGrowth: Math.random() * 10 + 5 // Simulated growth
    };

    this.saveToStorage();
  }

  private startRealTimeUpdates(): void {
    // Update metrics every 30 seconds
    setInterval(() => {
      this.simulateRealTimeChanges();
      this.calculateMetrics();
      this.dispatchUpdateEvent();
    }, 30000);
  }

  private simulateRealTimeChanges(): void {
    // Simulate client health score changes
    this.clients = this.clients.map(client => ({
      ...client,
      healthScore: Math.max(30, Math.min(100, client.healthScore + (Math.random() - 0.5) * 5)),
      lastContact: Math.random() < 0.1 ? new Date() : client.lastContact
    }));

    // Simulate service revenue changes
    this.services = this.services.map(service => ({
      ...service,
      monthlyRevenue: Math.max(10000, service.monthlyRevenue + (Math.random() - 0.5) * 2000)
    }));

    this.saveToStorage();
  }

  private dispatchUpdateEvent(): void {
    window.dispatchEvent(new CustomEvent('dataUpdated', {
      detail: {
        clients: this.clients,
        services: this.services,
        metrics: this.metrics
      }
    }));
  }

  // Public methods
  getClients(): ClientData[] {
    return [...this.clients];
  }

  getServices(): ServiceData[] {
    return [...this.services];
  }

  getMetrics(): MSPMetrics {
    return { ...this.metrics };
  }

  addClient(client: Omit<ClientData, 'id' | 'lastContact'>): void {
    const newClient: ClientData = {
      ...client,
      id: Date.now().toString(),
      lastContact: new Date()
    };
    this.clients.push(newClient);
    this.calculateMetrics();
    this.dispatchUpdateEvent();
  }

  updateClient(id: string, updates: Partial<ClientData>): void {
    this.clients = this.clients.map(client =>
      client.id === id ? { ...client, ...updates, lastContact: new Date() } : client
    );
    this.calculateMetrics();
    this.dispatchUpdateEvent();
  }

  deleteClient(id: string): void {
    this.clients = this.clients.filter(client => client.id !== id);
    this.calculateMetrics();
    this.dispatchUpdateEvent();
  }

  addService(service: Omit<ServiceData, 'id'>): void {
    const newService: ServiceData = {
      ...service,
      id: Date.now().toString()
    };
    this.services.push(newService);
    this.calculateMetrics();
    this.dispatchUpdateEvent();
  }

  updateService(id: string, updates: Partial<ServiceData>): void {
    this.services = this.services.map(service =>
      service.id === id ? { ...service, ...updates } : service
    );
    this.calculateMetrics();
    this.dispatchUpdateEvent();
  }

  deleteService(id: string): void {
    this.services = this.services.filter(service => service.id !== id);
    this.calculateMetrics();
    this.dispatchUpdateEvent();
  }

  forceUpdate(): void {
    this.calculateMetrics();
    this.dispatchUpdateEvent();
  }
}

export const comprehensiveDataService = new ComprehensiveDataService();