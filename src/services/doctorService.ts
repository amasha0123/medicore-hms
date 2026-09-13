
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
    const rawName = (data.name || '').replace(/^Dr\.?\s*/i, '').trim();
    const parts = rawName.split(' ');
    const firstName = data.firstName || parts[0] || 'Doctor';
    const lastName = data.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : 'Specialist');
    const registrationNumber = data.registrationNumber || data.licenseNumber || `REG-${Date.now().toString().slice(-6)}`;

    let departmentId = data.departmentId;
    if (!departmentId) {
      try {
        const res = await apiClient.get<any>('/api/v1/departments');
        const deptList = Array.isArray(res) ? res : (res?.departments ?? res ?? []);
        const matched = deptList.find((d: any) =>
          (d.name && data.department && d.name.toLowerCase() === data.department.toLowerCase()) ||
          (d.id && data.department && d.id === data.department)
        );
        departmentId = matched ? matched.id : deptList[0]?.id;
      } catch {
        // Fallback
      }
    }

    const payload = {
      firstName,
      lastName,
      registrationNumber,
      specialization: data.specialization || 'General Medicine',
      departmentId,
      phone: data.phone || '+1 555-0100',
      email: data.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@medicore.hospital`,
      experienceYears: Number(data.experienceYears) || 5,
      consultationFee: Number(data.consultationFee) || 100,
      status: data.status || 'Available'
    };

    return apiClient.post<any>('/api/v1/doctors', payload);
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
