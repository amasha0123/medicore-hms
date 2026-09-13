
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
    const rawName = (patientData.fullName || patientData.name || '').trim();
    const parts = rawName.split(' ');
    const firstName = patientData.firstName || parts[0] || 'Patient';
    const lastName = patientData.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : 'Record');
    const NIC = patientData.NIC || patientData.nationalId || `NIC-${Date.now().toString().slice(-6)}`;

    const address = typeof patientData.address === 'object'
      ? patientData.address
      : { street: patientData.address || '123 Health Ave', city: 'Metro', province: 'Central' };

    const emergencyContact = patientData.emergencyContact || {
      name: patientData.emergencyName || 'Primary Contact',
      relationship: patientData.emergencyRelationship || 'Family',
      phone: patientData.emergencyPhone || patientData.phone || '+1 555-0100'
    };

    const payload = {
      firstName,
      lastName,
      dateOfBirth: patientData.dateOfBirth || '1990-01-01',
      gender: patientData.gender || 'Male',
      NIC,
      bloodGroup: patientData.bloodGroup || 'O+',
      phone: patientData.phone || '+1 555-0100',
      email: patientData.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@patient.hospital`,
      address,
      emergencyContact,
      allergies: Array.isArray(patientData.allergies) ? patientData.allergies : ['None recorded'],
      chronicConditions: Array.isArray(patientData.chronicConditions) ? patientData.chronicConditions : [],
      status: patientData.status || 'Active',
      primaryDepartment: patientData.primaryDepartment || 'General Medicine',
      assignedDoctorId: patientData.assignedDoctorId
    };

    return apiClient.post<any>('/api/v1/patients', payload);
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
