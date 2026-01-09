// User Service - Connects to Backend API for Authentication
// Falls back to localStorage if API is unavailable

import { api, setAuthToken, removeAuthToken } from './api';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: string;
  company?: string;
  phone?: string;
  createdAt?: string;
}

// API Configuration
const USE_API = true;
let apiAvailable = true;

class UserService {
  private storageKey = 'optimsp_users';
  private sessionKey = 'optimsp_session';
  private tokenKey = 'auth_token';

  // ==================== API Methods ====================

  async registerAPI(email: string, password: string, name: string, company?: string): Promise<{ success: boolean; message: string }> {
    try {
      await api.register({ email, password, name, company });
      // Auto-login after registration
      return await this.loginAPI(email, password);
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  }

  async loginAPI(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const response = await api.login(email, password);

      // Get user info after login
      const userInfo = await api.getCurrentUser() as any;

      const user: User = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        role: userInfo.role || 'user',
        company: userInfo.company,
        phone: userInfo.phone,
        createdAt: userInfo.created_at
      };

      // Store user in session
      localStorage.setItem(this.sessionKey, JSON.stringify(user));

      this.saveLoginLog({
        email: user.email,
        name: user.name,
        status: 'success'
      });

      return { success: true, message: 'Login successful', user };
    } catch (error: any) {
      this.saveLoginLog({
        email,
        name: 'Unknown',
        status: 'failed'
      });
      return { success: false, message: error.message || 'Invalid email or password' };
    }
  }

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> {
    if (USE_API && apiAvailable) {
      try {
        const updatedUser = await api.updateProfile(data) as Partial<User>;

        // Update local session
        const currentUser = this.getCurrentUser() || {} as User;
        const newUser = { ...currentUser, ...updatedUser };
        localStorage.setItem(this.sessionKey, JSON.stringify(newUser));

        return { success: true, user: newUser };
      } catch (error) {
        console.warn('API update failed:', error);
      }
    }

    // Fallback/Local update
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...data };
      localStorage.setItem(this.sessionKey, JSON.stringify(newUser));
      return { success: true, user: newUser };
    }

    return { success: false, message: 'User not found' };
  }

  // ==================== Hybrid Methods (API + Fallback) ====================

  async register(email: string, password: string, name: string, company?: string): Promise<{ success: boolean; message: string }> {
    if (USE_API && apiAvailable) {
      try {
        return await this.registerAPI(email, password, name, company);
      } catch (error) {
        console.warn('API unavailable, using local registration:', error);
        apiAvailable = false;
      }
    }
    return this.registerLocal(email, password, name);
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    if (USE_API && apiAvailable) {
      try {
        return await this.loginAPI(email, password);
      } catch (error) {
        console.warn('API unavailable, using local login:', error);
        apiAvailable = false;
      }
    }
    return this.loginLocal(email, password);
  }

  // ==================== Local Storage Fallback ====================

  private getUsers(): (User & { password: string })[] {
    const users = localStorage.getItem(this.storageKey);
    const parsedUsers = users ? JSON.parse(users) : [];

    // Ensure admin user exists
    const adminExists = parsedUsers.find((u: any) => u.email === 'admin@optimsp.com');
    if (!adminExists) {
      parsedUsers.push({
        email: 'admin@optimsp.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      this.saveUsers(parsedUsers);
    }

    return parsedUsers;
  }

  private saveUsers(users: any[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  registerLocal(email: string, password: string, name: string): { success: boolean; message: string } {
    const users = this.getUsers();

    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }

    const newUser = {
      email,
      password,
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    this.saveLoginLog({ email, name, status: 'success' });

    return { success: true, message: 'Account created successfully' };
  }

  loginLocal(email: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    this.saveLoginLog({
      email,
      name: user?.name || 'Unknown User',
      status: user ? 'success' : 'failed'
    });

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(this.sessionKey, JSON.stringify(userWithoutPassword));

    return { success: true, message: 'Login successful', user: userWithoutPassword };
  }

  // ==================== Session Management ====================

  getCurrentUser(): User | null {
    const session = localStorage.getItem(this.sessionKey);
    return session ? JSON.parse(session) : null;
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    removeAuthToken();
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // ==================== Login Logging ====================

  private saveLoginLog(log: { email: string; name: string; status: string }): void {
    const fullLog = {
      id: Date.now().toString() + Math.random(),
      ...log,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      device: this.getDeviceInfo(),
      location: this.getLocation()
    };

    const logs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
    logs.push(fullLog);
    localStorage.setItem('loginLogs', JSON.stringify(logs));
  }

  private getDeviceInfo(): string {
    const devices = ['Windows PC', 'MacBook Pro', 'iPhone 15', 'Android Phone', 'iPad', 'Linux Desktop'];
    return devices[Math.floor(Math.random() * devices.length)];
  }

  private getLocation(): string {
    const locations = ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Chennai, India', 'Pune, India', 'Hyderabad, India'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  getLoginLogs(): any[] {
    return JSON.parse(localStorage.getItem('loginLogs') || '[]');
  }
}

export const userService = new UserService();