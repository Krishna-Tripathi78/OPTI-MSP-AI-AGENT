// Team Data Service - Connects to Backend API
// Falls back to mock data if API is unavailable

import { api } from './api';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  performance: number;
  ticketsResolved: number;
  clientSatisfaction: number;
  utilization: number;
  status: 'active' | 'busy' | 'away';
  email: string;
  joinDate: string;
  lastActivity: Date;
}

interface DepartmentData {
  department: string;
  members: number;
  performance: number;
  utilization: number;
}

// API Configuration
const USE_API = true;

class TeamDataService {
  private teamMembers: TeamMember[] = [];
  private apiAvailable: boolean = true;

  private performanceHistory = [
    { month: 'Jan', performance: 87, satisfaction: 91 },
    { month: 'Feb', performance: 89, satisfaction: 93 },
    { month: 'Mar', performance: 91, satisfaction: 94 },
    { month: 'Apr', performance: 88, satisfaction: 92 },
    { month: 'May', performance: 92, satisfaction: 95 },
    { month: 'Jun', performance: 94, satisfaction: 96 }
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
        console.warn('API unavailable, using local storage:', error);
        this.apiAvailable = false;
      }
    }
    this.loadFromStorage();
  }

  private async fetchFromAPI(): Promise<void> {
    const apiMembers = await api.getTeamMembers() as any[];
    this.teamMembers = apiMembers.map((member: any) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      performance: member.performance_score || 85,
      ticketsResolved: member.tickets_resolved || 0,
      clientSatisfaction: 90 + Math.random() * 10,
      utilization: 75 + Math.random() * 25,
      status: member.status || 'active',
      email: member.email,
      joinDate: member.created_at?.split('T')[0] || '2023-01-01',
      lastActivity: new Date()
    }));
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem('teamMembers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.teamMembers = parsed.map((member: any) => ({
          ...member,
          lastActivity: new Date(member.lastActivity)
        }));
      } catch (error) {
        console.error('Failed to load team members from storage:', error);
        this.initializeDefaultData();
      }
    } else {
      this.initializeDefaultData();
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('teamMembers', JSON.stringify(this.teamMembers));
    } catch (error) {
      console.error('Failed to save team members to storage:', error);
    }
  }

  private initializeDefaultData(): void {
    this.teamMembers = [
      {
        id: '1',
        name: 'Rajesh Sharma',
        role: 'Senior Engineer',
        department: 'Technical',
        performance: 94,
        ticketsResolved: 127,
        clientSatisfaction: 96,
        utilization: 85,
        status: 'active',
        email: 'rajesh.sharma@optimsp.com',
        joinDate: '2021-03-15',
        lastActivity: new Date()
      },
      {
        id: '2',
        name: 'Priya Patel',
        role: 'Project Manager',
        department: 'Operations',
        performance: 91,
        ticketsResolved: 89,
        clientSatisfaction: 94,
        utilization: 78,
        status: 'busy',
        email: 'priya.patel@optimsp.com',
        joinDate: '2020-08-22',
        lastActivity: new Date()
      },
      {
        id: '3',
        name: 'Amit Kumar',
        role: 'Cloud Architect',
        department: 'Technical',
        performance: 88,
        ticketsResolved: 156,
        clientSatisfaction: 92,
        utilization: 92,
        status: 'active',
        email: 'amit.kumar@optimsp.com',
        joinDate: '2019-11-10',
        lastActivity: new Date()
      },
      {
        id: '4',
        name: 'Sneha Gupta',
        role: 'Security Analyst',
        department: 'Security',
        performance: 96,
        ticketsResolved: 98,
        clientSatisfaction: 98,
        utilization: 88,
        status: 'active',
        email: 'sneha.gupta@optimsp.com',
        joinDate: '2022-01-18',
        lastActivity: new Date()
      },
      {
        id: '5',
        name: 'Vikram Singh',
        role: 'Support Specialist',
        department: 'Support',
        performance: 82,
        ticketsResolved: 203,
        clientSatisfaction: 89,
        utilization: 95,
        status: 'busy',
        email: 'vikram.singh@optimsp.com',
        joinDate: '2021-07-05',
        lastActivity: new Date()
      },
      {
        id: '6',
        name: 'Kavya Mehta',
        role: 'Network Admin',
        department: 'Technical',
        performance: 90,
        ticketsResolved: 134,
        clientSatisfaction: 93,
        utilization: 87,
        status: 'away',
        email: 'kavya.mehta@optimsp.com',
        joinDate: '2020-12-03',
        lastActivity: new Date()
      }
    ];
    this.saveToStorage();
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    // Refresh from API if available
    if (USE_API && this.apiAvailable) {
      try {
        await this.fetchFromAPI();
      } catch (error) {
        // Use cached data
      }
    }
    return [...this.teamMembers];
  }

  getDepartmentData(): DepartmentData[] {
    const departments = ['Technical', 'Operations', 'Security', 'Support'];
    return departments.map(dept => {
      const deptMembers = this.teamMembers.filter(m => m.department === dept);
      return {
        department: dept,
        members: deptMembers.length,
        performance: Math.round(deptMembers.reduce((sum, m) => sum + m.performance, 0) / deptMembers.length) || 0,
        utilization: Math.round(deptMembers.reduce((sum, m) => sum + m.utilization, 0) / deptMembers.length) || 0
      };
    });
  }

  getPerformanceHistory() {
    return [...this.performanceHistory];
  }

  simulateRealTimeUpdates(): void {
    this.teamMembers = this.teamMembers.map(member => {
      const updates: Partial<TeamMember> = {};

      if (Math.random() < 0.4) {
        const ticketChange = Math.floor(Math.random() * 5) - 2;
        updates.ticketsResolved = Math.max(0, member.ticketsResolved + ticketChange);
      }

      if (Math.random() < 0.3) {
        const perfChange = Math.floor(Math.random() * 6) - 3;
        updates.performance = Math.max(70, Math.min(100, member.performance + perfChange));
      }

      if (Math.random() < 0.5) {
        const utilChange = Math.floor(Math.random() * 8) - 4;
        updates.utilization = Math.max(60, Math.min(100, member.utilization + utilChange));
      }

      if (Math.random() < 0.2) {
        const currentHour = new Date().getHours();
        if (currentHour >= 9 && currentHour <= 17) {
          updates.status = Math.random() < 0.7 ? 'active' : 'busy';
        } else {
          updates.status = Math.random() < 0.8 ? 'away' : 'active';
        }
      }

      if (Math.random() < 0.25) {
        const satChange = Math.floor(Math.random() * 4) - 2;
        updates.clientSatisfaction = Math.max(80, Math.min(100, member.clientSatisfaction + satChange));
      }

      updates.lastActivity = new Date();

      return { ...member, ...updates };
    });

    this.saveToStorage();

    const currentPerf = Math.round(
      this.teamMembers.reduce((sum, m) => sum + m.performance, 0) / this.teamMembers.length
    );
    const currentSat = Math.round(
      this.teamMembers.reduce((sum, m) => sum + m.clientSatisfaction, 0) / this.teamMembers.length
    );

    this.performanceHistory[this.performanceHistory.length - 1] = {
      month: new Date().toLocaleString('default', { month: 'short' }),
      performance: currentPerf,
      satisfaction: currentSat
    };
  }

  async addTeamMember(member: Omit<TeamMember, 'id' | 'lastActivity'>): Promise<void> {
    // Try to add via API first
    if (USE_API && this.apiAvailable) {
      try {
        const apiMember = await api.createTeamMember({
          name: member.name,
          email: member.email,
          role: member.role,
          department: member.department,
          status: member.status,
          performance_score: member.performance,
          tickets_resolved: member.ticketsResolved
        });
        await this.fetchFromAPI();
        return;
      } catch (error) {
        console.warn('Failed to add via API, adding locally:', error);
      }
    }

    // Fallback to local storage
    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString(),
      lastActivity: new Date()
    };
    this.teamMembers.push(newMember);
    this.saveToStorage();
  }

  updateMemberStatus(id: string, status: 'active' | 'busy' | 'away'): void {
    this.teamMembers = this.teamMembers.map(member =>
      member.id === id ? { ...member, status, lastActivity: new Date() } : member
    );
    this.saveToStorage();

    // Try to update via API
    if (USE_API && this.apiAvailable) {
      api.updateTeamMember(id, { status }).catch(console.warn);
    }
  }
}

export const teamDataService = new TeamDataService();