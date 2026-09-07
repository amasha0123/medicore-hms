
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';
export type PatientStatus = 'Active' | 'Inpatient' | 'Discharged' | 'Critical';

export interface VitalSigns {
  bloodPressure: string; // e.g. "120/80"
  heartRate: number; // bpm
  temperature: number; // °C
  respiratoryRate: number; // breaths/min
  oxygenSaturation: number; // SpO2 %
  bmi?: number;
  weightKg?: number;
  heightCm?: number;
  recordedAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface MedicalHistoryItem {
  id: string;
  date: string;
  type: 'Consultation' | 'Surgery' | 'Hospitalization' | 'Lab Result' | 'Prescription';
  title: string;
  doctorName: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

export interface PatientDocument {
  id: string;
  title: string;
  category: 'ID Proof' | 'Lab Report' | 'Radiology' | 'Insurance' | 'Discharge Summary';
  uploadDate: string;
  fileSize: string;
  fileType: string;
}

export interface Patient {
  id: string;
  patientNumber: string; // e.g. "P-10042"
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  bloodGroup: BloodGroup;
  nationalId: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    province: string;
  };
  emergencyContact: EmergencyContact;
  allergies: string[];
  chronicConditions: string[];
  status: PatientStatus;
  primaryDepartment: string;
  registeredDate: string;
  lastVisit: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  vitals?: VitalSigns;
  medicalHistory?: MedicalHistoryItem[];
  documents?: PatientDocument[];
}
