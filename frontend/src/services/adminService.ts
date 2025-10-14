import api from './api';
import type { User } from '../types';

export interface AdminUserPayload {
  name: string;
  email: string;
  password?: string;
  age?: number;
  role?: 'admin' | 'user';
}

export interface DailyAnalyticsEntry {
  day: string;
  dailyActiveUsers: number;
  completedExercises: number;
  abortedExercises: number;
}

export interface DailyAnalyticsResponse {
  from: string;
  to: string;
  range: number;
  data: DailyAnalyticsEntry[];
}

export const adminApi = {
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },
  async createUser(payload: AdminUserPayload): Promise<User> {
    const response = await api.post<User>('/admin/users', payload);
    return response.data;
  },
  async updateUser(id: string, payload: AdminUserPayload): Promise<User> {
    const response = await api.put<User>(`/admin/users/${id}`, payload);
    return response.data;
  },
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },
  async getDailyAnalytics(params: { from?: string; to?: string; range?: number } = {}): Promise<DailyAnalyticsResponse> {
    const response = await api.get<DailyAnalyticsResponse>('/admin/analytics/daily', { params });
    return response.data;
  },
};
