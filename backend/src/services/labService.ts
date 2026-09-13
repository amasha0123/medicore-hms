import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';

export class LabService {
  private static async generateRequestId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.laboratoryRequest.count();
    const nextNum = (count + 1).toString().padStart(6, '0');
    return `LAB-${year}-${nextNum}`;
  }

  public static async getLabRequests(query: { patientId?: string; doctorId?: string; sampleStatus?: string; priority?: string; search?: string }) {
    const where: any = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.sampleStatus) where.sampleStatus = query.sampleStatus;
    if (query.priority) where.priority = query.priority;

    if (query.search) {
      where.OR = [
        { requestId: { contains: query.search } },
        { testName: { contains: query.search } },
        { patient: { fullName: { contains: query.search } } }
      ];
    }

    const requests = await prisma.laboratoryRequest.findMany({
      where,
      orderBy: { requestedDate: 'desc' },
      include: {
        patient: true,
        doctor: true,
        results: true
      }
    });

    return requests.map((req: any) => ({
      id: req.id,
      testCode: req.requestId,
      patientId: req.patientId,
      patientName: req.patient.fullName,
      patientAge: req.patient.age,
      patientGender: req.patient.gender,
      doctorId: req.doctorId,
      doctorName: req.doctor.name,
      testName: req.testName,
      category: req.category,
      requestedDate: req.requestedDate.toISOString().split('T')[0],
      sampleCollectedDate: req.sampleCollectedDate ? req.sampleCollectedDate.toISOString().split('T')[0] : undefined,
      completedDate: req.completedDate ? req.completedDate.toISOString().split('T')[0] : undefined,
      priority: req.priority,
      sampleStatus: req.sampleStatus,
      sampleType: req.sampleType,
      results: req.results ? JSON.parse(req.results.resultsJson) : undefined,
      technicianNotes: req.results?.technicianNotes || undefined,
      pathologistRemarks: req.results?.pathologistRemarks || undefined,
      attachmentName: req.results?.attachmentName || undefined
    }));
  }

  public static async createLabRequest(input: any, currentUserId?: string, currentUserName?: string) {
    const patient = await prisma.patient.findFirst({ where: { id: input.patientId, deletedAt: null } });
    if (!patient) throw ApiError.notFound('Patient not found');

    const doctor = await prisma.doctor.findFirst({ where: { id: input.doctorId, deletedAt: null } });
    if (!doctor) throw ApiError.notFound('Doctor not found');

    const requestId = await this.generateRequestId();

    const labReq = await prisma.laboratoryRequest.create({
      data: {
        requestId,
        patientId: input.patientId,
        doctorId: input.doctorId,
        testName: input.testName,
        category: input.category,
        priority: input.priority || 'Normal',
        sampleType: input.sampleType,
        sampleStatus: 'Requested',
        notes: input.notes
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'LABORATORY',
      recordIdentifier: labReq.requestId,
      description: `Requested lab test ${labReq.testName} for ${patient.fullName}`
    });

    return labReq;
  }

  public static async updateStatus(id: string, status: string, currentUserId?: string, currentUserName?: string) {
    const req = await prisma.laboratoryRequest.findUnique({ where: { id } });
    if (!req) throw ApiError.notFound('Laboratory request not found');

    const updateData: any = { sampleStatus: status };
    if (status === 'Sample Collected' && !req.sampleCollectedDate) {
      updateData.sampleCollectedDate = new Date();
    }
    if (status === 'Completed' && !req.completedDate) {
      updateData.completedDate = new Date();
    }

    const updated = await prisma.laboratoryRequest.update({
      where: { id },
      data: updateData
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'LABORATORY',
      recordIdentifier: req.requestId,
      description: `Updated lab test status to ${status}`
    });

    return updated;
  }

  public static async enterResults(input: any, currentUserId?: string, currentUserName?: string) {
    const req = await prisma.laboratoryRequest.findUnique({
      where: { id: input.requestId },
      include: { patient: true }
    });

    if (!req) throw ApiError.notFound('Laboratory request not found');

    const resultsJson = JSON.stringify(input.results);

    const result = await prisma.laboratoryResult.create({
      data: {
        requestId: input.requestId,
        patientId: req.patientId,
        testName: req.testName,
        resultsJson,
        technicianNotes: input.technicianNotes,
        pathologistRemarks: input.pathologistRemarks,
        attachmentName: input.attachmentName,
        performedBy: input.performedBy || currentUserName || 'Lab Technician'
      }
    });

    // Mark lab request as completed
    await prisma.laboratoryRequest.update({
      where: { id: input.requestId },
      data: {
        sampleStatus: 'Completed',
        completedDate: new Date()
      }
    });

    // Audit and notify
    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'LABORATORY',
      recordIdentifier: req.requestId,
      description: `Entered laboratory results for test ${req.testName} (${req.patient.fullName})`
    });

    await NotificationService.create({
      title: 'Lab Results Ready',
      message: `Laboratory test results for ${req.testName} (${req.patient.fullName}) are now available.`,
      category: 'LABORATORY',
      priority: req.priority === 'Critical' ? 'Critical' : 'Normal'
    });

    return result;
  }
}
