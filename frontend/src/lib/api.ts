// API Client for Legal Agenda Backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string, fullName: string, role?: 'ADMIN' | 'COLLABORATOR') {
    const data = await this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role }),
    });
    this.setToken(data.access_token);
    return data;
  }

  logout() {
    this.clearToken();
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
