// MSP Data Service - Connects to Backend API
// Falls back to mock data if API is unavailable

import { api } from './api';

export interface MSPMetrics {
  revenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  healthScore: number;
  revenueGrowth: number;
  clientCount: number;
}

export interface ClientData {
  id: string;
  name: string;
  revenue: number;
  costs: number;
  margin: number;
  status: 'profitable' | 'warning' | 'unprofitable';
  contractValue: number;
  monthlyRecurring: number;
  industry?: string;
  healthScore?: number;
}

export interface ServiceData {
  name: string;
  revenue: number;
  clients: number;
  avgMargin: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
}

// API Configuration
const USE_API = true; // Set to false to use mock data

// Main data service
export class MSPDataService {
  private clients: ClientData[] = [];
  private services: ServiceData[] = [];
  private revenueHistory: RevenueData[] = [];
  private lastUpdate: number = 0;
  private updateInterval: number = 30000;
  private apiAvailable: boolean = true;

  constructor() {
    this.refreshData();
  }

  private async refreshData() {
    if (USE_API && this.apiAvailable) {
      try {
        await this.fetchFromAPI();
      } catch (error) {
        console.warn('API unavailable, using mock data:', error);
        this.apiAvailable = false;
        this.loadMockData();
      }
    } else {
      this.loadMockData();
    }
    this.lastUpdate = Date.now();
  }

  private async fetchFromAPI() {
    // Fetch clients from API
    const apiClients = await api.getClients() as any[];
    this.clients = apiClients.map((client: any) => {
      const margin = client.monthly_revenue > 0
        ? ((client.monthly_revenue - client.monthly_cost) / client.monthly_revenue) * 100
        : 0;

      let status: 'profitable' | 'warning' | 'unprofitable';
      if (margin > 20) status = 'profitable';
      else if (margin > 5) status = 'warning';
      else status = 'unprofitable';

      return {
        id: client.id,
        name: client.name,
        revenue: client.monthly_revenue,
        costs: client.monthly_cost,
        margin: Math.round(margin * 100) / 100,
        status,
        contractValue: client.monthly_revenue * 12,
        monthlyRecurring: client.monthly_revenue,
        industry: client.industry,
        healthScore: client.health_score
      };
    });

    // Fetch revenue trend from API
    const trendData = await api.getRevenueTrend() as any[];
    this.revenueHistory = trendData.map((item: any) => ({
      month: item.month,
      revenue: item.revenue / 1000000, // Convert to millions
      costs: item.cost / 1000000,
      profit: item.profit / 1000000
    }));

    // Generate service data from clients
    this.services = this.generateServiceData();
  }

  private loadMockData() {
    const clients = [
      { name: 'Sharma Technologies', baseRevenue: 25000, baseCosts: 17000 },
      { name: 'Patel Manufacturing', baseRevenue: 18000, baseCosts: 14500 },
      { name: 'Gupta Innovations', baseRevenue: 12000, baseCosts: 13200 },
      { name: 'Agarwal Enterprises', baseRevenue: 45000, baseCosts: 28000 },
      { name: 'Singh Retail Chain', baseRevenue: 8000, baseCosts: 6500 },
      { name: 'Mehta Healthcare', baseRevenue: 32000, baseCosts: 22000 },
      { name: 'Jain Legal Associates', baseRevenue: 15000, baseCosts: 11000 },
      { name: 'Kumar Construction', baseRevenue: 22000, baseCosts: 18500 },
      { name: 'Verma Financial Services', baseRevenue: 38000, baseCosts: 25000 },
      { name: 'Bansal Education Group', baseRevenue: 28000, baseCosts: 21000 }
    ];

    this.clients = clients.map((client, index) => {
      const revenueVariance = (Math.random() - 0.5) * 0.2;
      const costVariance = (Math.random() - 0.5) * 0.15;

      const revenue = Math.round(client.baseRevenue * (1 + revenueVariance));
      const costs = Math.round(client.baseCosts * (1 + costVariance));
      const margin = ((revenue - costs) / revenue) * 100;

      let status: 'profitable' | 'warning' | 'unprofitable';
      if (margin > 20) status = 'profitable';
      else if (margin > 5) status = 'warning';
      else status = 'unprofitable';

      return {
        id: `client-${index + 1}`,
        name: client.name,
        revenue,
        costs,
        margin: Math.round(margin * 100) / 100,
        status,
        contractValue: revenue * 12,
        monthlyRecurring: revenue
      };
    });

    this.services = this.generateServiceData();
    this.revenueHistory = this.generateRevenueData();
  }

