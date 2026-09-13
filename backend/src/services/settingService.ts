import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';

export class SettingService {
  public static async getSettings() {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          hospitalName: 'MediCore Hospital',
          hospitalAddress: '124 Healthcare Boulevard, Medical District, NY 10001',
          contactNumber: '+1 (555) 234-5678',
          email: 'admin@medicore.hospital',
          workingHours: 'Mon-Sun: 24/7 Emergency | Clinic: 08:00 AM - 08:00 PM',
          sessionTimeout: '30m',
          currency: 'USD',
          timezone: 'America/New_York'
        }
      });
    }
    return settings;
  }

  public static async updateSettings(input: any, currentUserId?: string, currentUserName?: string) {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      await this.getSettings();
      settings = await prisma.systemSetting.findFirst();
    }

    const updated = await prisma.systemSetting.update({
      where: { id: settings!.id },
      data: input
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'SETTINGS',
      recordIdentifier: 'SYSTEM_SETTINGS',
      description: 'Updated system settings'
    });

    return updated;
  }
}
