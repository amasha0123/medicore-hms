import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';
import { StorageService } from '../utils/storage';

export class PatientService {
  private static async generatePatientNumber(): Promise<string> {
    const count = await prisma.patient.count();
    const nextNum = count + 10001;
    return `P-${nextNum}`;
  }

  public static async getPatients(query: {
    page?: number;
    limit?: number;
    search?: string;
    q?: string;
    gender?: string;
    bloodGroup?: string;
    status?: string;
    department?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const searchTerm = query.search || query.q;
    const where: any = { deletedAt: null };

    if (searchTerm) {
      where.OR = [
        { fullName: { contains: searchTerm } },
        { patientId: { contains: searchTerm } },
        { NIC: { contains: searchTerm } },
        { phone: { contains: searchTerm } },
        { email: { contains: searchTerm } }
      ];
    }

    if (query.gender) where.gender = query.gender;
    if (query.bloodGroup) where.bloodGroup = query.bloodGroup;
    if (query.status) where.status = query.status;
    if (query.department) where.primaryDepartment = query.department;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          assignedDoctor: {
            select: { id: true, name: true, specialization: true }
          },
          documents: true
        }
      })
    ]);

    const formattedPatients = patients.map((p: any) => {
      let addressObj = { street: '', city: '', province: '' };
      try {
        if (p.address.startsWith('{')) {
          addressObj = JSON.parse(p.address);
        } else {
          addressObj = { street: p.address, city: '', province: '' };
        }
      } catch (e) {
        addressObj = { street: p.address, city: '', province: '' };
      }

      return {
        id: p.id,
        patientNumber: p.patientId,
        fullName: p.fullName,
        dateOfBirth: p.dateOfBirth.toISOString().split('T')[0],
        age: p.age,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        nationalId: p.NIC,
        phone: p.phone,
        email: p.email,
        address: addressObj,
        emergencyContact: {
          name: p.emergencyContactName,
          relationship: p.emergencyContactRel,
          phone: p.emergencyContactPhone
        },
        allergies: p.allergies ? JSON.parse(p.allergies) : [],
        chronicConditions: p.chronicConditions ? JSON.parse(p.chronicConditions) : [],
        status: p.status,
        primaryDepartment: p.primaryDepartment || 'General Medicine',
        registeredDate: p.registeredDate.toISOString().split('T')[0],
        lastVisit: p.lastVisit ? p.lastVisit.toISOString().split('T')[0] : p.registeredDate.toISOString().split('T')[0],
        assignedDoctorId: p.assignedDoctorId || undefined,
        assignedDoctorName: p.assignedDoctor ? p.assignedDoctor.name : undefined
      };
    });

    return {
      patients: formattedPatients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  public static async getPatientById(id: string) {
    const p = await prisma.patient.findFirst({
      where: { id, deletedAt: null },
      include: {
        assignedDoctor: true,
        documents: true,
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
          take: 10,
          include: { doctor: true }
        }
      }
    });

    if (!p) {
      throw ApiError.notFound('Patient not found');
    }

    let addressObj = { street: '', city: '', province: '' };
    try {
      if (p.address.startsWith('{')) {
        addressObj = JSON.parse(p.address);
      } else {
        addressObj = { street: p.address, city: '', province: '' };
      }
    } catch (e) {
      addressObj = { street: p.address, city: '', province: '' };
    }

    // Get latest vitals from latest medical record
    const latestRecord = p.medicalRecords[0];
    const vitals = latestRecord
      ? {
          bloodPressure: latestRecord.bloodPressure || '120/80',
          heartRate: latestRecord.heartRate || 72,
          temperature: latestRecord.temperature ? Number(latestRecord.temperature) : 36.6,
          respiratoryRate: latestRecord.respiratoryRate || 16,
          oxygenSaturation: latestRecord.oxygenSaturation || 98,
          weightKg: latestRecord.weight ? Number(latestRecord.weight) : undefined,
          heightCm: latestRecord.height ? Number(latestRecord.height) : undefined,
          recordedAt: latestRecord.visitDate.toISOString().split('T')[0]
        }
      : undefined;

    return {
      id: p.id,
      patientNumber: p.patientId,
      fullName: p.fullName,
      dateOfBirth: p.dateOfBirth.toISOString().split('T')[0],
      age: p.age,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      nationalId: p.NIC,
      phone: p.phone,
      email: p.email,
      address: addressObj,
      emergencyContact: {
        name: p.emergencyContactName,
        relationship: p.emergencyContactRel,
        phone: p.emergencyContactPhone
      },
      allergies: p.allergies ? JSON.parse(p.allergies) : [],
      chronicConditions: p.chronicConditions ? JSON.parse(p.chronicConditions) : [],
      status: p.status,
      primaryDepartment: p.primaryDepartment || 'General Medicine',
      registeredDate: p.registeredDate.toISOString().split('T')[0],
      lastVisit: p.lastVisit ? p.lastVisit.toISOString().split('T')[0] : p.registeredDate.toISOString().split('T')[0],
      assignedDoctorId: p.assignedDoctorId || undefined,
      assignedDoctorName: p.assignedDoctor ? p.assignedDoctor.name : undefined,
      vitals,
      documents: p.documents.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        uploadDate: doc.uploadedAt.toISOString().split('T')[0],
        fileSize: doc.fileSize,
        fileType: doc.fileType
      }))
    };
  }

  public static async createPatient(input: any, currentUserId?: string, currentUserName?: string) {
    const patientNumber = await this.generatePatientNumber();

    const rawName = (input.fullName || input.name || '').trim();
    const parts = rawName.split(' ');
    const firstName = input.firstName || parts[0] || 'Patient';
    const lastName = input.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : 'Record');
    const fullName = input.fullName || `${firstName} ${lastName}`;

    const birthDate = input.dateOfBirth ? new Date(input.dateOfBirth) : new Date('1990-01-01');
    const age = Math.max(1, Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));

    const NIC = input.NIC || input.nationalId || `NIC-${Date.now().toString().slice(-6)}`;
    const addressStr = typeof input.address === 'object' ? JSON.stringify(input.address) : (input.address || '123 Health Ave, Metropolis');

    const emName = input.emergencyContact?.name || input.emergencyName || 'Family Contact';
    const emRel = input.emergencyContact?.relationship || input.emergencyRelationship || 'Relative';
    const emPhone = input.emergencyContact?.phone || input.emergencyPhone || input.phone || '+1 555-0100';

    const newPatient = await prisma.patient.create({
      data: {
        patientId: patientNumber,
        firstName,
        lastName,
        fullName,
        dateOfBirth: birthDate,
        age,
        gender: input.gender || 'Male',
        NIC,
        bloodGroup: input.bloodGroup || 'O+',
        phone: input.phone || '+1 555-0100',
        email: input.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@patient.hospital`,
        address: addressStr,
        emergencyContactName: emName,
        emergencyContactRel: emRel,
        emergencyContactPhone: emPhone,
        allergies: typeof input.allergies === 'string' ? input.allergies : JSON.stringify(input.allergies || []),
        chronicConditions: typeof input.chronicConditions === 'string' ? input.chronicConditions : JSON.stringify(input.chronicConditions || []),
        status: input.status || 'Active',
        primaryDepartment: input.primaryDepartment || 'General Medicine',
        assignedDoctorId: input.assignedDoctorId
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'CREATE',
      module: 'PATIENT',
      recordIdentifier: newPatient.patientId,
      description: `Registered new patient ${newPatient.fullName} (${newPatient.patientId})`
    });

    return this.getPatientById(newPatient.id);
  }

  public static async updatePatient(id: string, input: any, currentUserId?: string, currentUserName?: string) {
    const existing = await prisma.patient.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw ApiError.notFound('Patient not found');
    }

    const updateData: any = {};
    if (input.firstName || input.lastName) {
      const fName = input.firstName || existing.firstName;
      const lName = input.lastName || existing.lastName;
      updateData.firstName = fName;
      updateData.lastName = lName;
      updateData.fullName = `${fName} ${lName}`;
    }

    if (input.dateOfBirth) {
      const birthDate = new Date(input.dateOfBirth);
      updateData.dateOfBirth = birthDate;
      updateData.age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    if (input.gender) updateData.gender = input.gender;
    if (input.NIC) updateData.NIC = input.NIC;
    if (input.bloodGroup) updateData.bloodGroup = input.bloodGroup;
    if (input.phone) updateData.phone = input.phone;
    if (input.email) updateData.email = input.email;
    if (input.address) updateData.address = typeof input.address === 'object' ? JSON.stringify(input.address) : input.address;
    if (input.emergencyContact) {
      updateData.emergencyContactName = input.emergencyContact.name;
      updateData.emergencyContactRel = input.emergencyContact.relationship;
      updateData.emergencyContactPhone = input.emergencyContact.phone;
    }
    if (input.allergies) updateData.allergies = JSON.stringify(input.allergies);
    if (input.chronicConditions) updateData.chronicConditions = JSON.stringify(input.chronicConditions);
    if (input.status) updateData.status = input.status;
    if (input.primaryDepartment) updateData.primaryDepartment = input.primaryDepartment;
    if (input.assignedDoctorId !== undefined) updateData.assignedDoctorId = input.assignedDoctorId;

    await prisma.patient.update({
      where: { id },
      data: updateData
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'UPDATE',
      module: 'PATIENT',
      recordIdentifier: existing.patientId,
      description: `Updated patient details for ${existing.fullName}`
    });

    return this.getPatientById(id);
  }

  public static async softDeletePatient(id: string, currentUserId?: string, currentUserName?: string) {
    const existing = await prisma.patient.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw ApiError.notFound('Patient not found');
    }

    await prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'DELETE',
      module: 'PATIENT',
      recordIdentifier: existing.patientId,
      description: `Soft-deleted patient record for ${existing.fullName}`
    });

    return { message: `Patient ${existing.patientId} deleted successfully` };
  }

  public static async getMedicalHistory(patientId: string) {
    const patient = await prisma.patient.findFirst({ where: { id: patientId, deletedAt: null } });
    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    const [appointments, records, labResults, prescriptions, admissions] = await Promise.all([
      prisma.appointment.findMany({ where: { patientId }, include: { doctor: true }, orderBy: { appointmentDate: 'desc' } }),
      prisma.medicalRecord.findMany({ where: { patientId }, include: { doctor: true }, orderBy: { visitDate: 'desc' } }),
      prisma.laboratoryResult.findMany({ where: { patientId }, orderBy: { completedAt: 'desc' } }),
      prisma.prescription.findMany({ where: { patientId }, include: { doctor: true, items: true }, orderBy: { prescriptionDate: 'desc' } }),
      prisma.admission.findMany({ where: { patientId }, include: { attendingDoctor: true, ward: true }, orderBy: { admissionDate: 'desc' } })
    ]);

    const timeline: any[] = [];

    records.forEach((r: any) => {
      timeline.push({
        id: r.id,
        date: r.visitDate.toISOString().split('T')[0],
        type: 'Consultation',
        title: `Clinical Visit - ${r.diagnosisCode || 'Diagnosis'}`,
        doctorName: r.doctor.name,
        diagnosis: r.diagnosis,
        treatment: r.treatment,
        notes: r.notes || undefined
      });
    });

    labResults.forEach((lr: any) => {
      timeline.push({
        id: lr.id,
        date: lr.completedAt.toISOString().split('T')[0],
        type: 'Lab Result',
        title: `Laboratory Test - ${lr.testName}`,
        doctorName: 'Lab Technician',
        notes: lr.technicianNotes || undefined
      });
    });

    prescriptions.forEach((pr: any) => {
      const medicineNames = pr.items.map((i: any) => i.medicineName).join(', ');
      timeline.push({
        id: pr.id,
        date: pr.prescriptionDate.toISOString().split('T')[0],
        type: 'Prescription',
        title: `Prescription Issued - ${pr.prescriptionNumber}`,
        doctorName: pr.doctor.name,
        treatment: medicineNames,
        notes: pr.notes || undefined
      });
    });

    admissions.forEach((adm: any) => {
      timeline.push({
        id: adm.id,
        date: adm.admissionDate.toISOString().split('T')[0],
        type: 'Hospitalization',
        title: `Inpatient Admission - Ward: ${adm.ward.wardName}`,
        doctorName: adm.attendingDoctor.name,
        diagnosis: adm.diagnosis
      });
    });

    // Sort timeline descending by date
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline;
  }

  public static async addDocument(patientId: string, file: Express.Multer.File, category: string, uploadedBy: string) {
    const patient = await prisma.patient.findFirst({ where: { id: patientId, deletedAt: null } });
    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }

    const fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const doc = await prisma.patientDocument.create({
      data: {
        patientId,
        title: file.originalname,
        fileName: file.filename,
        fileType: file.mimetype.split('/')[1]?.toUpperCase() || 'FILE',
        fileSize: fileSizeFormatted,
        storagePath: file.path,
        category: category || 'OTHER',
        uploadedBy
      }
    });

    return {
      id: doc.id,
      title: doc.title,
      category: doc.category,
      uploadDate: doc.uploadedAt.toISOString().split('T')[0],
      fileSize: doc.fileSize,
      fileType: doc.fileType
    };
  }

  public static async deleteDocument(documentId: string) {
    const doc = await prisma.patientDocument.findUnique({ where: { id: documentId } });
    if (!doc) {
      throw ApiError.notFound('Document not found');
    }

    await StorageService.deleteFile(doc.storagePath);
    await prisma.patientDocument.delete({ where: { id: documentId } });

    return { message: 'Document deleted successfully' };
  }
}