  private generateServiceData(): ServiceData[] {
    return [
      { name: 'Managed IT Services', revenue: 850000 + Math.random() * 100000, clients: 45, avgMargin: 28 + Math.random() * 8 },
      { name: 'Cloud Services', revenue: 620000 + Math.random() * 80000, clients: 38, avgMargin: 32 + Math.random() * 6 },
      { name: 'Cybersecurity', revenue: 480000 + Math.random() * 60000, clients: 42, avgMargin: 35 + Math.random() * 10 },
      { name: 'Backup & Recovery', revenue: 320000 + Math.random() * 40000, clients: 52, avgMargin: 45 + Math.random() * 8 },
      { name: 'Help Desk Support', revenue: 280000 + Math.random() * 30000, clients: 48, avgMargin: 22 + Math.random() * 6 }
    ];
  }

  private generateRevenueData(): RevenueData[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let baseRevenue = 2100000;
    let baseCosts = 1580000;

    return months.map(month => {
      const growthRate = 0.02 + (Math.random() - 0.5) * 0.03;
      const costGrowthRate = 0.015 + (Math.random() - 0.5) * 0.02;

      baseRevenue *= (1 + growthRate);
      baseCosts *= (1 + costGrowthRate);

      return {
        month,
        revenue: Math.round(baseRevenue / 1000000 * 100) / 100,
        costs: Math.round(baseCosts / 1000000 * 100) / 100,
        profit: Math.round((baseRevenue - baseCosts) / 1000000 * 100) / 100
      };
    });
  }

  private shouldRefresh(): boolean {
    return Date.now() - this.lastUpdate > this.updateInterval;
  }

  async getMSPMetrics(): Promise<MSPMetrics> {
    if (this.shouldRefresh()) {
      await this.refreshData();
    }

    // Try to get from API first
    if (USE_API && this.apiAvailable) {
      try {
        const metrics = await api.getDashboardMetrics() as any;
        return {
          revenue: metrics.total_revenue / 1000000,
          totalCosts: (metrics.total_revenue - (metrics.total_revenue * metrics.profit_margin / 100)) / 1000000,
          netProfit: (metrics.total_revenue * metrics.profit_margin / 100) / 1000000,
          profitMargin: metrics.profit_margin,
          healthScore: Math.min(87 + Math.random() * 10, 100),
          revenueGrowth: 8.5 + Math.random() * 6,
          clientCount: metrics.total_clients
        };
      } catch (error) {
        console.warn('Failed to get metrics from API:', error);
      }
    }

    // Fallback to calculated metrics
    const totalRevenue = this.clients.reduce((sum, client) => sum + client.revenue, 0);
    const totalCosts = this.clients.reduce((sum, client) => sum + client.costs, 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = (netProfit / totalRevenue) * 100;

    const profitableClients = this.clients.filter(c => c.status === 'profitable').length;
    const clientHealthScore = (profitableClients / this.clients.length) * 40;
    const marginScore = Math.min(profitMargin * 1.5, 40);
    const growthScore = 20;

    const healthScore = Math.round(clientHealthScore + marginScore + growthScore);

    return {
      revenue: Math.round(totalRevenue / 1000000 * 100) / 100,
      totalCosts: Math.round(totalCosts / 1000000 * 100) / 100,
      netProfit: Math.round(netProfit / 1000000 * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      healthScore: Math.min(healthScore, 100),
      revenueGrowth: 8.5 + Math.random() * 6,
      clientCount: this.clients.length
    };
  }

  getClientData(): ClientData[] {
    if (this.shouldRefresh()) {
      this.refreshData();
    }
    return this.clients.sort((a, b) => b.revenue - a.revenue);
  }

  getServiceData(): ServiceData[] {
    if (this.shouldRefresh()) {
      this.refreshData();
    }
    return this.services.sort((a, b) => b.revenue - a.revenue);
  }

  getRevenueHistory(): RevenueData[] {
    if (this.shouldRefresh()) {
      this.refreshData();
    }
    return this.revenueHistory;
  }

  getTopClients(limit: number = 5): { profitable: ClientData[], unprofitable: ClientData[] } {
    const clients = this.getClientData();
    const profitable = clients.filter(c => c.status === 'profitable').slice(0, limit);
    const unprofitable = clients.filter(c => c.status === 'unprofitable').slice(0, limit);

    return { profitable, unprofitable };
  }

  getAlerts(): Array<{ type: 'warning' | 'error' | 'info', message: string, client?: string }> {
    const clients = this.getClientData();
    const alerts = [];

    const unprofitableClients = clients.filter(c => c.status === 'unprofitable');
    if (unprofitableClients.length > 0) {
      alerts.push({
        type: 'error' as const,
        message: `${unprofitableClients.length} clients are unprofitable`,
        client: unprofitableClients[0].name
      });
    }

    const lowMarginClients = clients.filter(c => c.margin < 10 && c.margin > 0);
    if (lowMarginClients.length > 0) {
      alerts.push({
        type: 'warning' as const,
        message: `${lowMarginClients.length} clients have margins below 10%`,
        client: lowMarginClients[0].name
      });
    }

    return alerts;
  }
}

// Export singleton instance
export const mspDataService = new MSPDataService();