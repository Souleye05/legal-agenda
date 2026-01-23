// API Client for Legal Agenda Backend

import type {
  User,
  AuthResponse,
  RefreshTokenResponse,
  Case,
  Hearing,
  AuditLog,
  DashboardStats,
  CreateCaseDto,
  UpdateCaseDto,
  CreateHearingDto,
  UpdateHearingDto,
  RecordHearingResultDto,
  LoginDto,
  RegisterDto,
} from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: User;
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

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth
  async login(email: string, password: string): Promise<AuthTokens> {
    const data = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setTokens(data.access_token, data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async register(email: string, password: string, fullName: string): Promise<any> {
    const data = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
    
    // Only set tokens if user is auto-logged in (first user)
    if (data.access_token) {
      this.setTokens(data.access_token, data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Cases
  async getCases(status?: string): Promise<Case[]> {
    return this.request<Case[]>(`/cases${status ? `?status=${status}` : ''}`);
  }

  async getCase(id: string): Promise<Case> {
    return this.request<Case>(`/cases/${id}`);
  }

  async createCase(data: CreateCaseDto): Promise<Case> {
    return this.request<Case>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCase(id: string, data: UpdateCaseDto): Promise<Case> {
    return this.request<Case>(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCase(id: string): Promise<void> {
    return this.request<void>(`/cases/${id}`, {
      method: 'DELETE',
    });
  }

  async getCaseStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/cases/stats');
  }

  // Hearings
  async getHearings(params?: { status?: string; caseId?: string }): Promise<Hearing[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Hearing[]>(`/hearings${query ? `?${query}` : ''}`);
  }

  async getHearing(id: string): Promise<Hearing> {
    return this.request<Hearing>(`/hearings/${id}`);
  }

  async createHearing(data: CreateHearingDto): Promise<Hearing> {
    return this.request<Hearing>('/hearings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHearing(id: string, data: UpdateHearingDto): Promise<Hearing> {
    return this.request<Hearing>(`/hearings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteHearing(id: string): Promise<void> {
    return this.request<void>(`/hearings/${id}`, {
      method: 'DELETE',
    });
  }

  async recordHearingResult(id: string, data: RecordHearingResultDto): Promise<Hearing> {
    return this.request<Hearing>(`/hearings/${id}/result`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUnreportedHearings(): Promise<Hearing[]> {
    return this.request<Hearing[]>('/hearings/unreported');
  }

  async getTomorrowHearings(): Promise<Hearing[]> {
    return this.request<Hearing[]>('/hearings/tomorrow');
  }

  async getCalendar(month?: string, year?: string): Promise<Hearing[]> {
    const query = new URLSearchParams({ ...(month && { month }), ...(year && { year }) }).toString();
    return this.request<Hearing[]>(`/hearings/calendar${query ? `?${query}` : ''}`);
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateUserStatus(id: string, estActif: boolean): Promise<User> {
    return this.request<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estActif }),
    });
  }

  async updateUserRole(id: string, role: 'ADMIN' | 'COLLABORATEUR'): Promise<User> {
    return this.request<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // Audit
  async getAuditLogs(limit?: number): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(`/audit${limit ? `?limit=${limit}` : ''}`);
  }

  async getEntityAuditLogs(type: string, id: string): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(`/audit/entity?type=${type}&id=${id}`);
  }
}

export const api = new ApiClient();
