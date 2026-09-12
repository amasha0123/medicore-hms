
import { apiClient } from './apiClient';

export const staffService = {
  async getAllStaff(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/staff/employees${query}`);
    return Array.isArray(res) ? res : (res?.employees ?? res ?? []);
  },

  async createEmployee(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/staff/employees', data);
  },

  async getAttendance(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/staff/attendance${query}`);
    return Array.isArray(res) ? res : (res?.attendance ?? res ?? []);
  },

  async checkIn(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/staff/attendance/check-in', data);
  },

  async checkOut(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/staff/attendance/check-out', data);
  },

  async getLeaveRequests(params?: Record<string, string>): Promise<any[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await apiClient.get<any>(`/api/v1/staff/leave${query}`);
    return Array.isArray(res) ? res : (res?.leaveRequests ?? res ?? []);
  },

  async createLeaveRequest(data: any): Promise<any> {
    return apiClient.post<any>('/api/v1/staff/leave', data);
  },

  async updateLeaveStatus(leaveId: string, status: string, approverName: string): Promise<any> {
    return apiClient.patch<any>(`/api/v1/staff/leave/${leaveId}/approve`, { status, approverName });
  }
};
