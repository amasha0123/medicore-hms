import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';

export class OutpatientService {
  private static async generateQueueNumber(): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const countToday = await prisma.outpatientQueue.count({
      where: {
        createdAt: { gte: today }
      }
    });

    const nextNum = (countToday + 101).toString();
    return `Q-${nextNum}`;
  }

  public static async getQueue(query: { doctorId?: string; status?: string; departmentId?: string }) {
    const where: any = {};
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;

    const queue = await prisma.outpatientQueue.findMany({
      where,
      orderBy: { arrivalTime: 'asc' },
      include: {
        patient: true,
        doctor: { include: { department: true } },
        department: true
      }
    });

    return queue.map((q: any) => ({
      id: q.id,
      queueNumber: q.queueNumber,
      patientId: q.patientId,
      patientName: q.patient.fullName,
      doctorId: q.doctorId,
      doctorName: q.doctor.name,
      department: q.department?.name || q.doctor.department?.name || 'Outpatient',
      arrivalTime: q.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: q.priority,
      status: q.status,
      consultationStartTime: q.consultationStartTime ? q.consultationStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      notes: q.notes || undefined
    }));
  }

  public static async addToQueue(input: any, currentUserId?: string, currentUserName?: string) {
    const patient = await prisma.patient.findFirst({ where: { id: input.patientId, deletedAt: null } });
    if (!patient) throw ApiError.notFound('Patient not found');

    const doctor = await prisma.doctor.findFirst({ where: { id: input.doctorId, deletedAt: null } });
    if (!doctor) throw ApiError.notFound('Doctor not found');

    const queueNumber = await this.generateQueueNumber();

    const queueItem = await prisma.outpatientQueue.create({
      data: {
        queueNumber,
        patientId: input.patientId,
        doctorId: input.doctorId,
        departmentId: input.departmentId || doctor.departmentId,
        arrivalTime: new Date(),
        priority: input.priority || 'Normal',
        status: 'Waiting',
        notes: input.notes
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'OUTPATIENT',
      recordIdentifier: queueItem.queueNumber,
      description: `Added patient ${patient.fullName} to outpatient queue ticket ${queueItem.queueNumber}`
    });

    return queueItem;
  }

  public static async updateStatus(id: string, status: string, currentUserId?: string, currentUserName?: string) {
    const queueItem = await prisma.outpatientQueue.findUnique({ where: { id } });
    if (!queueItem) throw ApiError.notFound('Queue ticket not found');

    const updateData: any = { status };
    if (status === 'In Consultation' && !queueItem.consultationStartTime) {
      updateData.consultationStartTime = new Date();
    }

    const updated = await prisma.outpatientQueue.update({
      where: { id },
      data: updateData
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'OUTPATIENT',
      recordIdentifier: queueItem.queueNumber,
      description: `Updated queue ticket ${queueItem.queueNumber} status to ${status}`
    });

    return updated;
  }
}
