
import { apiClient } from './apiClient';

export const billingService = {
  async getInvoices(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/billing/invoices${query}`);
    return Array.isArray(res) ? res : (res?.invoices ?? res ?? []);
  },

  async getInvoiceById(id: string): Promise<any> {
    return apiClient.get<any>(`/api/v1/billing/invoices/${id}`);
  },

  async createInvoice(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/billing/invoices', data);
  },

  async getPayments(): Promise<any[]> {
    const res = await apiClient.get<any>('/api/v1/billing/payments');
    return Array.isArray(res) ? res : (res?.payments ?? res ?? []);
  },

  async recordPayment(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/billing/payments', data);
  },

  async getReceipt(paymentId: string): Promise<any> {
    return apiClient.get<any>(`/api/v1/billing/payments/${paymentId}/receipt`);
  }
};
