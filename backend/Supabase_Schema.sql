-- =====================================================================
-- MediCore Hospital Management System (HMS) - Supabase (PostgreSQL) Schema
-- Target RDBMS: Supabase / PostgreSQL 14+
-- Schema: public
-- Extensions: uuid-ossp, pgcrypto
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Enable Required Extensions
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 2. Drop Existing Tables (Cascade for clean re-creation)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "LeaveRequest" CASCADE;
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "Employee" CASCADE;
DROP TABLE IF EXISTS "OutpatientQueue" CASCADE;
DROP TABLE IF EXISTS "Admission" CASCADE;
DROP TABLE IF EXISTS "Bed" CASCADE;
DROP TABLE IF EXISTS "Room" CASCADE;
DROP TABLE IF EXISTS "Ward" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "InvoiceItem" CASCADE;
DROP TABLE IF EXISTS "Invoice" CASCADE;
DROP TABLE IF EXISTS "LaboratoryResult" CASCADE;
DROP TABLE IF EXISTS "LaboratoryRequest" CASCADE;
DROP TABLE IF EXISTS "LaboratoryTest" CASCADE;
DROP TABLE IF EXISTS "PharmacyTransaction" CASCADE;
DROP TABLE IF EXISTS "PrescriptionItem" CASCADE;
DROP TABLE IF EXISTS "Prescription" CASCADE;
DROP TABLE IF EXISTS "Medicine" CASCADE;
DROP TABLE IF EXISTS "MedicineCategory" CASCADE;
DROP TABLE IF EXISTS "MedicalRecord" CASCADE;
DROP TABLE IF EXISTS "Appointment" CASCADE;
DROP TABLE IF EXISTS "PatientDocument" CASCADE;
DROP TABLE IF EXISTS "Patient" CASCADE;
DROP TABLE IF EXISTS "DoctorSchedule" CASCADE;
DROP TABLE IF EXISTS "Doctor" CASCADE;
DROP TABLE IF EXISTS "RefreshToken" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Department" CASCADE;
DROP TABLE IF EXISTS "RolePermission" CASCADE;
DROP TABLE IF EXISTS "Permission" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;
DROP TABLE IF EXISTS "SystemSetting" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- =====================================================================
-- 3. TABLE DEFINITIONS (DDL)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Table: Role
-- ---------------------------------------------------------------------
CREATE TABLE "Role" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Role_name_key" UNIQUE ("name"),
    CONSTRAINT "Role_code_key" UNIQUE ("code")
);

-- ---------------------------------------------------------------------
-- Table: Permission
-- ---------------------------------------------------------------------
CREATE TABLE "Permission" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Permission_name_key" UNIQUE ("name")
);

