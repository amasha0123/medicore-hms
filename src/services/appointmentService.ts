
import { Appointment, AppointmentStatus } from '../types/appointment';
import { INITIAL_APPOINTMENTS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';

const APPOINTMENTS_KEY = 'medicore_appointments';

export const appointmentService = {
  getAll(): Appointment[] {
    return getStoredItem<Appointment[]>(APPOINTMENTS_KEY, INITIAL_APPOINTMENTS);
  },

  getById(id: string): Appointment | undefined {
    return this.getAll().find(a => a.id === id || a.appointmentNumber === id);
  },

  create(data: Omit<Appointment, 'id' | 'appointmentNumber' | 'createdAt'>): Appointment {
    const list = this.getAll();
    const nextNum = 40 + list.length + 1;
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now().toString(36)}`,
      appointmentNumber: `APT-2026-00${nextNum}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setStoredItem(APPOINTMENTS_KEY, [newApt, ...list]);

    auditService.log({
      userId: 'staff',
      userName: 'Reception Staff',
      userRole: 'RECEPTIONIST',
      action: 'CREATE',
      module: 'APPOINTMENT',
      recordIdentifier: newApt.appointmentNumber,
      details: `Booked appointment for ${newApt.patientName} with ${newApt.doctorName}`
    });

    return newApt;
  },

  updateStatus(id: string, status: AppointmentStatus): Appointment {
    const list = this.getAll();
    let updated: Appointment | null = null;
    const next = list.map(a => {
      if (a.id === id) {
        updated = { ...a, status };
        return updated;
      }
      return a;
    });
    setStoredItem(APPOINTMENTS_KEY, next);

    if (updated) {
      auditService.log({
        userId: 'staff',
        userName: 'Clinical Staff',
        userRole: 'RECEPTIONIST',
        action: 'UPDATE',
        module: 'APPOINTMENT',
        recordIdentifier: (updated as Appointment).appointmentNumber,
        details: `Updated appointment status to ${status}`
      });
    }

    return updated!;
  }
};
