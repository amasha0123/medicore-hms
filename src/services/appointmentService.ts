
import { apiClient } from './apiClient';

export const appointmentService = {
  async getAll(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/appointments${query}`);
    return Array.isArray(res) ? res : (res?.appointments ?? res ?? []);
  },

  async getCalendarEvents(): Promise<any[]> {
    const res = await apiClient.get<any>('/api/v1/appointments/calendar');
    return Array.isArray(res) ? res : (res?.events ?? res ?? []);
  },

  async create(data: any): Promise<any> {
    const payload = {
      patientId: data.patientId,
      doctorId: data.doctorId,
      departmentId: data.departmentId,
      appointmentDate: data.appointmentDate || data.date || new Date().toISOString().split('T')[0],
      startTime: data.startTime || data.time || '10:00 AM',
      endTime: data.endTime,
      appointmentType: data.appointmentType || data.type || 'Routine Consult',
      reason: data.reason || 'General Consultation',
      notes: data.notes,
      room: data.room || 'Consultation Room 1'
    };
    return apiClient.post<any>('/api/v1/appointments', payload);
  },

  async updateStatus(id: string, status: string): Promise<any> {
    return apiClient.patch<any>(`/api/v1/appointments/${id}/status`, { status });
  },

  async reschedule(id: string, data: any): Promise<any> {
    return apiClient.patch<any>(`/api/v1/appointments/${id}/reschedule`, data);
  },

  async cancel(id: string): Promise<any> {
    return apiClient.patch<any>(`/api/v1/appointments/${id}/cancel`, {});
  }
};