-- ---------------------------------------------------------------------
-- Table: RolePermission
-- ---------------------------------------------------------------------
CREATE TABLE "RolePermission" (
    "roleId" VARCHAR(36) NOT NULL,
    "permissionId" VARCHAR(36) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId"),
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- ---------------------------------------------------------------------
-- Table: Department
-- ---------------------------------------------------------------------
CREATE TABLE "Department" (
    "id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "headDoctorId" VARCHAR(36),
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Department_code_key" UNIQUE ("code")
);

-- ---------------------------------------------------------------------
-- Table: User
-- ---------------------------------------------------------------------
CREATE TABLE "User" (
    "id" VARCHAR(36) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "roleId" VARCHAR(36),
    "departmentId" VARCHAR(36),
    "employeeId" VARCHAR(36),
    "profileImage" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accountStatus" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "User_email_key" UNIQUE ("email"),
    CONSTRAINT "User_username_key" UNIQUE ("username"),
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_accountStatus_idx" ON "User"("accountStatus");
CREATE INDEX "User_roleId_idx" ON "User"("roleId");
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- ---------------------------------------------------------------------
-- Table: RefreshToken
-- ---------------------------------------------------------------------
CREATE TABLE "RefreshToken" (
    "id" VARCHAR(36) NOT NULL,
    "userId" VARCHAR(36) NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- ---------------------------------------------------------------------
-- Table: Doctor
-- ---------------------------------------------------------------------
CREATE TABLE "Doctor" (
    "id" VARCHAR(36) NOT NULL,
    "doctorId" VARCHAR(50) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "registrationNumber" VARCHAR(100) NOT NULL,
    "specialization" VARCHAR(100) NOT NULL,
    "departmentId" VARCHAR(36) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "consultationFee" NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    "profileImage" VARCHAR(255),
    "rating" NUMERIC(3, 1) NOT NULL DEFAULT 5.0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'Available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Doctor_doctorId_key" UNIQUE ("doctorId"),
    CONSTRAINT "Doctor_registrationNumber_key" UNIQUE ("registrationNumber"),
    CONSTRAINT "Doctor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Doctor_doctorId_idx" ON "Doctor"("doctorId");
CREATE INDEX "Doctor_registrationNumber_idx" ON "Doctor"("registrationNumber");
CREATE INDEX "Doctor_departmentId_idx" ON "Doctor"("departmentId");

-- ---------------------------------------------------------------------
-- Table: DoctorSchedule
-- ---------------------------------------------------------------------
CREATE TABLE "DoctorSchedule" (
    "id" VARCHAR(36) NOT NULL,
    "doctorId" VARCHAR(36) NOT NULL,
    "dayOfWeek" VARCHAR(20) NOT NULL,
    "startTime" VARCHAR(20) NOT NULL,
    "endTime" VARCHAR(20) NOT NULL,
    "room" VARCHAR(50),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "consultationDuration" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DoctorSchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "DoctorSchedule_doctorId_idx" ON "DoctorSchedule"("doctorId");

-- ---------------------------------------------------------------------
-- Table: Patient
-- ---------------------------------------------------------------------
CREATE TABLE "Patient" (
    "id" VARCHAR(36) NOT NULL,
    "patientId" VARCHAR(50) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "NIC" VARCHAR(50) NOT NULL,
    "bloodGroup" VARCHAR(10) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "address" TEXT NOT NULL,
    "emergencyContactName" VARCHAR(100) NOT NULL,
    "emergencyContactRel" VARCHAR(50) NOT NULL,
    "emergencyContactPhone" VARCHAR(30) NOT NULL,
    "allergies" TEXT,
    "chronicConditions" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'Active',
    "primaryDepartment" VARCHAR(100),
    "registeredDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisit" TIMESTAMP(3),
    "assignedDoctorId" VARCHAR(36),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Patient_patientId_key" UNIQUE ("patientId"),
    CONSTRAINT "Patient_NIC_key" UNIQUE ("NIC"),
    CONSTRAINT "Patient_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Patient_patientId_idx" ON "Patient"("patientId");
CREATE INDEX "Patient_NIC_idx" ON "Patient"("NIC");
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");
CREATE INDEX "Patient_assignedDoctorId_idx" ON "Patient"("assignedDoctorId");

-- ---------------------------------------------------------------------
-- Table: PatientDocument
-- ---------------------------------------------------------------------
CREATE TABLE "PatientDocument" (
    "id" VARCHAR(36) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileType" VARCHAR(50) NOT NULL,
    "fileSize" VARCHAR(30) NOT NULL,
    "storagePath" VARCHAR(500) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "uploadedBy" VARCHAR(100) NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientDocument_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PatientDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PatientDocument_patientId_idx" ON "PatientDocument"("patientId");

-- ---------------------------------------------------------------------
-- Table: Appointment
-- ---------------------------------------------------------------------
CREATE TABLE "Appointment" (
    "id" VARCHAR(36) NOT NULL,
    "appointmentId" VARCHAR(50) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "doctorId" VARCHAR(36) NOT NULL,
    "departmentId" VARCHAR(36),
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "startTime" VARCHAR(20) NOT NULL,
    "endTime" VARCHAR(20),
    "appointmentType" VARCHAR(50) NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "room" VARCHAR(50),
    "status" VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    "createdBy" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Appointment_appointmentId_key" UNIQUE ("appointmentId"),
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");
CREATE INDEX "Appointment_doctorId_idx" ON "Appointment"("doctorId");
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");
CREATE INDEX "Appointment_departmentId_idx" ON "Appointment"("departmentId");

-- ---------------------------------------------------------------------
-- Table: MedicalRecord
-- ---------------------------------------------------------------------
CREATE TABLE "MedicalRecord" (
    "id" VARCHAR(36) NOT NULL,
    "recordNumber" VARCHAR(50) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "doctorId" VARCHAR(36) NOT NULL,
    "appointmentId" VARCHAR(36),
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiefComplaint" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "diagnosisCode" VARCHAR(50),
    "bloodPressure" VARCHAR(30),
    "heartRate" INTEGER,
    "temperature" NUMERIC(4, 1),
    "respiratoryRate" INTEGER,
    "oxygenSaturation" INTEGER,
    "weight" NUMERIC(5, 2),
    "height" NUMERIC(5, 2),
    "treatment" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MedicalRecord_recordNumber_key" UNIQUE ("recordNumber"),
    CONSTRAINT "MedicalRecord_appointmentId_key" UNIQUE ("appointmentId"),
    CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MedicalRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "MedicalRecord_patientId_idx" ON "MedicalRecord"("patientId");
CREATE INDEX "MedicalRecord_doctorId_idx" ON "MedicalRecord"("doctorId");

-- ---------------------------------------------------------------------
-- Table: MedicineCategory
-- ---------------------------------------------------------------------
CREATE TABLE "MedicineCategory" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "MedicineCategory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MedicineCategory_name_key" UNIQUE ("name")
);

-- ---------------------------------------------------------------------
-- Table: Medicine
-- ---------------------------------------------------------------------
CREATE TABLE "Medicine" (
    "id" VARCHAR(36) NOT NULL,
    "medicineId" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "genericName" VARCHAR(150) NOT NULL,
    "categoryId" VARCHAR(36),
    "categoryName" VARCHAR(100) NOT NULL,
    "dosageForm" VARCHAR(50) NOT NULL,
    "strength" VARCHAR(50) NOT NULL,
    "manufacturer" VARCHAR(150) NOT NULL,
    "batchNumber" VARCHAR(100) NOT NULL,
    "quantityInStock" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    "unitPrice" NUMERIC(10, 2) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "location" VARCHAR(100) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'In Stock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Medicine_medicineId_key" UNIQUE ("medicineId"),
    CONSTRAINT "Medicine_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MedicineCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Medicine_medicineId_idx" ON "Medicine"("medicineId");
CREATE INDEX "Medicine_expiryDate_idx" ON "Medicine"("expiryDate");
CREATE INDEX "Medicine_categoryId_idx" ON "Medicine"("categoryId");

-- ---------------------------------------------------------------------
-- Table: Prescription
-- ---------------------------------------------------------------------
CREATE TABLE "Prescription" (
    "id" VARCHAR(36) NOT NULL,
    "prescriptionNumber" VARCHAR(50) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "doctorId" VARCHAR(36) NOT NULL,
    "medicalRecordId" VARCHAR(36),
    "prescriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "dispensedAt" TIMESTAMP(3),
    "pharmacistName" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Prescription_prescriptionNumber_key" UNIQUE ("prescriptionNumber"),
    CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prescription_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");
CREATE INDEX "Prescription_doctorId_idx" ON "Prescription"("doctorId");
CREATE INDEX "Prescription_medicalRecordId_idx" ON "Prescription"("medicalRecordId");

-- ---------------------------------------------------------------------
-- Table: PrescriptionItem
-- ---------------------------------------------------------------------
CREATE TABLE "PrescriptionItem" (
    "id" VARCHAR(36) NOT NULL,
    "prescriptionId" VARCHAR(36) NOT NULL,
    "medicineId" VARCHAR(36),
    "medicineName" VARCHAR(150) NOT NULL,
    "dosage" VARCHAR(100) NOT NULL,
    "frequency" VARCHAR(100) NOT NULL,
    "duration" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dispensedQuantity" INTEGER NOT NULL DEFAULT 0,
    "instructions" VARCHAR(255),

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrescriptionItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "PrescriptionItem"("prescriptionId");
CREATE INDEX "PrescriptionItem_medicineId_idx" ON "PrescriptionItem"("medicineId");

-- ---------------------------------------------------------------------
-- Table: PharmacyTransaction
-- ---------------------------------------------------------------------
CREATE TABLE "PharmacyTransaction" (
    "id" VARCHAR(36) NOT NULL,
    "transactionId" VARCHAR(50) NOT NULL,
    "medicineId" VARCHAR(36) NOT NULL,
    "prescriptionId" VARCHAR(36),
    "transactionType" VARCHAR(30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" NUMERIC(10, 2) NOT NULL,
    "totalPrice" NUMERIC(10, 2) NOT NULL,
    "batchNumber" VARCHAR(100) NOT NULL,
    "performedBy" VARCHAR(100) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacyTransaction_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PharmacyTransaction_transactionId_key" UNIQUE ("transactionId"),
    CONSTRAINT "PharmacyTransaction_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PharmacyTransaction_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "PharmacyTransaction_medicineId_idx" ON "PharmacyTransaction"("medicineId");
CREATE INDEX "PharmacyTransaction_prescriptionId_idx" ON "PharmacyTransaction"("prescriptionId");

-- ---------------------------------------------------------------------
-- Table: LaboratoryTest
-- ---------------------------------------------------------------------
CREATE TABLE "LaboratoryTest" (
    "id" VARCHAR(36) NOT NULL,
    "testCode" VARCHAR(50) NOT NULL,
    "testName" VARCHAR(150) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "price" NUMERIC(10, 2) NOT NULL,
    "referenceRange" VARCHAR(100),
    "unit" VARCHAR(30),
    "sampleType" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaboratoryTest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LaboratoryTest_testCode_key" UNIQUE ("testCode")
);

-- ---------------------------------------------------------------------
-- Table: LaboratoryRequest
-- ---------------------------------------------------------------------
CREATE TABLE "LaboratoryRequest" (
    "id" VARCHAR(36) NOT NULL,
    "requestId" VARCHAR(50) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "doctorId" VARCHAR(36) NOT NULL,
    "testName" VARCHAR(150) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'Normal',
    "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sampleCollectedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "sampleStatus" VARCHAR(30) NOT NULL DEFAULT 'Requested',
    "sampleType" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaboratoryRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LaboratoryRequest_requestId_key" UNIQUE ("requestId"),
    CONSTRAINT "LaboratoryRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LaboratoryRequest_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "LaboratoryRequest_patientId_idx" ON "LaboratoryRequest"("patientId");
CREATE INDEX "LaboratoryRequest_doctorId_idx" ON "LaboratoryRequest"("doctorId");

-- ---------------------------------------------------------------------
-- Table: LaboratoryResult
-- ---------------------------------------------------------------------
CREATE TABLE "LaboratoryResult" (
    "id" VARCHAR(36) NOT NULL,
    "requestId" VARCHAR(36) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "testName" VARCHAR(150) NOT NULL,
    "resultsJson" TEXT NOT NULL,
    "technicianNotes" TEXT,
    "pathologistRemarks" TEXT,
    "attachmentName" VARCHAR(255),
    "performedBy" VARCHAR(100) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaboratoryResult_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LaboratoryResult_requestId_key" UNIQUE ("requestId"),
    CONSTRAINT "LaboratoryResult_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "LaboratoryRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LaboratoryResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "LaboratoryResult_patientId_idx" ON "LaboratoryResult"("patientId");

-- ---------------------------------------------------------------------
-- Table: Invoice
-- ---------------------------------------------------------------------
CREATE TABLE "Invoice" (
    "id" VARCHAR(36) NOT NULL,
    "invoiceNumber" VARCHAR(50) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "subtotal" NUMERIC(10, 2) NOT NULL,
    "discountPercentage" NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    "discountAmount" NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    "taxPercentage" NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    "taxAmount" NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    "totalAmount" NUMERIC(10, 2) NOT NULL,
    "paidAmount" NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    "balanceDue" NUMERIC(10, 2) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "paymentMethod" VARCHAR(50),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Invoice_invoiceNumber_key" UNIQUE ("invoiceNumber"),
    CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");
CREATE INDEX "Invoice_patientId_idx" ON "Invoice"("patientId");
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- ---------------------------------------------------------------------
-- Table: InvoiceItem
-- ---------------------------------------------------------------------
CREATE TABLE "InvoiceItem" (
    "id" VARCHAR(36) NOT NULL,
    "invoiceId" VARCHAR(36) NOT NULL,
    "serviceCategory" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "unitPrice" NUMERIC(10, 2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "total" NUMERIC(10, 2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- ---------------------------------------------------------------------
-- Table: Payment
-- ---------------------------------------------------------------------
CREATE TABLE "Payment" (
    "id" VARCHAR(36) NOT NULL,
    "paymentNumber" VARCHAR(50) NOT NULL,
    "invoiceId" VARCHAR(36) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "amount" NUMERIC(10, 2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "transactionRef" VARCHAR(100) NOT NULL,
    "receivedBy" VARCHAR(100) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'Successful',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Payment_paymentNumber_key" UNIQUE ("paymentNumber"),
    CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Payment_paymentNumber_idx" ON "Payment"("paymentNumber");
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");
CREATE INDEX "Payment_patientId_idx" ON "Payment"("patientId");

-- ---------------------------------------------------------------------
-- Table: Ward
-- ---------------------------------------------------------------------
CREATE TABLE "Ward" (
    "id" VARCHAR(36) NOT NULL,
    "wardName" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "dailyRate" NUMERIC(10, 2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Ward_wardName_key" UNIQUE ("wardName")
);

-- ---------------------------------------------------------------------
-- Table: Room
-- ---------------------------------------------------------------------
CREATE TABLE "Room" (
    "id" VARCHAR(36) NOT NULL,
    "wardId" VARCHAR(36) NOT NULL,
    "roomNumber" VARCHAR(50) NOT NULL,
    "roomType" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Room_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Room_wardId_idx" ON "Room"("wardId");

-- ---------------------------------------------------------------------
-- Table: Bed
-- ---------------------------------------------------------------------
CREATE TABLE "Bed" (
    "id" VARCHAR(36) NOT NULL,
    "bedNumber" VARCHAR(50) NOT NULL,
    "roomNumber" VARCHAR(50) NOT NULL,
    "roomId" VARCHAR(36),
    "wardId" VARCHAR(36) NOT NULL,
    "wardName" VARCHAR(100) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'Available',
    "dailyRate" NUMERIC(10, 2) NOT NULL,
    "currentPatientId" VARCHAR(36),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Bed_bedNumber_key" UNIQUE ("bedNumber"),
    CONSTRAINT "Bed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Bed_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Bed_roomId_idx" ON "Bed"("roomId");
CREATE INDEX "Bed_wardId_idx" ON "Bed"("wardId");

-- ---------------------------------------------------------------------
-- Table: Admission
-- ---------------------------------------------------------------------
CREATE TABLE "Admission" (
    "id" VARCHAR(36) NOT NULL,
    "admissionNumber" VARCHAR(50) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "attendingDoctorId" VARCHAR(36) NOT NULL,
    "wardId" VARCHAR(36) NOT NULL,
    "bedId" VARCHAR(36) NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDischargeDate" TIMESTAMP(3),
    "actualDischargeDate" TIMESTAMP(3),
    "diagnosis" TEXT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'Admitted',
    "emergencyContact" VARCHAR(150) NOT NULL,
    "insuranceProvider" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Admission_admissionNumber_key" UNIQUE ("admissionNumber"),
    CONSTRAINT "Admission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Admission_attendingDoctorId_fkey" FOREIGN KEY ("attendingDoctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Admission_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Admission_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Admission_patientId_idx" ON "Admission"("patientId");
CREATE INDEX "Admission_attendingDoctorId_idx" ON "Admission"("attendingDoctorId");
CREATE INDEX "Admission_wardId_idx" ON "Admission"("wardId");
CREATE INDEX "Admission_bedId_idx" ON "Admission"("bedId");

-- ---------------------------------------------------------------------
-- Table: OutpatientQueue
-- ---------------------------------------------------------------------
CREATE TABLE "OutpatientQueue" (
    "id" VARCHAR(36) NOT NULL,
    "queueNumber" VARCHAR(50) NOT NULL,
    "patientId" VARCHAR(36) NOT NULL,
    "doctorId" VARCHAR(36) NOT NULL,
    "departmentId" VARCHAR(36),
    "arrivalTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'Normal',
    "status" VARCHAR(30) NOT NULL DEFAULT 'Waiting',
    "consultationStartTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutpatientQueue_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OutpatientQueue_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutpatientQueue_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutpatientQueue_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "OutpatientQueue_queueNumber_idx" ON "OutpatientQueue"("queueNumber");
CREATE INDEX "OutpatientQueue_patientId_idx" ON "OutpatientQueue"("patientId");
CREATE INDEX "OutpatientQueue_doctorId_idx" ON "OutpatientQueue"("doctorId");
CREATE INDEX "OutpatientQueue_departmentId_idx" ON "OutpatientQueue"("departmentId");

-- ---------------------------------------------------------------------
-- Table: Employee
-- ---------------------------------------------------------------------
CREATE TABLE "Employee" (
    "id" VARCHAR(36) NOT NULL,
    "employeeId" VARCHAR(50) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "departmentId" VARCHAR(36),
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL,
    "qualification" VARCHAR(150) NOT NULL,
    "shift" VARCHAR(30) NOT NULL DEFAULT 'Morning',
    "status" VARCHAR(30) NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Employee_employeeId_key" UNIQUE ("employeeId"),
    CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Employee_employeeId_idx" ON "Employee"("employeeId");
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- ---------------------------------------------------------------------
-- Table: Attendance
-- ---------------------------------------------------------------------
CREATE TABLE "Attendance" (
    "id" VARCHAR(36) NOT NULL,
    "employeeId" VARCHAR(36) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkInTime" VARCHAR(20),
    "checkOutTime" VARCHAR(20),
    "status" VARCHAR(30) NOT NULL DEFAULT 'Present',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Attendance_employeeId_date_key" UNIQUE ("employeeId", "date"),
    CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Attendance_employeeId_idx" ON "Attendance"("employeeId");

-- ---------------------------------------------------------------------
-- Table: LeaveRequest
-- ---------------------------------------------------------------------
CREATE TABLE "LeaveRequest" (
    "id" VARCHAR(36) NOT NULL,
    "leaveId" VARCHAR(50) NOT NULL,
    "employeeId" VARCHAR(36) NOT NULL,
    "leaveType" VARCHAR(50) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(30) NOT NULL DEFAULT 'Pending',
    "approvedBy" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LeaveRequest_leaveId_key" UNIQUE ("leaveId"),
    CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");

-- ---------------------------------------------------------------------
-- Table: Notification
-- ---------------------------------------------------------------------
CREATE TABLE "Notification" (
    "id" VARCHAR(36) NOT NULL,
    "userId" VARCHAR(36),
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'Normal',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- ---------------------------------------------------------------------
-- Table: AuditLog
-- ---------------------------------------------------------------------
CREATE TABLE "AuditLog" (
    "id" VARCHAR(36) NOT NULL,
    "userId" VARCHAR(36),
    "userName" VARCHAR(150) NOT NULL,
    "userRole" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "recordIdentifier" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" VARCHAR(50) NOT NULL,
    "userAgent" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- ---------------------------------------------------------------------
-- Table: SystemSetting
-- ---------------------------------------------------------------------
CREATE TABLE "SystemSetting" (
    "id" VARCHAR(36) NOT NULL,
    "hospitalName" VARCHAR(150) NOT NULL DEFAULT 'MediCore Hospital',
    "hospitalAddress" TEXT NOT NULL,
    "contactNumber" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "workingHours" VARCHAR(100) NOT NULL,
    "sessionTimeout" VARCHAR(20) NOT NULL DEFAULT '30m',
    "notificationSettingsJson" TEXT,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------
-- Table: _prisma_migrations (Prisma ORM migration history tracking)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
VALUES
('m-init-000001', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', CURRENT_TIMESTAMP, '20260907125044_init', 1),
('m-status-000002', 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', CURRENT_TIMESTAMP, '20260908023447_add_user_account_status', 1)
ON CONFLICT ("id") DO NOTHING;

-- =====================================================================
-- 4. INITIAL SEED DATA (Ready-to-Use Core Data for Supabase)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------
INSERT INTO "Role" ("id", "name", "code", "description", "createdAt", "updatedAt") VALUES
('00000000-0000-0000-0000-000000000001', 'System Administrator', 'ADMIN', 'Full system access and user management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000002', 'Medical Doctor', 'DOCTOR', 'Patient diagnosis, prescriptions and clinical notes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000003', 'Registered Nurse', 'NURSE', 'Patient care, vitals, admissions and ward oversight', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000004', 'Front Desk Receptionist', 'RECEPTIONIST', 'Patient registration, appointment booking and queue', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000005', 'Laboratory Technician', 'LAB_STAFF', 'Lab test requests, sample processing and result entry', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000006', 'Clinical Pharmacist', 'PHARMACIST', 'Drug inventory, stock management and prescription dispensing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000007', 'Billing Accountant', 'ACCOUNTANT', 'Invoice generation, payment recording and financial reports', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "description" = EXCLUDED."description";

-- ---------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------
INSERT INTO "Permission" ("id", "name", "module", "action", "description") VALUES
('20000000-0000-0000-0000-000000000001', 'PATIENT_READ', 'PATIENT', 'READ', 'View patient records'),
('20000000-0000-0000-0000-000000000002', 'PATIENT_CREATE', 'PATIENT', 'CREATE', 'Register new patient'),
('20000000-0000-0000-0000-000000000003', 'PATIENT_UPDATE', 'PATIENT', 'UPDATE', 'Update patient information'),
('20000000-0000-0000-0000-000000000004', 'PATIENT_DELETE', 'PATIENT', 'DELETE', 'Soft delete patient'),

('20000000-0000-0000-0000-000000000005', 'DOCTOR_READ', 'DOCTOR', 'READ', 'View doctor profiles'),
('20000000-0000-0000-0000-000000000006', 'DOCTOR_CREATE', 'DOCTOR', 'CREATE', 'Create doctor profile'),
('20000000-0000-0000-0000-000000000007', 'DOCTOR_UPDATE', 'DOCTOR', 'UPDATE', 'Update doctor profile and schedule'),
('20000000-0000-0000-0000-000000000008', 'DOCTOR_DELETE', 'DOCTOR', 'DELETE', 'Soft delete doctor'),

('20000000-0000-0000-0000-000000000009', 'APPOINTMENT_READ', 'APPOINTMENT', 'READ', 'View appointments'),
('20000000-0000-0000-0000-000000000010', 'APPOINTMENT_CREATE', 'APPOINTMENT', 'CREATE', 'Book appointment'),
('20000000-0000-0000-0000-000000000011', 'APPOINTMENT_UPDATE', 'APPOINTMENT', 'UPDATE', 'Reschedule or update status'),
('20000000-0000-0000-0000-000000000012', 'APPOINTMENT_CANCEL', 'APPOINTMENT', 'CANCEL', 'Cancel appointment'),

('20000000-0000-0000-0000-000000000013', 'MEDICAL_RECORD_READ', 'EMR', 'READ', 'View medical records'),
('20000000-0000-0000-0000-000000000014', 'MEDICAL_RECORD_CREATE', 'EMR', 'CREATE', 'Add clinical consultation'),
('20000000-0000-0000-0000-000000000015', 'MEDICAL_RECORD_UPDATE', 'EMR', 'UPDATE', 'Edit clinical consultation'),

('20000000-0000-0000-0000-000000000016', 'LAB_READ', 'LABORATORY', 'READ', 'View lab requests and results'),
('20000000-0000-0000-0000-000000000017', 'LAB_CREATE', 'LABORATORY', 'CREATE', 'Order lab test'),
('20000000-0000-0000-0000-000000000018', 'LAB_UPDATE', 'LABORATORY', 'UPDATE', 'Update sample status'),
('20000000-0000-0000-0000-000000000019', 'LAB_RESULT_ENTRY', 'LABORATORY', 'RESULT_ENTRY', 'Enter test results'),

('20000000-0000-0000-0000-000000000020', 'PHARMACY_READ', 'PHARMACY', 'READ', 'View drug inventory'),
('20000000-0000-0000-0000-000000000021', 'PHARMACY_CREATE', 'PHARMACY', 'CREATE', 'Add new medicine'),
('20000000-0000-0000-0000-000000000022', 'PHARMACY_UPDATE', 'PHARMACY', 'UPDATE', 'Stock in/out'),
('20000000-0000-0000-0000-000000000023', 'PHARMACY_DISPENSE', 'PHARMACY', 'DISPENSE', 'Dispense prescription'),

('20000000-0000-0000-0000-000000000024', 'BILLING_READ', 'BILLING', 'READ', 'View invoices'),
('20000000-0000-0000-0000-000000000025', 'BILLING_CREATE', 'BILLING', 'CREATE', 'Generate invoice'),
('20000000-0000-0000-0000-000000000026', 'PAYMENT_READ', 'BILLING', 'READ_PAYMENT', 'View payments'),
('20000000-0000-0000-0000-000000000027', 'PAYMENT_CREATE', 'BILLING', 'CREATE_PAYMENT', 'Record payment'),

('20000000-0000-0000-0000-000000000028', 'ADMISSION_READ', 'ADMISSIONS', 'READ', 'View admissions'),
('20000000-0000-0000-0000-000000000029', 'ADMISSION_CREATE', 'ADMISSIONS', 'CREATE', 'Admit patient'),
('20000000-0000-0000-0000-000000000030', 'ADMISSION_UPDATE', 'ADMISSIONS', 'UPDATE', 'Discharge or transfer bed'),

('20000000-0000-0000-0000-000000000031', 'OUTPATIENT_READ', 'OUTPATIENT', 'READ', 'View queue'),
('20000000-0000-0000-0000-000000000032', 'OUTPATIENT_MANAGE', 'OUTPATIENT', 'MANAGE', 'Manage ticket queue'),

('20000000-0000-0000-0000-000000000033', 'STAFF_READ', 'STAFF', 'READ', 'View staff directory'),
('20000000-0000-0000-0000-000000000034', 'STAFF_CREATE', 'STAFF', 'CREATE', 'Add employee'),
('20000000-0000-0000-0000-000000000035', 'STAFF_UPDATE', 'STAFF', 'UPDATE', 'Update employee and approve leave'),

('20000000-0000-0000-0000-000000000036', 'REPORT_READ', 'REPORT', 'READ', 'View analytics reports'),

('20000000-0000-0000-0000-000000000037', 'USER_MANAGE', 'SYSTEM', 'USER_MANAGE', 'Manage system users'),
('20000000-0000-0000-0000-000000000038', 'AUDIT_READ', 'SYSTEM', 'AUDIT_READ', 'View audit logs'),
('20000000-0000-0000-0000-000000000039', 'SETTINGS_MANAGE', 'SYSTEM', 'SETTINGS_MANAGE', 'Manage hospital settings')
ON CONFLICT ("id") DO UPDATE SET "module" = EXCLUDED."module", "action" = EXCLUDED."action", "description" = EXCLUDED."description";

-- ---------------------------------------------------------------------
-- RolePermission Associations
-- ---------------------------------------------------------------------
-- ADMIN: All 39 Permissions
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT '00000000-0000-0000-0000-000000000001', "id" FROM "Permission"
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- DOCTOR Permissions
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT '00000000-0000-0000-0000-000000000002', "id" FROM "Permission" WHERE "name" IN (
    'PATIENT_READ', 'PATIENT_CREATE', 'PATIENT_UPDATE',
    'DOCTOR_READ',
    'APPOINTMENT_READ', 'APPOINTMENT_CREATE', 'APPOINTMENT_UPDATE', 'APPOINTMENT_CANCEL',
    'MEDICAL_RECORD_READ', 'MEDICAL_RECORD_CREATE', 'MEDICAL_RECORD_UPDATE',
    'LAB_READ', 'LAB_CREATE',
    'PHARMACY_READ',
    'ADMISSION_READ',
    'OUTPATIENT_READ', 'OUTPATIENT_MANAGE',
    'REPORT_READ'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- NURSE Permissions
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT '00000000-0000-0000-0000-000000000003', "id" FROM "Permission" WHERE "name" IN (
    'PATIENT_READ', 'PATIENT_CREATE', 'PATIENT_UPDATE',
    'DOCTOR_READ',
    'APPOINTMENT_READ',
    'MEDICAL_RECORD_READ', 'MEDICAL_RECORD_UPDATE',
    'LAB_READ',
    'ADMISSION_READ', 'ADMISSION_CREATE', 'ADMISSION_UPDATE',
    'OUTPATIENT_READ', 'OUTPATIENT_MANAGE'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- RECEPTIONIST Permissions
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT '00000000-0000-0000-0000-000000000004', "id" FROM "Permission" WHERE "name" IN (
    'PATIENT_READ', 'PATIENT_CREATE', 'PATIENT_UPDATE',
    'DOCTOR_READ',
    'APPOINTMENT_READ', 'APPOINTMENT_CREATE', 'APPOINTMENT_UPDATE', 'APPOINTMENT_CANCEL',
    'BILLING_READ', 'BILLING_CREATE',
    'PAYMENT_READ', 'PAYMENT_CREATE',
    'ADMISSION_READ',
    'OUTPATIENT_READ', 'OUTPATIENT_MANAGE'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- LAB_STAFF Permissions
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT '00000000-0000-0000-0000-000000000005', "id" FROM "Permission" WHERE "name" IN (
    'PATIENT_READ',
    'DOCTOR_READ',
    'LAB_READ', 'LAB_CREATE', 'LAB_UPDATE', 'LAB_RESULT_ENTRY'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- PHARMACIST Permissions
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT '00000000-0000-0000-0000-000000000006', "id" FROM "Permission" WHERE "name" IN (
    'PATIENT_READ',
    'DOCTOR_READ',
    'PHARMACY_READ', 'PHARMACY_CREATE', 'PHARMACY_UPDATE', 'PHARMACY_DISPENSE',
    'BILLING_READ'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- ACCOUNTANT Permissions
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT '00000000-0000-0000-0000-000000000007', "id" FROM "Permission" WHERE "name" IN (
    'PATIENT_READ',
    'BILLING_READ', 'BILLING_CREATE',
    'PAYMENT_READ', 'PAYMENT_CREATE',
    'REPORT_READ'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- ---------------------------------------------------------------------
-- Departments
-- ---------------------------------------------------------------------
INSERT INTO "Department" ("id", "code", "name", "description", "status", "createdAt", "updatedAt") VALUES
('10000000-0000-0000-0000-000000000001', 'CARD', 'Cardiology', 'Heart and cardiovascular care', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000002', 'GEN', 'General Medicine', 'Primary care and internal medicine', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000003', 'PEDS', 'Pediatrics', 'Children healthcare', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000004', 'ORTH', 'Orthopedics', 'Bone and joint care', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000005', 'NEUR', 'Neurology', 'Brain and nervous system', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000006', 'LAB', 'Laboratory Services', 'Diagnostic pathology and blood work', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000007', 'PHAR', 'Pharmacy', 'Medication management and dispensing', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "description" = EXCLUDED."description";

-- ---------------------------------------------------------------------
-- Demo Users (Default Password for all: Admin@123!)
-- bcrypt hash: $2b$10$EC6wne28OP4gS52eRxvsI.nOW/XISp58YBkiiB7v3U6647wqr0PIe
-- ---------------------------------------------------------------------
INSERT INTO "User" ("id", "firstName", "lastName", "name", "email", "username", "passwordHash", "phone", "roleId", "departmentId", "isActive", "accountStatus", "createdAt", "updatedAt") VALUES
('30000000-0000-0000-0000-000000000001', 'Alexander', 'Wright', 'Alexander Wright', 'admin@medicore.hospital', 'admin', '$2b$10$EC6wne28OP4gS52eRxvsI.nOW/XISp58YBkiiB7v3U6647wqr0PIe', '+1 (555) 010-0001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', true, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000002', 'Sarah', 'Chen', 'Dr. Sarah Chen', 'dr.chen@medicore.hospital', 'drchen', '$2b$10$EC6wne28OP4gS52eRxvsI.nOW/XISp58YBkiiB7v3U6647wqr0PIe', '+1 (555) 019-2831', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', true, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000003', 'Sarah', 'Jenkins', 'Nurse Sarah Jenkins', 'nurse.sarah@medicore.hospital', 'nursesarah', '$2b$10$EC6wne28OP4gS52eRxvsI.nOW/XISp58YBkiiB7v3U6647wqr0PIe', '+1 (555) 010-0003', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', true, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000004', 'Mark', 'Davis', 'Mark Davis', 'rec.mark@medicore.hospital', 'recmark', '$2b$10$EC6wne28OP4gS52eRxvsI.nOW/XISp58YBkiiB7v3U6647wqr0PIe', '+1 (555) 010-0004', '00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', true, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000005', 'David', 'Kim', 'David Kim', 'lab.david@medicore.hospital', 'labdavid', '$2b$10$EC6wne28OP4gS52eRxvsI.nOW/XISp58YBkiiB7v3U6647wqr0PIe', '+1 (555) 010-0005', '00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', true, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000006', 'Lisa', 'Ray', 'Lisa Ray', 'pharm.lisa@medicore.hospital', 'pharmlisa', '$2b$10$EC6wne28OP4gS52eRxvsI.nOW/XISp58YBkiiB7v3U6647wqr0PIe', '+1 (555) 010-0006', '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000007', true, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000007', 'Robert', 'Vance', 'Robert Vance', 'acc.robert@medicore.hospital', 'accrobert', '$2b$10$EC6wne28OP4gS52eRxvsI.nOW/XISp58YBkiiB7v3U6647wqr0PIe', '+1 (555) 010-0007', '00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', true, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "accountStatus" = EXCLUDED."accountStatus", "isActive" = EXCLUDED."isActive";

-- ---------------------------------------------------------------------
-- Doctors
-- ---------------------------------------------------------------------
INSERT INTO "Doctor" ("id", "doctorId", "firstName", "lastName", "name", "registrationNumber", "specialization", "departmentId", "phone", "email", "experienceYears", "consultationFee", "rating", "status", "createdAt", "updatedAt") VALUES
('40000000-0000-0000-0000-000000000001', 'DOC-101', 'Sarah', 'Chen', 'Dr. Sarah Chen', 'MD-99201', 'Cardiology', '10000000-0000-0000-0000-000000000001', '+1 (555) 019-2831', 'sarah.chen@medicore.hospital', 12, 150.00, 5.0, 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000002', 'DOC-102', 'Michael', 'Marcus', 'Dr. Michael Marcus', 'MD-88412', 'General Medicine', '10000000-0000-0000-0000-000000000002', '+1 (555) 019-2832', 'michael.marcus@medicore.hospital', 15, 100.00, 5.0, 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000003', 'DOC-103', 'Elena', 'Rostova', 'Dr. Elena Rostova', 'MD-77319', 'Pediatrics', '10000000-0000-0000-0000-000000000003', '+1 (555) 019-2833', 'elena.rostova@medicore.hospital', 9, 120.00, 5.0, 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000004', 'DOC-104', 'James', 'Wilson', 'Dr. James Wilson', 'MD-66205', 'Orthopedics', '10000000-0000-0000-0000-000000000004', '+1 (555) 019-2834', 'james.wilson@medicore.hospital', 18, 180.00, 5.0, 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000005', 'DOC-105', 'Amanda', 'Vance', 'Dr. Amanda Vance', 'MD-55104', 'Neurology', '10000000-0000-0000-0000-000000000005', '+1 (555) 019-2835', 'amanda.vance@medicore.hospital', 14, 200.00, 5.0, 'Available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "consultationFee" = EXCLUDED."consultationFee", "status" = EXCLUDED."status";

-- ---------------------------------------------------------------------
-- Doctor Schedules
-- ---------------------------------------------------------------------
INSERT INTO "DoctorSchedule" ("id", "doctorId", "dayOfWeek", "startTime", "endTime", "room", "available", "consultationDuration", "createdAt", "updatedAt") VALUES
('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Monday', '09:00 AM', '01:00 PM', 'Room 101', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Wednesday', '09:00 AM', '01:00 PM', 'Room 101', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('41000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'Friday', '02:00 PM', '06:00 PM', 'Room 101', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('41000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', 'Tuesday', '09:00 AM', '05:00 PM', 'Room 102', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('41000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', 'Thursday', '09:00 AM', '05:00 PM', 'Room 102', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "startTime" = EXCLUDED."startTime", "endTime" = EXCLUDED."endTime";

-- ---------------------------------------------------------------------
-- Patients
-- ---------------------------------------------------------------------
INSERT INTO "Patient" ("id", "patientId", "firstName", "lastName", "fullName", "dateOfBirth", "age", "gender", "NIC", "bloodGroup", "phone", "email", "address", "emergencyContactName", "emergencyContactRel", "emergencyContactPhone", "allergies", "chronicConditions", "status", "primaryDepartment", "assignedDoctorId", "registeredDate", "createdAt", "updatedAt") VALUES
('50000000-0000-0000-0000-000000000001', 'P-10042', 'Eleanor', 'Vance', 'Eleanor Vance', '1982-05-14 00:00:00.000', 44, 'Female', 'NIC-9940129', 'A+', '+1 (555) 392-1048', 'eleanor.vance@example.com', '{"street":"742 Evergreen Terrace","city":"Springfield","province":"NY"}', 'John Vance', 'Spouse', '+1 (555) 991-2041', '["Penicillin","Peanuts"]', '["Hypertension","Type 2 Diabetes"]', 'Active', 'Cardiology', '40000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('50000000-0000-0000-0000-000000000002', 'P-10043', 'Robert', 'Sterling', 'Robert Sterling', '1968-11-20 00:00:00.000', 58, 'Male', 'NIC-8830182', 'O+', '+1 (555) 392-1049', 'robert.sterling@example.com', '{"street":"104 Elm St","city":"Boston","province":"MA"}', 'Mary Sterling', 'Wife', '+1 (555) 991-2042', '["Aspirin"]', '["Coronary Artery Disease"]', 'Active', 'General Medicine', '40000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('50000000-0000-0000-0000-000000000003', 'P-10044', 'Sophia', 'Martinez', 'Sophia Martinez', '1997-03-08 00:00:00.000', 29, 'Female', 'NIC-7720194', 'B+', '+1 (555) 392-1050', 'sophia.martinez@example.com', '{"street":"52 Maple Ave","city":"Austin","province":"TX"}', 'Carlos Martinez', 'Father', '+1 (555) 991-2043', '[]', '["Asthma"]', 'Active', 'Pediatrics', '40000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('50000000-0000-0000-0000-000000000004', 'P-10045', 'Marcus', 'Brody', 'Marcus Brody', '1964-07-22 00:00:00.000', 62, 'Male', 'NIC-6610283', 'AB-', '+1 (555) 392-1051', 'marcus.brody@example.com', '{"street":"88 River Rd","city":"Seattle","province":"WA"}', 'Linda Brody', 'Daughter', '+1 (555) 991-2044', '["Sulfa Drugs"]', '["Osteoarthritis"]', 'Active', 'Orthopedics', '40000000-0000-0000-0000-000000000004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('50000000-0000-0000-0000-000000000005', 'P-10046', 'Arthur', 'Pendelton', 'Arthur Pendelton', '1955-09-12 00:00:00.000', 71, 'Male', 'NIC-5500174', 'O-', '+1 (555) 392-1052', 'arthur.pendelton@example.com', '{"street":"33 Oak Lane","city":"Denver","province":"CO"}', 'Emily Pendelton', 'Daughter', '+1 (555) 991-2045', '["Latex"]', '["Parkinsons Disease"]', 'Active', 'Neurology', '40000000-0000-0000-0000-000000000005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "fullName" = EXCLUDED."fullName", "phone" = EXCLUDED."phone", "status" = EXCLUDED."status";

-- ---------------------------------------------------------------------
-- Medicine Categories
-- ---------------------------------------------------------------------
INSERT INTO "MedicineCategory" ("id", "name", "description") VALUES
('60000000-0000-0000-0000-000000000001', 'Antibiotic', 'Antibacterial and anti-infective medications'),
('60000000-0000-0000-0000-000000000002', 'Analgesic', 'Pain relief and antipyretic medications'),
('60000000-0000-0000-0000-000000000003', 'Antidiabetic', 'Blood glucose controlling medications'),
('60000000-0000-0000-0000-000000000004', 'Cardiovascular', 'Blood pressure and cardiac medications'),
('60000000-0000-0000-0000-000000000005', 'Antacid', 'Gastrointestinal and acid reduction medications')
ON CONFLICT ("id") DO UPDATE SET "description" = EXCLUDED."description";

-- ---------------------------------------------------------------------
-- Medicines
-- ---------------------------------------------------------------------
INSERT INTO "Medicine" ("id", "medicineId", "name", "genericName", "categoryId", "categoryName", "dosageForm", "strength", "manufacturer", "batchNumber", "quantityInStock", "reorderLevel", "unitPrice", "expiryDate", "location", "status", "createdAt", "updatedAt") VALUES
('61000000-0000-0000-0000-000000000001', 'MED-0124', 'Amoxicillin', 'Amoxicillin Trihydrate', '60000000-0000-0000-0000-000000000001', 'Antibiotic', 'Capsule', '500mg', 'PharmaCorp', 'BAT-2026-90', 250, 50, 12.50, '2027-08-15 00:00:00.000', 'Shelf A-01', 'In Stock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('61000000-0000-0000-0000-000000000002', 'MED-0125', 'Paracetamol', 'Acetaminophen', '60000000-0000-0000-0000-000000000002', 'Analgesic', 'Tablet', '500mg', 'HealthCare Inc', 'BAT-2026-88', 15, 30, 4.50, '2026-12-31 00:00:00.000', 'Shelf A-02', 'Low Stock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('61000000-0000-0000-0000-000000000003', 'MED-0126', 'Metformin', 'Metformin Hydrochloride', '60000000-0000-0000-0000-000000000003', 'Antidiabetic', 'Tablet', '850mg', 'BioMed LLC', 'BAT-2026-74', 120, 40, 18.00, '2027-04-20 00:00:00.000', 'Shelf B-04', 'In Stock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('61000000-0000-0000-0000-000000000004', 'MED-0127', 'Atorvastatin', 'Atorvastatin Calcium', '60000000-0000-0000-0000-000000000004', 'Cardiovascular', 'Tablet', '20mg', 'CardioPharma', 'BAT-2026-61', 85, 25, 24.00, '2026-10-10 00:00:00.000', 'Shelf C-01', 'In Stock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('61000000-0000-0000-0000-000000000005', 'MED-0128', 'Omeprazole', 'Omeprazole Magnesium', '60000000-0000-0000-0000-000000000005', 'Antacid', 'Capsule', '20mg', 'GastroLabs', 'BAT-2026-55', 0, 20, 15.00, '2027-01-15 00:00:00.000', 'Shelf B-02', 'Out of Stock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "quantityInStock" = EXCLUDED."quantityInStock", "unitPrice" = EXCLUDED."unitPrice", "status" = EXCLUDED."status";

-- ---------------------------------------------------------------------
-- Laboratory Tests
-- ---------------------------------------------------------------------
INSERT INTO "LaboratoryTest" ("id", "testCode", "testName", "category", "price", "referenceRange", "unit", "sampleType", "status", "createdAt", "updatedAt") VALUES
('70000000-0000-0000-0000-000000000001', 'LAB-CBC', 'Complete Blood Count (CBC)', 'Hematology', 45.00, '4.5 - 11.0', '10^3/uL', 'Whole Blood (EDTA)', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('70000000-0000-0000-0000-000000000002', 'LAB-LIPID', 'Lipid Profile Panel', 'Biochemistry', 65.00, '< 200', 'mg/dL', 'Serum', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('70000000-0000-0000-0000-000000000003', 'LAB-GLUC', 'Fasting Blood Glucose', 'Biochemistry', 25.00, '70 - 99', 'mg/dL', 'Plasma (Fluoride)', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('70000000-0000-0000-0000-000000000004', 'LAB-LFT', 'Liver Function Test (LFT)', 'Biochemistry', 75.00, 'ALT: 7-56, AST: 10-40', 'U/L', 'Serum', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('70000000-0000-0000-0000-000000000005', 'LAB-URINE', 'Urinalysis Comprehensive', 'Pathology', 30.00, 'Normal', 'N/A', 'Urine Sample', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('70000000-0000-0000-0000-000000000006', 'LAB-TSH', 'Thyroid Stimulating Hormone (TSH)', 'Biochemistry', 55.00, '0.4 - 4.0', 'uIU/mL', 'Serum', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "price" = EXCLUDED."price", "referenceRange" = EXCLUDED."referenceRange";

-- ---------------------------------------------------------------------
-- Wards
-- ---------------------------------------------------------------------
INSERT INTO "Ward" ("id", "wardName", "description", "dailyRate", "createdAt", "updatedAt") VALUES
('80000000-0000-0000-0000-000000000001', 'ICU', 'Intensive Care Unit for critical patients', 500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('80000000-0000-0000-0000-000000000002', 'General Ward A', 'Standard inpatient male ward', 150.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('80000000-0000-0000-0000-000000000003', 'General Ward B', 'Standard inpatient female ward', 150.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('80000000-0000-0000-0000-000000000004', 'Surgical Ward', 'Post-operative recovery and monitoring', 250.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('80000000-0000-0000-0000-000000000005', 'Pediatric Ward', 'Children inpatient care unit', 200.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('80000000-0000-0000-0000-000000000006', 'Private Suite', 'Executive luxury private recovery room', 450.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "dailyRate" = EXCLUDED."dailyRate";

-- ---------------------------------------------------------------------
-- Beds
-- ---------------------------------------------------------------------
INSERT INTO "Bed" ("id", "bedNumber", "roomNumber", "roomId", "wardId", "wardName", "status", "dailyRate", "createdAt", "updatedAt") VALUES
('81000000-0000-0000-0000-000000000001', 'ICU-B01', 'R-1', NULL, '80000000-0000-0000-0000-000000000001', 'ICU', 'Occupied', 500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('81000000-0000-0000-0000-000000000002', 'ICU-B02', 'R-2', NULL, '80000000-0000-0000-0000-000000000001', 'ICU', 'Available', 500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('81000000-0000-0000-0000-000000000003', 'ICU-B03', 'R-3', NULL, '80000000-0000-0000-0000-000000000001', 'ICU', 'Available', 500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('81000000-0000-0000-0000-000000000004', 'ICU-B04', 'R-4', NULL, '80000000-0000-0000-0000-000000000001', 'ICU', 'Available', 500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('81000000-0000-0000-0000-000000000005', 'GEN-B01', 'R-1', NULL, '80000000-0000-0000-0000-000000000002', 'General Ward A', 'Occupied', 150.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('81000000-0000-0000-0000-000000000006', 'GEN-B02', 'R-2', NULL, '80000000-0000-0000-0000-000000000002', 'General Ward A', 'Available', 150.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('81000000-0000-0000-0000-000000000007', 'GEN-B03', 'R-3', NULL, '80000000-0000-0000-0000-000000000002', 'General Ward A', 'Available', 150.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('81000000-0000-0000-0000-000000000008', 'GEN-B04', 'R-4', NULL, '80000000-0000-0000-0000-000000000002', 'General Ward A', 'Available', 150.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('81000000-0000-0000-0000-000000000009', 'SUR-B01', 'R-1', NULL, '80000000-0000-0000-0000-000000000004', 'Surgical Ward', 'Available', 250.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('81000000-0000-0000-0000-000000000010', 'SUR-B02', 'R-2', NULL, '80000000-0000-0000-0000-000000000004', 'Surgical Ward', 'Available', 250.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('81000000-0000-0000-0000-000000000011', 'PRI-B01', 'R-1', NULL, '80000000-0000-0000-0000-000000000006', 'Private Suite', 'Available', 450.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('81000000-0000-0000-0000-000000000012', 'PRI-B02', 'R-2', NULL, '80000000-0000-0000-0000-000000000006', 'Private Suite', 'Available', 450.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "status" = EXCLUDED."status", "dailyRate" = EXCLUDED."dailyRate";

-- ---------------------------------------------------------------------
-- System Setting
-- ---------------------------------------------------------------------
INSERT INTO "SystemSetting" ("id", "hospitalName", "hospitalAddress", "contactNumber", "email", "workingHours", "sessionTimeout", "currency", "timezone", "createdAt", "updatedAt") VALUES
('90000000-0000-0000-0000-000000000001', 'MediCore Hospital', '124 Healthcare Boulevard, Medical District, NY 10001', '+1 (555) 234-5678', 'admin@medicore.hospital', 'Mon-Sun: 24/7 Emergency | Clinic: 08:00 AM - 08:00 PM', '30m', 'USD', 'America/New_York', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "hospitalName" = EXCLUDED."hospitalName", "hospitalAddress" = EXCLUDED."hospitalAddress";

-- =====================================================================
-- End of MediCore HMS Supabase (PostgreSQL) Schema
-- =====================================================================
