import { prisma } from '../config/prisma';

export interface CreateNotificationInput {
  userId?: string;
  title: string;
  message: string;
  category: 'APPOINTMENT' | 'LABORATORY' | 'PHARMACY' | 'BILLING' | 'ADMISSION' | 'SYSTEM' | 'PATIENT';
  priority?: 'Normal' | 'Urgent' | 'Critical';
  linkUrl?: string;
}

export class NotificationService {
  public static async create(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        category: input.category,
        priority: input.priority || 'Normal',
        linkUrl: input.linkUrl,
        isRead: false
      }
    });
  }

  public static async getUserNotifications(userId?: string) {
    return prisma.notification.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  public static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  public static async markAllAsRead(userId?: string) {
    return prisma.notification.updateMany({
      where: userId ? { userId, isRead: false } : { isRead: false },
      data: { isRead: true }
    });
  }

  public static async delete(id: string) {
    return prisma.notification.delete({
      where: { id }
    });
  }
}
