
import { apiClient } from './apiClient';

export const pharmacyService = {
  async getMedicines(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/pharmacy/medicines${query}`);
    return Array.isArray(res) ? res : (res?.medicines ?? res ?? []);
  },

  async addMedicine(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/pharmacy/medicines', data);
  },

  async stockIn(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/pharmacy/stock/in', data);
  },

  async getPrescriptions(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/pharmacy/prescriptions${query}`);
    return Array.isArray(res) ? res : (res?.prescriptions ?? res ?? []);
  },

  async dispensePrescription(prescriptionId: string, data: any): Promise<any> {
    return apiClient.post<any>(`/api/v1/pharmacy/prescriptions/${prescriptionId}/dispense`, data);
  }
};
