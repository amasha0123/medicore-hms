
import { apiClient } from './apiClient';

export const emrService = {
  async getAll(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/medical-records${query}`);
    return Array.isArray(res) ? res : (res?.records ?? res ?? []);
  },

  async getByPatientId(patientId: string): Promise<any[]> {
    const res = await apiClient.get<any>(`/api/v1/medical-records?patientId=${patientId}`);
    return Array.isArray(res) ? res : (res?.records ?? res ?? []);
  },

  async getById(id: string): Promise<any> {
    return apiClient.get<any>(`/api/v1/medical-records/${id}`);
  },

  async create(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/medical-records', data);
  }
};
