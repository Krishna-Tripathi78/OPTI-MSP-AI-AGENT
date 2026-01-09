// Anomaly Service - Connects to Backend API
// Falls back to mock data if API is unavailable

import { api } from './api';

export interface Anomaly {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  client: string;
  metric: string;
  value: string;
  rootCause: string;
  timestamp: Date;
  resolved: boolean;
}

interface TrendData {
  month: string;
  anomalies: number;
}

// API Configuration
const USE_API = true;

class AnomalyService {
  private anomalies: Anomaly[] = [];
  private apiAvailable: boolean = true;
  private trendData: TrendData[] = [
    { month: 'Jan', anomalies: 12 },
    { month: 'Feb', anomalies: 8 },
    { month: 'Mar', anomalies: 15 },
    { month: 'Apr', anomalies: 6 },
    { month: 'May', anomalies: 11 },
    { month: 'Jun', anomalies: 9 }
  ];

  private anomalyTemplates = [
    {
      severity: 'HIGH' as const,
      titles: ['Unusual Spike in AWS Costs', 'Critical Storage Overflow', 'License Overage Alert'],
      clients: ['Sharma Technologies', 'Agarwal Enterprises', 'Verma Financial Services'],
      rootCauses: ['EC2 instance left running', 'Backup retention misconfigured', 'Auto-scaling triggered']
    },
    {
      severity: 'MEDIUM' as const,
      titles: ['Abnormal License Usage', 'Storage Growth Pattern', 'Bandwidth Spike'],
      clients: ['Patel Manufacturing', 'Mehta Healthcare', 'Bansal Education Group'],
      rootCauses: ['Unused licenses detected', 'Data retention policy needs review', 'Seasonal usage increase']
    },
    {
      severity: 'LOW' as const,
      titles: ['Minor Cost Variance', 'Usage Pattern Change', 'Performance Dip'],
      clients: ['Singh Retail Chain', 'Jain Legal Associates', 'Kumar Construction'],
      rootCauses: ['Normal fluctuation', 'User behavior change', 'Temporary network issue']
    }
  ];

  constructor() {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    if (USE_API && this.apiAvailable) {
      try {
        await this.fetchFromAPI();
        return;
      } catch (error) {
        console.warn('API unavailable, using mock data:', error);
        this.apiAvailable = false;
      }
    }
    this.initializeAnomalies();
  }

  private async fetchFromAPI(): Promise<void> {
    const apiAnomalies = await api.getAnomalies() as any[];
    this.anomalies = apiAnomalies.map((anomaly: any) => ({
      id: anomaly.id,
      severity: anomaly.severity.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW',
      title: anomaly.title,
      client: anomaly.client_name || 'Unknown Client',
      metric: anomaly.impact_amount ? `$${anomaly.impact_amount.toLocaleString()}` : 'N/A',
      value: anomaly.impact_amount ? `$${anomaly.impact_amount.toLocaleString()}` : '$0',
      rootCause: anomaly.description || 'Under investigation',
      timestamp: new Date(anomaly.detected_at),
      resolved: anomaly.status === 'resolved'
    }));
  }

  private initializeAnomalies() {
    this.anomalies = [
      {
        id: '1',
        severity: 'HIGH',
        title: 'Unusual Spike in AWS Costs',
        client: 'Sharma Technologies',
        metric: '+127% from average',
        value: '$12,400',
        rootCause: 'EC2 instance left running',
        timestamp: new Date(),
        resolved: false
      },
      {
        id: '2',
        severity: 'MEDIUM',
        title: 'Abnormal License Usage',
        client: 'Patel Manufacturing',
        metric: 'Usage: 45%',
        value: '$8,200',
        rootCause: '22 unused licenses detected',
        timestamp: new Date(),
        resolved: false
      }
    ];
  }

  private generateRandomAnomaly(): Anomaly {
    const template = this.anomalyTemplates[Math.floor(Math.random() * this.anomalyTemplates.length)];
    const title = template.titles[Math.floor(Math.random() * template.titles.length)];
    const client = template.clients[Math.floor(Math.random() * template.clients.length)];
    const rootCause = template.rootCauses[Math.floor(Math.random() * template.rootCauses.length)];

    const metrics = ['+89% from average', '+156% spike', 'Usage: 23%', '+45% increase'];
    const values = ['$5,200', '$8,900', '$12,100', '$3,400', '$15,600'];

    return {
      id: Date.now().toString(),
      severity: template.severity,
      title,
      client,
      metric: metrics[Math.floor(Math.random() * metrics.length)],
      value: values[Math.floor(Math.random() * values.length)],
      rootCause,
      timestamp: new Date(),
      resolved: false
    };
  }

  async getAnomalies(): Promise<Anomaly[]> {
    // Refresh from API if available
    if (USE_API && this.apiAvailable) {
      try {
        await this.fetchFromAPI();
      } catch (error) {
        // Use cached data
      }
    }
    return [...this.anomalies];
  }

  getTrendData(): TrendData[] {
    return [...this.trendData];
  }

  async resolveAnomaly(id: string): Promise<void> {
    // Try to resolve via API first
    if (USE_API && this.apiAvailable) {
      try {
        await api.resolveAnomaly(id, 'Resolved by user');
        await this.fetchFromAPI();
        return;
      } catch (error) {
        console.warn('Failed to resolve via API:', error);
      }
    }

    // Fallback to local update
    this.anomalies = this.anomalies.map(anomaly =>
      anomaly.id === id ? { ...anomaly, resolved: true } : anomaly
    );
  }

  simulateRealTimeUpdates(): void {
    // Add new anomaly occasionally
    if (Math.random() < 0.3 && this.anomalies.filter(a => !a.resolved).length < 5) {
      this.anomalies.push(this.generateRandomAnomaly());
    }

    // Auto-resolve some anomalies
    if (Math.random() < 0.2) {
      const unresolvedAnomalies = this.anomalies.filter(a => !a.resolved);
      if (unresolvedAnomalies.length > 0) {
        const randomAnomaly = unresolvedAnomalies[Math.floor(Math.random() * unresolvedAnomalies.length)];
        this.resolveAnomaly(randomAnomaly.id);
      }
    }

    // Update trend data
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const currentCount = this.anomalies.filter(a => !a.resolved).length;
    this.trendData[this.trendData.length - 1] = { month: currentMonth, anomalies: currentCount };
  }
}

export const anomalyService = new AnomalyService();