import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';

export class DoctorService {
  private static async generateDoctorId(): Promise<string> {
    const count = await prisma.doctor.count();
    const nextNum = count + 101;
    return `DOC-${nextNum}`;
  }

  public static async getDoctors(query: {
    departmentId?: string;
    department?: string;
    specialization?: string;
    status?: string;
    search?: string;
  }) {
    const where: any = { deletedAt: null };

    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.status) where.status = query.status;
    if (query.specialization) where.specialization = { contains: query.specialization };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { doctorId: { contains: query.search } },
        { specialization: { contains: query.search } },
        { registrationNumber: { contains: query.search } }
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        department: true,
        schedules: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return doctors.map((d: any) => ({
      id: d.id,
      doctorId: d.doctorId,
      name: d.name,
      specialization: d.specialization,
      department: d.department.name,
      email: d.email,
      phone: d.phone,
      licenseNumber: d.registrationNumber,
      experienceYears: d.experienceYears,
      consultationFee: Number(d.consultationFee),
      workingDays: d.schedules.map((s: any) => s.dayOfWeek),
      schedule: d.schedules.map((s: any) => ({
        day: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room || 'Consultation Room 1'
      })),
      status: d.status,
      avatar: d.profileImage || undefined,
      rating: Number(d.rating)
    }));
  }

  public static async getDoctorById(id: string) {
    const d = await prisma.doctor.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: true,
        schedules: true
      }
    });

    if (!d) {
      throw ApiError.notFound('Doctor not found');
    }

    return {
      id: d.id,
      doctorId: d.doctorId,
      name: d.name,
      specialization: d.specialization,
      department: d.department.name,
      departmentId: d.departmentId,
      email: d.email,
      phone: d.phone,
      licenseNumber: d.registrationNumber,
      experienceYears: d.experienceYears,
      consultationFee: Number(d.consultationFee),
      workingDays: d.schedules.map((s: any) => s.dayOfWeek),
      schedule: d.schedules.map((s: any) => ({
        day: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room || 'Consultation Room 1'
      })),
      status: d.status,
      avatar: d.profileImage || undefined,
      rating: Number(d.rating)
    };
  }

  public static async createDoctor(input: any, currentUserId?: string, currentUserName?: string) {
    const doctorId = await this.generateDoctorId();

    const rawName = (input.name || '').replace(/^Dr\.?\s*/i, '').trim();
    const parts = rawName.split(' ');
    const firstName = input.firstName || parts[0] || 'Doctor';
    const lastName = input.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : 'Specialist');
    const registrationNumber = input.registrationNumber || input.licenseNumber || `REG-${Date.now().toString().slice(-6)}`;

    let departmentId = input.departmentId;
    if (!departmentId && input.department) {
      const dept = await prisma.department.findFirst({
        where: { name: { contains: input.department } }
      });
      if (dept) departmentId = dept.id;
    }
    if (!departmentId) {
      const defaultDept = await prisma.department.findFirst();
      departmentId = defaultDept?.id;
    }

    const doctor = await prisma.doctor.create({
      data: {
        doctorId,
        firstName,
        lastName,
        name: `Dr. ${firstName} ${lastName}`,
        registrationNumber,
        specialization: input.specialization || 'General Medicine',
        departmentId: departmentId!,
        phone: input.phone || '+1 555-0100',
        email: input.email,
        experienceYears: Number(input.experienceYears) || 0,
        consultationFee: Number(input.consultationFee) || 100,
        profileImage: input.profileImage,
        status: input.status || 'Available'
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'DOCTOR',
      recordIdentifier: doctor.doctorId,
      description: `Created doctor profile for ${doctor.name}`
    });

    return this.getDoctorById(doctor.id);
  }

  public static async updateDoctor(id: string, input: any, currentUserId?: string, currentUserName?: string) {
    const existing = await prisma.doctor.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw ApiError.notFound('Doctor not found');
    }

    const updateData: any = {};
    if (input.firstName || input.lastName) {
      const fName = input.firstName || existing.firstName;
      const lName = input.lastName || existing.lastName;
      updateData.firstName = fName;
      updateData.lastName = lName;
      updateData.name = `Dr. ${fName} ${lName}`;
    }

    if (input.registrationNumber) updateData.registrationNumber = input.registrationNumber;
    if (input.specialization) updateData.specialization = input.specialization;
    if (input.departmentId) updateData.departmentId = input.departmentId;
    if (input.phone) updateData.phone = input.phone;
    if (input.email) updateData.email = input.email;
    if (input.experienceYears !== undefined) updateData.experienceYears = input.experienceYears;
    if (input.consultationFee !== undefined) updateData.consultationFee = input.consultationFee;
    if (input.status) updateData.status = input.status;
    if (input.profileImage) updateData.profileImage = input.profileImage;

    await prisma.doctor.update({
      where: { id },
      data: updateData
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'DOCTOR',
      recordIdentifier: existing.doctorId,
      description: `Updated doctor profile for ${existing.name}`
    });

    return this.getDoctorById(id);
  }

  public static async updateSchedule(doctorId: string, schedules: any[], currentUserId?: string, currentUserName?: string) {
    const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, deletedAt: null } });
    if (!doctor) {
      throw ApiError.notFound('Doctor not found');
    }

    // Replace schedule inside transaction
    await prisma.$transaction([
      prisma.doctorSchedule.deleteMany({ where: { doctorId } }),
      prisma.doctorSchedule.createMany({
        data: schedules.map((s: any) => ({
          doctorId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room || 'Consultation Room 1',
          available: s.available ?? true,
          consultationDuration: s.consultationDuration || 30
        }))
      })
    ]);

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'DOCTOR',
      recordIdentifier: doctor.doctorId,
      description: `Updated schedule for ${doctor.name}`
    });

    return this.getDoctorById(doctorId);
  }

  public static async softDeleteDoctor(id: string, currentUserId?: string, currentUserName?: string) {
    const doctor = await prisma.doctor.findFirst({ where: { id, deletedAt: null } });
    if (!doctor) {
      throw ApiError.notFound('Doctor not found');
    }

    await prisma.doctor.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'DELETE',
      module: 'DOCTOR',
      recordIdentifier: doctor.doctorId,
      description: `Soft deleted doctor ${doctor.name}`
    });

    return { message: `Doctor ${doctor.doctorId} deleted successfully` };
  }
}
