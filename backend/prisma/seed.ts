import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ROLE_DEFAULT_PERMISSIONS } from '../src/constants/roles';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MediCore HMS Database...');

  // 1. Seed Roles
  const rolesData = [
    { code: 'ADMIN', name: 'System Administrator', description: 'Full system access and user management' },
    { code: 'DOCTOR', name: 'Medical Doctor', description: 'Patient diagnosis, prescriptions and clinical notes' },
    { code: 'NURSE', name: 'Registered Nurse', description: 'Patient care, vitals, admissions and ward oversight' },
    { code: 'RECEPTIONIST', name: 'Front Desk Receptionist', description: 'Patient registration, appointment booking and queue' },
    { code: 'LAB_STAFF', name: 'Laboratory Technician', description: 'Lab test requests, sample processing and result entry' },
    { code: 'PHARMACIST', name: 'Clinical Pharmacist', description: 'Drug inventory, stock management and prescription dispensing' },
    { code: 'ACCOUNTANT', name: 'Billing Accountant', description: 'Invoice generation, payment recording and financial reports' }
  ];

  const rolesMap: Record<string, string> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: r
    });
    rolesMap[r.code] = role.id;
  }

  // 2. Seed Permissions
  const permissionsData = [
    { name: 'PATIENT_READ', module: 'PATIENT', action: 'READ', description: 'View patient records' },
    { name: 'PATIENT_CREATE', module: 'PATIENT', action: 'CREATE', description: 'Register new patient' },
    { name: 'PATIENT_UPDATE', module: 'PATIENT', action: 'UPDATE', description: 'Update patient information' },
    { name: 'PATIENT_DELETE', module: 'PATIENT', action: 'DELETE', description: 'Soft delete patient' },

    { name: 'DOCTOR_READ', module: 'DOCTOR', action: 'READ', description: 'View doctor profiles' },
    { name: 'DOCTOR_CREATE', module: 'DOCTOR', action: 'CREATE', description: 'Create doctor profile' },
    { name: 'DOCTOR_UPDATE', module: 'DOCTOR', action: 'UPDATE', description: 'Update doctor profile and schedule' },
    { name: 'DOCTOR_DELETE', module: 'DOCTOR', action: 'DELETE', description: 'Soft delete doctor' },

    { name: 'APPOINTMENT_READ', module: 'APPOINTMENT', action: 'READ', description: 'View appointments' },
    { name: 'APPOINTMENT_CREATE', module: 'APPOINTMENT', action: 'CREATE', description: 'Book appointment' },
    { name: 'APPOINTMENT_UPDATE', module: 'APPOINTMENT', action: 'UPDATE', description: 'Reschedule or update status' },
    { name: 'APPOINTMENT_CANCEL', module: 'APPOINTMENT', action: 'CANCEL', description: 'Cancel appointment' },

    { name: 'MEDICAL_RECORD_READ', module: 'EMR', action: 'READ', description: 'View medical records' },
    { name: 'MEDICAL_RECORD_CREATE', module: 'EMR', action: 'CREATE', description: 'Add clinical consultation' },
    { name: 'MEDICAL_RECORD_UPDATE', module: 'EMR', action: 'UPDATE', description: 'Edit clinical consultation' },

    { name: 'LAB_READ', module: 'LABORATORY', action: 'READ', description: 'View lab requests and results' },
    { name: 'LAB_CREATE', module: 'LABORATORY', action: 'CREATE', description: 'Order lab test' },
    { name: 'LAB_UPDATE', module: 'LABORATORY', action: 'UPDATE', description: 'Update sample status' },
    { name: 'LAB_RESULT_ENTRY', module: 'LABORATORY', action: 'RESULT_ENTRY', description: 'Enter test results' },

    { name: 'PHARMACY_READ', module: 'PHARMACY', action: 'READ', description: 'View drug inventory' },
    { name: 'PHARMACY_CREATE', module: 'PHARMACY', action: 'CREATE', description: 'Add new medicine' },
    { name: 'PHARMACY_UPDATE', module: 'PHARMACY', action: 'UPDATE', description: 'Stock in/out' },
    { name: 'PHARMACY_DISPENSE', module: 'PHARMACY', action: 'DISPENSE', description: 'Dispense prescription' },

    { name: 'BILLING_READ', module: 'BILLING', action: 'READ', description: 'View invoices' },
    { name: 'BILLING_CREATE', module: 'BILLING', action: 'CREATE', description: 'Generate invoice' },
    { name: 'PAYMENT_READ', module: 'BILLING', action: 'READ_PAYMENT', description: 'View payments' },
    { name: 'PAYMENT_CREATE', module: 'BILLING', action: 'CREATE_PAYMENT', description: 'Record payment' },

    { name: 'ADMISSION_READ', module: 'ADMISSIONS', action: 'READ', description: 'View admissions' },
    { name: 'ADMISSION_CREATE', module: 'ADMISSIONS', action: 'CREATE', description: 'Admit patient' },
    { name: 'ADMISSION_UPDATE', module: 'ADMISSIONS', action: 'UPDATE', description: 'Discharge or transfer bed' },

    { name: 'OUTPATIENT_READ', module: 'OUTPATIENT', action: 'READ', description: 'View queue' },
    { name: 'OUTPATIENT_MANAGE', module: 'OUTPATIENT', action: 'MANAGE', description: 'Manage ticket queue' },

    { name: 'STAFF_READ', module: 'STAFF', action: 'READ', description: 'View staff directory' },
    { name: 'STAFF_CREATE', module: 'STAFF', action: 'CREATE', description: 'Add employee' },
    { name: 'STAFF_UPDATE', module: 'STAFF', action: 'UPDATE', description: 'Update employee and approve leave' },

    { name: 'REPORT_READ', module: 'REPORT', action: 'READ', description: 'View analytics reports' },

    { name: 'USER_MANAGE', module: 'SYSTEM', action: 'USER_MANAGE', description: 'Manage system users' },
    { name: 'AUDIT_READ', module: 'SYSTEM', action: 'AUDIT_READ', description: 'View audit logs' },
    { name: 'SETTINGS_MANAGE', module: 'SYSTEM', action: 'SETTINGS_MANAGE', description: 'Manage hospital settings' }
  ];

  const permMap: Record<string, string> = {};
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { name: p.name },
      update: { module: p.module, action: p.action, description: p.description },
      create: p
    });
    permMap[p.name] = perm.id;
  }

  // Assign permissions to all roles based on ROLE_DEFAULT_PERMISSIONS
  for (const [roleCode, permNames] of Object.entries(ROLE_DEFAULT_PERMISSIONS)) {
    const roleId = rolesMap[roleCode];
    if (!roleId) continue;
    for (const permName of permNames) {
      const permissionId = permMap[permName];
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId
          }
        },
        update: {},
        create: {
          roleId,
          permissionId
        }
      });
    }
  }

  // 3. Seed Departments
  const deptsData = [
    { code: 'CARD', name: 'Cardiology', description: 'Heart and cardiovascular care' },
    { code: 'GEN', name: 'General Medicine', description: 'Primary care and internal medicine' },
    { code: 'PEDS', name: 'Pediatrics', description: 'Children healthcare' },
    { code: 'ORTH', name: 'Orthopedics', description: 'Bone and joint care' },
    { code: 'NEUR', name: 'Neurology', description: 'Brain and nervous system' },
    { code: 'LAB', name: 'Laboratory Services', description: 'Diagnostic pathology and blood work' },
    { code: 'PHAR', name: 'Pharmacy', description: 'Medication management and dispensing' }
  ];

  const deptMap: Record<string, string> = {};
  for (const d of deptsData) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name, description: d.description },
      create: d
    });
    deptMap[d.code] = dept.id;
  }

  // 4. Seed Demo Users (Password: RoleName@123!)
  const passwordHash = await bcrypt.hash('Admin@123!', 10);
  const demoUsers = [
    { email: 'admin@medicore.hospital', username: 'admin', firstName: 'Alexander', lastName: 'Wright', name: 'Alexander Wright', roleCode: 'ADMIN', deptCode: 'GEN' },
    { email: 'dr.chen@medicore.hospital', username: 'drchen', firstName: 'Sarah', lastName: 'Chen', name: 'Dr. Sarah Chen', roleCode: 'DOCTOR', deptCode: 'CARD' },
    { email: 'nurse.sarah@medicore.hospital', username: 'nursesarah', firstName: 'Sarah', lastName: 'Jenkins', name: 'Nurse Sarah Jenkins', roleCode: 'NURSE', deptCode: 'GEN' },
    { email: 'rec.mark@medicore.hospital', username: 'recmark', firstName: 'Mark', lastName: 'Davis', name: 'Mark Davis', roleCode: 'RECEPTIONIST', deptCode: 'GEN' },
    { email: 'lab.david@medicore.hospital', username: 'labdavid', firstName: 'David', lastName: 'Kim', name: 'David Kim', roleCode: 'LAB_STAFF', deptCode: 'LAB' },
    { email: 'pharm.lisa@medicore.hospital', username: 'pharmlisa', firstName: 'Lisa', lastName: 'Ray', name: 'Lisa Ray', roleCode: 'PHARMACIST', deptCode: 'PHAR' },
    { email: 'acc.robert@medicore.hospital', username: 'accrobert', firstName: 'Robert', lastName: 'Vance', name: 'Robert Vance', roleCode: 'ACCOUNTANT', deptCode: 'GEN' }
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, isActive: true, accountStatus: 'ACTIVE' },
      create: {
        firstName: u.firstName,
        lastName: u.lastName,
        name: u.name,
        email: u.email,
        username: u.username,
        passwordHash,
        roleId: rolesMap[u.roleCode],
        departmentId: deptMap[u.deptCode],
        isActive: true,
        accountStatus: 'ACTIVE'
      }
    });
  }

  // 5. Seed Doctors
  const doctorsData = [
    { doctorId: 'DOC-101', firstName: 'Sarah', lastName: 'Chen', registrationNumber: 'MD-99201', specialization: 'Cardiology', deptCode: 'CARD', fee: 150, exp: 12 },
    { doctorId: 'DOC-102', firstName: 'Michael', lastName: 'Marcus', registrationNumber: 'MD-88412', specialization: 'General Medicine', deptCode: 'GEN', fee: 100, exp: 15 },
    { doctorId: 'DOC-103', firstName: 'Elena', lastName: 'Rostova', registrationNumber: 'MD-77319', specialization: 'Pediatrics', deptCode: 'PEDS', fee: 120, exp: 9 },
    { doctorId: 'DOC-104', firstName: 'James', lastName: 'Wilson', registrationNumber: 'MD-66205', specialization: 'Orthopedics', deptCode: 'ORTH', fee: 180, exp: 18 },
    { doctorId: 'DOC-105', firstName: 'Amanda', lastName: 'Vance', registrationNumber: 'MD-55104', specialization: 'Neurology', deptCode: 'NEUR', fee: 200, exp: 14 }
  ];

  const doctorMap: Record<string, string> = {};
  for (const d of doctorsData) {
    const doc = await prisma.doctor.upsert({
      where: { doctorId: d.doctorId },
      update: { name: `Dr. ${d.firstName} ${d.lastName}` },
      create: {
        doctorId: d.doctorId,
        firstName: d.firstName,
        lastName: d.lastName,
        name: `Dr. ${d.firstName} ${d.lastName}`,
        registrationNumber: d.registrationNumber,
        specialization: d.specialization,
        departmentId: deptMap[d.deptCode],
        phone: '+1 (555) 019-2831',
        email: `${d.firstName.toLowerCase()}.${d.lastName.toLowerCase()}@medicore.hospital`,
        experienceYears: d.exp,
        consultationFee: d.fee,
        status: 'Available'
      }
    });
    doctorMap[d.doctorId] = doc.id;

    // Seed schedule
    await prisma.doctorSchedule.createMany({
      data: [
        { doctorId: doc.id, dayOfWeek: 'Monday', startTime: '09:00 AM', endTime: '01:00 PM', room: 'Room 101' },
        { doctorId: doc.id, dayOfWeek: 'Wednesday', startTime: '09:00 AM', endTime: '01:00 PM', room: 'Room 101' },
        { doctorId: doc.id, dayOfWeek: 'Friday', startTime: '02:00 PM', endTime: '06:00 PM', room: 'Room 101' }
      ]
    });
  }

  // 6. Seed Patients
  const patientsData = [
    { patientId: 'P-10042', firstName: 'Eleanor', lastName: 'Vance', gender: 'Female', bloodGroup: 'A+', nic: 'NIC-9940129', age: 44, docId: 'DOC-101' },
    { patientId: 'P-10043', firstName: 'Robert', lastName: 'Sterling', gender: 'Male', bloodGroup: 'O+', nic: 'NIC-8830182', age: 58, docId: 'DOC-102' },
    { patientId: 'P-10044', firstName: 'Sophia', lastName: 'Martinez', gender: 'Female', bloodGroup: 'B+', nic: 'NIC-7720194', age: 29, docId: 'DOC-103' },
    { patientId: 'P-10045', firstName: 'Marcus', lastName: 'Brody', gender: 'Male', bloodGroup: 'AB-', nic: 'NIC-6610283', age: 62, docId: 'DOC-104' },
    { patientId: 'P-10046', firstName: 'Arthur', lastName: 'Pendelton', gender: 'Male', bloodGroup: 'O-', nic: 'NIC-5500174', age: 71, docId: 'DOC-105' }
  ];

  const patientMap: Record<string, string> = {};
  for (const p of patientsData) {
    const pat = await prisma.patient.upsert({
      where: { patientId: p.patientId },
      update: { fullName: `${p.firstName} ${p.lastName}` },
      create: {
        patientId: p.patientId,
        firstName: p.firstName,
        lastName: p.lastName,
        fullName: `${p.firstName} ${p.lastName}`,
        dateOfBirth: new Date('1982-05-14'),
        age: p.age,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        NIC: p.nic,
        phone: '+1 (555) 392-1048',
        email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@example.com`,
        address: JSON.stringify({ street: '742 Evergreen Terrace', city: 'Springfield', province: 'NY' }),
        emergencyContactName: 'John Vance',
        emergencyContactRel: 'Spouse',
        emergencyContactPhone: '+1 (555) 991-2041',
        allergies: JSON.stringify(['Penicillin', 'Peanuts']),
        chronicConditions: JSON.stringify(['Hypertension', 'Type 2 Diabetes']),
        status: 'Active',
        primaryDepartment: 'Cardiology',
        assignedDoctorId: doctorMap[p.docId]
      }
    });
    patientMap[p.patientId] = pat.id;
  }

  // 7. Seed Medicines
  const medicinesData = [
    { code: 'MED-0124', name: 'Amoxicillin', generic: 'Amoxicillin Trihydrate', cat: 'Antibiotic', form: 'Capsule', str: '500mg', mfr: 'PharmaCorp', batch: 'BAT-2026-90', qty: 250, reorder: 50, price: 12.5, exp: '2027-08-15', loc: 'Shelf A-01' },
    { code: 'MED-0125', name: 'Paracetamol', generic: 'Acetaminophen', cat: 'Analgesic', form: 'Tablet', str: '500mg', mfr: 'HealthCare Inc', batch: 'BAT-2026-88', qty: 15, reorder: 30, price: 4.5, exp: '2026-12-31', loc: 'Shelf A-02' },
    { code: 'MED-0126', name: 'Metformin', generic: 'Metformin Hydrochloride', cat: 'Antidiabetic', form: 'Tablet', str: '850mg', mfr: 'BioMed LLC', batch: 'BAT-2026-74', qty: 120, reorder: 40, price: 18.0, exp: '2027-04-20', loc: 'Shelf B-04' },
    { code: 'MED-0127', name: 'Atorvastatin', generic: 'Atorvastatin Calcium', cat: 'Cardiovascular', form: 'Tablet', str: '20mg', mfr: 'CardioPharma', batch: 'BAT-2026-61', qty: 85, reorder: 25, price: 24.0, exp: '2026-10-10', loc: 'Shelf C-01' },
    { code: 'MED-0128', name: 'Omeprazole', generic: 'Omeprazole Magnesium', cat: 'Antacid', form: 'Capsule', str: '20mg', mfr: 'GastroLabs', batch: 'BAT-2026-55', qty: 0, reorder: 20, price: 15.0, exp: '2027-01-15', loc: 'Shelf B-02' }
  ];

  for (const m of medicinesData) {
    await prisma.medicine.upsert({
      where: { medicineId: m.code },
      update: { quantityInStock: m.qty },
      create: {
        medicineId: m.code,
        name: m.name,
        genericName: m.generic,
        categoryName: m.cat,
        dosageForm: m.form,
        strength: m.str,
        manufacturer: m.mfr,
        batchNumber: m.batch,
        quantityInStock: m.qty,
        reorderLevel: m.reorder,
        unitPrice: m.price,
        expiryDate: new Date(m.exp),
        location: m.loc,
        status: m.qty === 0 ? 'Out of Stock' : m.qty <= m.reorder ? 'Low Stock' : 'In Stock'
      }
    });
  }

  // 8. Seed Wards & Beds
  const wardsData = [
    { name: 'ICU', rate: 500 },
    { name: 'General Ward A', rate: 150 },
    { name: 'General Ward B', rate: 150 },
    { name: 'Surgical Ward', rate: 250 },
    { name: 'Pediatric Ward', rate: 200 },
    { name: 'Private Suite', rate: 450 }
  ];

  for (const w of wardsData) {
    const ward = await prisma.ward.upsert({
      where: { wardName: w.name },
      update: { dailyRate: w.rate },
      create: { wardName: w.name, dailyRate: w.rate, description: `${w.name} facility` }
    });

    for (let i = 1; i <= 4; i++) {
      const bedNumber = `${w.name.substring(0, 3).toUpperCase()}-B0${i}`;
      await prisma.bed.upsert({
        where: { bedNumber },
        update: {},
        create: {
          bedNumber,
          roomNumber: `R-${i}`,
          wardId: ward.id,
          wardName: ward.wardName,
          dailyRate: w.rate,
          status: i === 1 ? 'Occupied' : 'Available'
        }
      });
    }
  }

  // 9. System Settings
  await prisma.systemSetting.create({
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

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
