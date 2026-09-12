
import { apiClient } from './apiClient';

export const labService = {
  async getAll(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/laboratory/requests${query}`);
    return Array.isArray(res) ? res : (res?.requests ?? res ?? []);
  },

  async getById(id: string): Promise<any> {
    return apiClient.get<any>(`/api/v1/laboratory/requests/${id}`);
  },

  async createRequest(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/laboratory/requests', data);
  },

  async updateStatus(id: string, sampleStatus: string): Promise<any> {
    return apiClient.patch<any>(`/api/v1/laboratory/requests/${id}/status`, { sampleStatus });
  },

  async enterResults(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/laboratory/results', data);
  }
};
