
import { Notification } from '../types/notification';
import { INITIAL_NOTIFICATIONS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';

const NOTIF_KEY = 'medicore_notifications';

export const notificationService = {
  getAll(): Notification[] {
    return getStoredItem<Notification[]>(NOTIF_KEY, INITIAL_NOTIFICATIONS);
  },

  markAsRead(id: string): void {
    const list = this.getAll();
    setStoredItem(NOTIF_KEY, list.map(n => n.id === id ? { ...n, isRead: true } : n));
  },

  markAllAsRead(): void {
    const list = this.getAll();
    setStoredItem(NOTIF_KEY, list.map(n => ({ ...n, isRead: true })));
  }
};
