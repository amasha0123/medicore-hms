
import { apiClient } from './apiClient';

export const doctorService = {
  async getAll(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/doctors${query}`);
    return Array.isArray(res) ? res : (res?.doctors ?? res ?? []);
  },

  async getById(id: string): Promise<any> {
    return apiClient.get<any>(`/api/v1/doctors/${id}`);
  },

  async getDepartments(): Promise<string[]> {
    const res = await apiClient.get<any>('/api/v1/departments');
    const depts = Array.isArray(res) ? res : (res?.departments ?? res ?? []);
    return depts.map((d: any) => (typeof d === 'string' ? d : d.name));
  },

  async create(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/doctors', data);
  },

  async update(id: string, data: any): Promise<any> {
    return apiClient.put<any>(`/api/v1/doctors/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/doctors/${id}`);
  },

  async updateSchedule(id: string, schedule: any): Promise<any> {
    return apiClient.put<any>(`/api/v1/doctors/${id}/schedule`, schedule);
  }
};
