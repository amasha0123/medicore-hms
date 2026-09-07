
export type BedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
export type AdmissionStatus = 'Admitted' | 'Under Treatment' | 'Ready for Discharge' | 'Discharged';

export interface Bed {
  id: string;
  bedNumber: string; // e.g. "B-101"
  roomNumber: string; // e.g. "R-10"
  ward: 'ICU' | 'General Ward A' | 'General Ward B' | 'Surgical Ward' | 'Pediatric Ward' | 'Private Suite';
  status: BedStatus;
  dailyRate: number;
  currentPatientId?: string;
  currentPatientName?: string;
  admittedDate?: string;
  attendingDoctorName?: string;
}

export interface AdmissionRecord {
  id: string;
  admissionNumber: string; // e.g. "ADM-2026-033"
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  ward: string;
  roomNumber: string;
  bedNumber: string;
  attendingDoctorId: string;
  attendingDoctorName: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  diagnosis: string;
  status: AdmissionStatus;
  emergencyContact: string;
  insuranceProvider?: string;
}
