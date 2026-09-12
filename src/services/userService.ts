import { apiClient, IS_MOCK_MODE } from './apiClient';
import { authService } from './authService';
import { UserRole } from '../types/auth';

export interface ApiUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  role: UserRole | 'UNASSIGNED';
  department: string;
  departmentId?: string;
  avatar?: string;
  status: 'Active' | 'Inactive';
  accountStatus: 'PENDING' | 'ACTIVE' | 'REJECTED';
  lastLogin?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export const userService = {
  async getUsers(params?: { role?: string; status?: string; accountStatus?: string; search?: string }): Promise<ApiUser[]> {
    if (IS_MOCK_MODE) {
      const mockUsers = authService.getAllUsers();
      return mockUsers.map(u => ({
        id: u.id,
        name: u.name,
        firstName: u.name.split(' ')[0] || '',
        lastName: u.name.split(' ').slice(1).join(' ') || '',
        email: u.email,
        username: u.username || u.email.split('@')[0],
        phone: u.phone,
        role: u.role,
        department: u.department,
        status: u.status,
        accountStatus: u.status === 'Inactive' ? 'PENDING' : 'ACTIVE',
        lastLogin: u.lastLogin,
        createdAt: u.createdAt
      }));
    }

    try {
      const query = new URLSearchParams();
      if (params?.role) query.append('role', params.role);
      if (params?.status) query.append('status', params.status);
      if (params?.accountStatus) query.append('accountStatus', params.accountStatus);
      if (params?.search) query.append('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get<ApiUser[]>(`/api/v1/users${qs}`);
    } catch {
      // Graceful fallback to mock data if API fails or session not ready
      const mockUsers = authService.getAllUsers();
      return mockUsers.map(u => ({
        id: u.id,
        name: u.name,
        firstName: u.name.split(' ')[0] || '',
        lastName: u.name.split(' ').slice(1).join(' ') || '',
        email: u.email,
        username: u.username || u.email.split('@')[0],
        phone: u.phone,
        role: u.role,
        department: u.department,
        status: u.status,
        accountStatus: u.status === 'Inactive' ? 'PENDING' : 'ACTIVE',
        lastLogin: u.lastLogin,
        createdAt: u.createdAt
      }));
    }
  },

  async approveUser(id: string, data: { role: string; departmentId?: string }): Promise<ApiUser> {
    if (IS_MOCK_MODE) {
      const updated = authService.updateUser(id, {
        role: data.role as UserRole,
        status: 'Active'
      });
      return {
        id: updated.id,
        name: updated.name,
        firstName: updated.name.split(' ')[0] || '',
        lastName: updated.name.split(' ').slice(1).join(' ') || '',
        email: updated.email,
        username: updated.username || updated.email.split('@')[0],
        phone: updated.phone,
        role: updated.role,
        department: updated.department,
        status: 'Active',
        accountStatus: 'ACTIVE',
        lastLogin: updated.lastLogin,
        createdAt: updated.createdAt
      };
    }
    return apiClient.patch<ApiUser>(`/api/v1/users/${id}/approve`, data);
  },

  async rejectUser(id: string): Promise<ApiUser> {
    if (IS_MOCK_MODE) {
      const updated = authService.updateUser(id, { status: 'Inactive' });
      return {
        id: updated.id,
        name: updated.name,
        firstName: updated.name.split(' ')[0] || '',
        lastName: updated.name.split(' ').slice(1).join(' ') || '',
        email: updated.email,
        username: updated.username || updated.email.split('@')[0],
        phone: updated.phone,
        role: updated.role,
        department: updated.department,
        status: 'Inactive',
        accountStatus: 'REJECTED',
        lastLogin: updated.lastLogin,
        createdAt: updated.createdAt
      };
    }
    return apiClient.patch<ApiUser>(`/api/v1/users/${id}/reject`, {});
  },

  async toggleStatus(id: string, isActive: boolean): Promise<ApiUser> {
    if (IS_MOCK_MODE) {
      const updated = authService.updateUser(id, { status: isActive ? 'Active' : 'Inactive' });
      return {
        id: updated.id,
        name: updated.name,
        firstName: updated.name.split(' ')[0] || '',
        lastName: updated.name.split(' ').slice(1).join(' ') || '',
        email: updated.email,
        username: updated.username || updated.email.split('@')[0],
        phone: updated.phone,
        role: updated.role,
        department: updated.department,
        status: isActive ? 'Active' : 'Inactive',
        accountStatus: isActive ? 'ACTIVE' : 'PENDING',
        lastLogin: updated.lastLogin,
        createdAt: updated.createdAt
      };
    }
    return apiClient.patch<ApiUser>(`/api/v1/users/${id}/status`, { isActive });
  },

  async resetPassword(id: string, newPassword?: string): Promise<any> {
    if (IS_MOCK_MODE) {
      return { message: 'Password reset successfully' };
    }
    return apiClient.post(`/api/v1/users/${id}/reset-password`, {
      password: newPassword || 'MediCore@2026!'
    });
  },

  async getDepartments(): Promise<Department[]> {
    if (IS_MOCK_MODE) {
      return [
        { id: '1', name: 'Cardiology', code: 'CARD' },
        { id: '2', name: 'General Medicine', code: 'GEN' },
        { id: '3', name: 'Pediatrics', code: 'PEDS' },
        { id: '4', name: 'Neurology', code: 'NEUR' },
        { id: '5', name: 'Pharmacy', code: 'PHAR' },
        { id: '6', name: 'Orthopedics', code: 'ORTH' },
        { id: '7', name: 'Laboratory Services', code: 'LAB' }
      ];
    }
    try {
      return await apiClient.get<Department[]>('/api/v1/departments');
    } catch {
      return [
        { id: '1', name: 'Cardiology', code: 'CARD' },
        { id: '2', name: 'General Medicine', code: 'GEN' },
        { id: '3', name: 'Pediatrics', code: 'PEDS' },
        { id: '4', name: 'Neurology', code: 'NEUR' },
        { id: '5', name: 'Pharmacy', code: 'PHAR' },
        { id: '6', name: 'Orthopedics', code: 'ORTH' },
        { id: '7', name: 'Laboratory Services', code: 'LAB' }
      ];
    }
  }
};
