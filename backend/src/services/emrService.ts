import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';

export class EMRService {
  private static async generateRecordNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.medicalRecord.count();
    const nextNum = (count + 1).toString().padStart(6, '0');
    return `EMR-${year}-${nextNum}`;
  }

  public static async getMedicalRecords(query: { patientId?: string; doctorId?: string; search?: string }) {
    const where: any = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.doctorId) where.doctorId = query.doctorId;

    if (query.search) {
      where.OR = [
        { recordNumber: { contains: query.search } },
        { chiefComplaint: { contains: query.search } },
        { diagnosis: { contains: query.search } },
        { diagnosisCode: { contains: query.search } }
      ];
    }

    const records = await prisma.medicalRecord.findMany({
      where,
      orderBy: { visitDate: 'desc' },
      include: {
        patient: true,
        doctor: true,
        prescriptions: { include: { items: true } }
      }
    });

    return records.map((r: any) => ({
      id: r.id,
      recordNumber: r.recordNumber,
      patientId: r.patientId,
      patientName: r.patient.fullName,
      patientAge: r.patient.age,
      patientGender: r.patient.gender,
      doctorId: r.doctorId,
      doctorName: r.doctor.name,
      visitDate: r.visitDate.toISOString().split('T')[0],
      chiefComplaint: r.chiefComplaint,
      symptoms: r.symptoms,
      diagnosis: r.diagnosis,
      diagnosisCode: r.diagnosisCode || 'ICD-10-Z00.0',
      vitals: {
        bloodPressure: r.bloodPressure || '120/80',
        heartRate: r.heartRate || 72,
        temperature: r.temperature ? Number(r.temperature) : 36.6,
        respiratoryRate: r.respiratoryRate || 16,
        oxygenSaturation: r.oxygenSaturation || 98,
        weightKg: r.weight ? Number(r.weight) : 70,
        heightCm: r.height ? Number(r.height) : 175,
        recordedAt: r.visitDate.toISOString().split('T')[0]
      },
      treatmentPlan: r.treatment,
      notes: r.notes || undefined,
      prescriptionsCount: r.prescriptions.length
    }));
  }

  public static async getMedicalRecordById(id: string) {
    const r = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        prescriptions: { include: { items: true } }
      }
    });

    if (!r) {
      throw ApiError.notFound('Medical record not found');
    }

    return {
      id: r.id,
      recordNumber: r.recordNumber,
      patientId: r.patientId,
      patientName: r.patient.fullName,
      patientAge: r.patient.age,
      patientGender: r.patient.gender,
      doctorId: r.doctorId,
      doctorName: r.doctor.name,
      visitDate: r.visitDate.toISOString().split('T')[0],
      chiefComplaint: r.chiefComplaint,
      symptoms: r.symptoms,
      diagnosis: r.diagnosis,
      diagnosisCode: r.diagnosisCode || 'ICD-10-Z00.0',
      vitals: {
        bloodPressure: r.bloodPressure || '120/80',
        heartRate: r.heartRate || 72,
        temperature: r.temperature ? Number(r.temperature) : 36.6,
        respiratoryRate: r.respiratoryRate || 16,
        oxygenSaturation: r.oxygenSaturation || 98,
        weightKg: r.weight ? Number(r.weight) : 70,
        heightCm: r.height ? Number(r.height) : 175,
        recordedAt: r.visitDate.toISOString().split('T')[0]
      },
      treatmentPlan: r.treatment,
      notes: r.notes || undefined
    };
  }

  public static async createMedicalRecord(input: any, currentUserId?: string, currentUserName?: string) {
    const recordNumber = await this.generateRecordNumber();

    const record = await prisma.medicalRecord.create({
      data: {
        recordNumber,
        patientId: input.patientId,
        doctorId: input.doctorId,
        appointmentId: input.appointmentId,
        visitDate: input.visitDate ? new Date(input.visitDate) : new Date(),
        chiefComplaint: input.chiefComplaint,
        symptoms: input.symptoms,
        diagnosis: input.diagnosis,
        diagnosisCode: input.diagnosisCode || 'ICD-10-Z00.0',
        bloodPressure: input.bloodPressure,
        heartRate: input.heartRate,
        temperature: input.temperature,
        respiratoryRate: input.respiratoryRate,
        oxygenSaturation: input.oxygenSaturation,
        weight: input.weight,
        height: input.height,
        treatment: input.treatment,
        notes: input.notes
      }
    });

    // Update patient last visit
    await prisma.patient.update({
      where: { id: input.patientId },
      data: { lastVisit: new Date() }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'EMR',
      recordIdentifier: record.recordNumber,
      description: `Created electronic medical record ${record.recordNumber} for patient ${input.patientId}`
    });

    return this.getMedicalRecordById(record.id);
  }
}
