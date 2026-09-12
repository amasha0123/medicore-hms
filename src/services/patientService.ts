
import { apiClient } from './apiClient';

export const patientService = {
  async getAll(params?: Record<string, string>): Promise<any> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/patients${query}`);
    // Backend returns { patients, pagination } wrapped in data
    return Array.isArray(res) ? res : (res?.patients ?? res ?? []);
  },

  async getById(id: string): Promise<any> {
    return apiClient.get<any>(`/api/v1/patients/${id}`);
  },

  async create(patientData: any): Promise<any> {
    return apiClient.post<any>('/api/v1/patients', patientData);
  },

  async update(id: string, updates: any): Promise<any> {
    return apiClient.put<any>(`/api/v1/patients/${id}`, updates);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/patients/${id}`);
  },

  async getMedicalHistory(id: string): Promise<any> {
    return apiClient.get<any>(`/api/v1/patients/${id}/medical-history`);
  }
};
