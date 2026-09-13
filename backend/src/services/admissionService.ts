import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';

export class AdmissionService {
  private static async generateAdmissionNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.admission.count();
    const nextNum = (count + 1).toString().padStart(6, '0');
    return `ADM-${year}-${nextNum}`;
  }

  public static async getWards() {
    const wards = await prisma.ward.findMany({
      include: { beds: true }
    });

    return wards.map((w: any) => ({
      id: w.id,
      wardName: w.wardName,
      description: w.description,
      dailyRate: Number(w.dailyRate),
      totalBeds: w.beds.length,
      availableBeds: w.beds.filter((b: any) => b.status === 'Available').length,
      occupiedBeds: w.beds.filter((b: any) => b.status === 'Occupied').length
    }));
  }

  public static async getBeds(query: { wardId?: string; status?: string }) {
    const where: any = {};
    if (query.wardId) where.wardId = query.wardId;
    if (query.status) where.status = query.status;

    const beds = await prisma.bed.findMany({
      where,
      include: { ward: true }
    });

    return beds.map((b: any) => ({
      id: b.id,
      bedNumber: b.bedNumber,
      roomNumber: b.roomNumber,
      ward: b.wardName,
      status: b.status,
      dailyRate: Number(b.dailyRate),
      currentPatientId: b.currentPatientId || undefined
    }));
  }

  public static async updateBedStatus(bedId: string, status: string, currentUserId?: string, currentUserName?: string) {
    const bed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed) throw ApiError.notFound('Bed not found');

    const updated = await prisma.bed.update({
      where: { id: bedId },
      data: { status }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'ADMISSIONS',
      recordIdentifier: bed.bedNumber,
      description: `Updated status of bed ${bed.bedNumber} to ${status}`
    });

    return updated;
  }

  public static async getAdmissions(query: { patientId?: string; status?: string; search?: string }) {
    const where: any = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { admissionNumber: { contains: query.search } },
        { patient: { fullName: { contains: query.search } } }
      ];
    }

    const admissions = await prisma.admission.findMany({
      where,
      orderBy: { admissionDate: 'desc' },
      include: {
        patient: true,
        attendingDoctor: true,
        ward: true,
        bed: true
      }
    });

    return admissions.map((adm: any) => ({
      id: adm.id,
      admissionNumber: adm.admissionNumber,
      patientId: adm.patientId,
      patientName: adm.patient.fullName,
      patientAge: adm.patient.age,
      patientGender: adm.patient.gender,
      ward: adm.ward.wardName,
      roomNumber: adm.bed.roomNumber,
      bedNumber: adm.bed.bedNumber,
      attendingDoctorId: adm.attendingDoctorId,
      attendingDoctorName: adm.attendingDoctor.name,
      admissionDate: adm.admissionDate.toISOString().split('T')[0],
      expectedDischargeDate: adm.expectedDischargeDate ? adm.expectedDischargeDate.toISOString().split('T')[0] : undefined,
      actualDischargeDate: adm.actualDischargeDate ? adm.actualDischargeDate.toISOString().split('T')[0] : undefined,
      diagnosis: adm.diagnosis,
      status: adm.status,
      emergencyContact: adm.emergencyContact,
      insuranceProvider: adm.insuranceProvider || undefined
    }));
  }

  public static async createAdmission(input: any, currentUserId?: string, currentUserName?: string) {
    const patient = await prisma.patient.findFirst({ where: { id: input.patientId, deletedAt: null } });
    if (!patient) throw ApiError.notFound('Patient not found');

    const doctor = await prisma.doctor.findFirst({ where: { id: input.attendingDoctorId, deletedAt: null } });
    if (!doctor) throw ApiError.notFound('Doctor not found');

    const bed = await prisma.bed.findUnique({ where: { id: input.bedId } });
    if (!bed) throw ApiError.notFound('Bed not found');

    if (bed.status === 'Occupied') {
      throw ApiError.badRequest(`Bed ${bed.bedNumber} in ${bed.wardName} is currently occupied.`);
    }

    const admissionNumber = await this.generateAdmissionNumber();

    // Atomic admission transaction
    return prisma.$transaction(async (tx: any) => {
      const admission = await tx.admission.create({
        data: {
          admissionNumber,
          patientId: input.patientId,
          attendingDoctorId: input.attendingDoctorId,
          wardId: input.wardId,
          bedId: input.bedId,
          admissionDate: new Date(),
          expectedDischargeDate: input.expectedDischargeDate ? new Date(input.expectedDischargeDate) : undefined,
          diagnosis: input.diagnosis,
          status: 'Admitted',
          emergencyContact: input.emergencyContact,
          insuranceProvider: input.insuranceProvider
        }
      });

      // Set bed to Occupied
      await tx.bed.update({
        where: { id: input.bedId },
        data: { status: 'Occupied', currentPatientId: input.patientId }
      });

      // Update patient status to Inpatient
      await tx.patient.update({
        where: { id: input.patientId },
        data: { status: 'Inpatient' }
      });

      await AuditService.log({
        userId: currentUserId,
        userName: currentUserName,
        action: 'ADMIT',
        module: 'ADMISSIONS',
        recordIdentifier: admission.admissionNumber,
        description: `Admitted patient ${patient.fullName} to ${bed.wardName} Bed ${bed.bedNumber}`
      });

      return admission;
    });
  }

  public static async discharge(admissionId: string, currentUserId?: string, currentUserName?: string) {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { patient: true, bed: true }
    });

    if (!admission) throw ApiError.notFound('Admission record not found');

    if (admission.status === 'Discharged') {
      throw ApiError.badRequest('Patient has already been discharged');
    }

    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.admission.update({
        where: { id: admissionId },
        data: {
          status: 'Discharged',
          actualDischargeDate: new Date()
        }
      });

      // Free bed
      await tx.bed.update({
        where: { id: admission.bedId },
        data: { status: 'Available', currentPatientId: null }
      });

      // Update patient status
      await tx.patient.update({
        where: { id: admission.patientId },
        data: { status: 'Discharged' }
      });

      await AuditService.log({
        userId: currentUserId,
        userName: currentUserName,
        action: 'DISCHARGE',
        module: 'ADMISSIONS',
        recordIdentifier: admission.admissionNumber,
        description: `Discharged patient ${admission.patient.fullName} from ${admission.bed.bedNumber}`
      });

      return updated;
    });
  }
}
