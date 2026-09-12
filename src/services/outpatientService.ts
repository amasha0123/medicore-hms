
import { apiClient } from './apiClient';

export const outpatientService = {
  async getQueue(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/outpatients/queue${query}`);
    return Array.isArray(res) ? res : (res?.queue ?? res ?? []);
  },

  async addToQueue(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/outpatients/queue', data);
  },

  async updateStatus(id: string, status: string): Promise<any> {
    return apiClient.patch<any>(`/api/v1/outpatients/queue/${id}/status`, { status });
  }
};
