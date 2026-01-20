// API Client for Legal Agenda Backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: any;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      localStorage.setItem('access_token', data.access_token);
      return true;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Si 401 et qu'on peut retry, essayer de refresh le token
      if (response.status === 401 && retry) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, false);
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      // Si c'est une erreur réseau (Failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      }
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setTokens(data.access_token, data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async register(email: string, password: string, fullName: string, role?: 'ADMIN' | 'COLLABORATEUR') {
    const data = await this.request<AuthTokens>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role }),
    });
    this.setTokens(data.access_token, data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Cases
  async getCases(status?: string) {
    return this.request<any[]>(`/cases${status ? `?status=${status}` : ''}`);
  }

  async getCase(id: string) {
    return this.request<any>(`/cases/${id}`);
  }

  async createCase(data: any) {
    return this.request<any>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCase(id: string, data: any) {
    return this.request<any>(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCase(id: string) {
    return this.request<any>(`/cases/${id}`, {
      method: 'DELETE',
    });
  }

  async getCaseStats() {
    return this.request<any>('/cases/stats');
  }

  // Hearings
  async getHearings(params?: { status?: string; caseId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/hearings${query ? `?${query}` : ''}`);
  }

  async getHearing(id: string) {
    return this.request<any>(`/hearings/${id}`);
  }

  async createHearing(data: any) {
    return this.request<any>('/hearings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHearing(id: string, data: any) {
    return this.request<any>(`/hearings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteHearing(id: string) {
    return this.request<any>(`/hearings/${id}`, {
      method: 'DELETE',
    });
  }

  async recordHearingResult(id: string, data: any) {
    return this.request<any>(`/hearings/${id}/result`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUnreportedHearings() {
    return this.request<any[]>('/hearings/unreported');
  }

  async getTomorrowHearings() {
    return this.request<any[]>('/hearings/tomorrow');
  }

  async getCalendar(month?: string, year?: string) {
    const query = new URLSearchParams({ ...(month && { month }), ...(year && { year }) }).toString();
    return this.request<any[]>(`/hearings/calendar${query ? `?${query}` : ''}`);
  }

  // Users
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Audit
  async getAuditLogs(limit?: number) {
    return this.request<any[]>(`/audit${limit ? `?limit=${limit}` : ''}`);
  }

  async getEntityAuditLogs(type: string, id: string) {
    return this.request<any[]>(`/audit/entity?type=${type}&id=${id}`);
  }
}

export const api = new ApiClient();
