
import { apiClient } from './apiClient';

export const notificationService = {
  async getAll(): Promise<any[]> {
    const res = await apiClient.get<any>('/api/v1/notifications');
    return Array.isArray(res) ? res : (res?.notifications ?? res ?? []);
  },

  async markAsRead(id: string): Promise<void> {
    return apiClient.patch<void>(`/api/v1/notifications/${id}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.patch<void>('/api/v1/notifications/read-all', {});
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/notifications/${id}`);
  }
};
