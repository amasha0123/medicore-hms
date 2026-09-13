import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';

export class AppointmentService {
  private static async generateAppointmentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.appointment.count();
    const nextNum = (count + 1).toString().padStart(6, '0');
    return `APT-${year}-${nextNum}`;
  }

  public static async getAppointments(query: {
    page?: number;
    limit?: number;
    patientId?: string;
    doctorId?: string;
    departmentId?: string;
    department?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.status) where.status = query.status;

    if (query.date) {
      const targetDate = new Date(query.date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.appointmentDate = { gte: startOfDay, lte: endOfDay };
    } else if (query.startDate || query.endDate) {
      where.appointmentDate = {};
      if (query.startDate) where.appointmentDate.gte = new Date(query.startDate);
      if (query.endDate) where.appointmentDate.lte = new Date(query.endDate);
    }

    if (query.search) {
      where.OR = [
        { appointmentId: { contains: query.search } },
        { patient: { fullName: { contains: query.search } } },
        { doctor: { name: { contains: query.search } } },
        { reason: { contains: query.search } }
      ];
    }

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        orderBy: { appointmentDate: 'asc' },
        skip,
        take: limit,
        include: {
          patient: true,
          doctor: { include: { department: true } },
          department: true
        }
      })
    ]);

    const formatted = appointments.map((apt: any) => ({
      id: apt.id,
      appointmentNumber: apt.appointmentId,
      patientId: apt.patientId,
      patientName: apt.patient.fullName,
      patientPhone: apt.patient.phone,
      doctorId: apt.doctorId,
      doctorName: apt.doctor.name,
      department: apt.department?.name || apt.doctor.department?.name || 'General',
      date: apt.appointmentDate.toISOString().split('T')[0],
      time: apt.startTime,
      type: apt.appointmentType,
      status: apt.status,
      reason: apt.reason,
      notes: apt.notes || undefined,
      room: apt.room || apt.doctor.specialization,
      createdAt: apt.createdAt.toISOString()
    }));

    return {
      appointments: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  public static async getCalendarEvents(query: { startDate?: string; endDate?: string; doctorId?: string; departmentId?: string }) {
    const where: any = {};
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.departmentId) where.departmentId = query.departmentId;

    if (query.startDate || query.endDate) {
      where.appointmentDate = {};
      if (query.startDate) where.appointmentDate.gte = new Date(query.startDate);
      if (query.endDate) where.appointmentDate.lte = new Date(query.endDate);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true, doctor: true }
    });

    return appointments.map((apt) => ({
      id: apt.id,
      title: `${apt.patient.fullName} (${apt.appointmentType})`,
      start: `${apt.appointmentDate.toISOString().split('T')[0]}T${apt.startTime}`,
      doctorName: apt.doctor.name,
      patientName: apt.patient.fullName,
      status: apt.status,
      type: apt.appointmentType
    }));
  }

  public static async createAppointment(input: any, currentUserId?: string, currentUserName?: string) {
    // 1. Verify Patient
    const patient = await prisma.patient.findFirst({ where: { id: input.patientId, deletedAt: null } });
    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    // 2. Verify Doctor
    const doctor = await prisma.doctor.findFirst({ where: { id: input.doctorId, deletedAt: null } });
    if (!doctor) {
      throw ApiError.notFound('Doctor not found');
    }

    const rawDate = input.appointmentDate || input.date || new Date().toISOString().split('T')[0];
    const appointmentDate = new Date(rawDate);
    const startTime = input.startTime || input.time || '10:00 AM';
    const appointmentType = input.appointmentType || input.type || 'Routine Consult';
    const reason = input.reason || 'General Consultation';

    // 3. Double-Booking Prevention Check
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingConflict = await prisma.appointment.findFirst({
      where: {
        doctorId: input.doctorId,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        startTime,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
      }
    });

    if (existingConflict) {
      throw ApiError.conflict(`Dr. ${doctor.name} is already booked at ${startTime} on ${appointmentDate.toISOString().split('T')[0]}`);
    }

    const appointmentNumber = await this.generateAppointmentNumber();

    const appointment = await prisma.appointment.create({
      data: {
        appointmentId: appointmentNumber,
        patientId: input.patientId,
        doctorId: input.doctorId,
        departmentId: input.departmentId || doctor.departmentId,
        appointmentDate,
        startTime,
        endTime: input.endTime,
        appointmentType,
        reason,
        notes: input.notes,
        room: input.room || 'Consultation Room 1',
        status: 'SCHEDULED',
        createdBy: currentUserName || 'System'
      },
      include: {
        patient: true,
        doctor: true
      }
    });

    // Create Audit Log
    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'APPOINTMENT',
      recordIdentifier: appointment.appointmentId,
      description: `Scheduled appointment ${appointment.appointmentId} for ${patient.fullName} with ${doctor.name}`
    });

    // Create Notification
    await NotificationService.create({
      title: 'New Appointment Scheduled',
      message: `Appointment ${appointment.appointmentId} scheduled for ${patient.fullName} with Dr. ${doctor.name} at ${input.startTime}`,
      category: 'APPOINTMENT',
      priority: 'Normal'
    });

    return {
      id: appointment.id,
      appointmentNumber: appointment.appointmentId,
      patientId: appointment.patientId,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      doctorId: appointment.doctorId,
      doctorName: doctor.name,
      department: doctor.departmentId,
      date: appointment.appointmentDate.toISOString().split('T')[0],
      time: appointment.startTime,
      type: appointment.appointmentType,
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes || undefined,
      createdAt: appointment.createdAt.toISOString()
    };
  }

  public static async updateStatus(id: string, status: string, currentUserId?: string, currentUserName?: string) {
    const apt = await prisma.appointment.findUnique({ where: { id }, include: { patient: true, doctor: true } });
    if (!apt) {
      throw ApiError.notFound('Appointment not found');
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'APPOINTMENT',
      recordIdentifier: apt.appointmentId,
      description: `Changed appointment status to ${status} for ${apt.appointmentId}`
    });

    return updated;
  }

  public static async reschedule(id: string, input: { appointmentDate: string; startTime: string; endTime?: string; notes?: string }, currentUserId?: string, currentUserName?: string) {
    const apt = await prisma.appointment.findUnique({ where: { id }, include: { doctor: true, patient: true } });
    if (!apt) {
      throw ApiError.notFound('Appointment not found');
    }

    const newDate = new Date(input.appointmentDate);

    // Conflict check
    const startOfDay = new Date(newDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(newDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflict = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        doctorId: apt.doctorId,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        startTime: input.startTime,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
      }
    });

    if (conflict) {
      throw ApiError.conflict(`Dr. ${apt.doctor.name} is already booked at ${input.startTime} on ${newDate.toISOString().split('T')[0]}`);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: newDate,
        startTime: input.startTime,
        endTime: input.endTime || apt.endTime,
        notes: input.notes ? `${apt.notes || ''}\nRescheduled: ${input.notes}` : apt.notes,
        status: 'SCHEDULED'
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'APPOINTMENT',
      recordIdentifier: apt.appointmentId,
      description: `Rescheduled appointment ${apt.appointmentId} to ${input.appointmentDate} at ${input.startTime}`
    });

    return updated;
  }
}
