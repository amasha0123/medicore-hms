
export type NotificationPriority = 'Normal' | 'Urgent' | 'Critical';
export type NotificationCategory = 'Appointment' | 'Laboratory' | 'Pharmacy' | 'Billing' | 'Admission' | 'System';

export interface Notification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: string;
  isRead: boolean;
  linkUrl?: string;
}
