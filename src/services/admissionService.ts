
import { apiClient } from './apiClient';

export const admissionService = {
  async getBeds(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/admissions/beds${query}`);
    return Array.isArray(res) ? res : (res?.beds ?? res ?? []);
  },

  async getWards(): Promise<any[]> {
    const res = await apiClient.get<any>('/api/v1/admissions/wards');
    return Array.isArray(res) ? res : (res?.wards ?? res ?? []);
  },

  async getAdmissions(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/admissions${query}`);
    return Array.isArray(res) ? res : (res?.admissions ?? res ?? []);
  },

  async admitPatient(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/admissions', data);
  },

  async dischargePatient(admissionId: string, data?: any): Promise<any> {
    return apiClient.patch<any>(`/api/v1/admissions/${admissionId}/discharge`, data ?? {});
  },

  async updateBedStatus(bedId: string, status: string): Promise<any> {
    return apiClient.patch<any>(`/api/v1/admissions/beds/${bedId}/status`, { status });
  }
};
