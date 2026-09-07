
import { VitalSigns } from './patient';

export interface PrescriptionItem {
  medicineName: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "TDS (3x daily)"
  duration: string; // e.g. "5 days"
  quantity: number;
  instructions: string;
}

export interface MedicalRecord {
  id: string;
  recordNumber: string; // e.g. "EMR-2026-081"
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  visitDate: string;
  chiefComplaint: string;
  symptoms: string[];
  diagnosisCode: string; // e.g. "I10 - Essential Hypertension"
  diagnosisDescription: string;
  vitals: VitalSigns;
  clinicalNotes: string;
  treatmentPlan: string;
  prescriptions: PrescriptionItem[];
  orderedLabTests?: string[];
  followUpDate?: string;
  createdAt: string;
}
