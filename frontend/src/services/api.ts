const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setAuthToken(data.access_token);
    return data;
  },

  register: async (data: { email: string; password: string; name: string; company?: string }) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/api/auth/me');
  },

  updateProfile: async (data: any) => {
    return apiRequest('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout: () => {
    removeAuthToken();
  },

  sendChatMessage: async (message: string, conversationId?: string) => {
    return apiRequest<{ response: string; conversation_id: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
  },

  getChatHistory: async (conversationId: string) => {
    return apiRequest(`/api/chat/history/${conversationId}`);
  },

  getDashboardMetrics: async () => {
    return apiRequest('/api/dashboard');
  },

  getRevenueTrend: async () => {
    return apiRequest('/api/dashboard/revenue-trend');
  },

  getTeamMembers: async (department?: string) => {
    const params = department ? `?department=${department}` : '';
    return apiRequest(`/api/team${params}`);
  },

  createTeamMember: async (member: any) => {
    return apiRequest('/api/team', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  },

  updateTeamMember: async (id: string, data: any) => {
    return apiRequest(`/api/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTeamMember: async (id: string) => {
    return apiRequest(`/api/team/${id}`, { method: 'DELETE' });
  },

  getClients: async () => {
    return apiRequest('/api/clients');
  },

  getClient: async (id: string) => {
    return apiRequest(`/api/clients/${id}`);
  },

  createClient: async (client: any) => {
    return apiRequest('/api/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  },

  getAnomalies: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiRequest(`/api/anomalies${params}`);
  },

  resolveAnomaly: async (id: string, notes?: string) => {
    return apiRequest(`/api/anomalies/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolution_notes: notes }),
    });
  },
};

export default api;
