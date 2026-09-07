
export type LabTestPriority = 'Normal' | 'Urgent' | 'Critical';
export type SampleStatus = 'Requested' | 'Sample Collected' | 'Processing' | 'Completed';

export interface LabResultItem {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
}

export interface LaboratoryTest {
  id: string;
  testCode: string; // e.g. "LAB-2026-012"
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Radiology' | 'Pathology';
  requestedDate: string;
  sampleCollectedDate?: string;
  completedDate?: string;
  priority: LabTestPriority;
  sampleStatus: SampleStatus;
  sampleType: string; // e.g. "Venous Blood", "Urine", "Swab"
  results?: LabResultItem[];
  technicianNotes?: string;
  pathologistRemarks?: string;
  attachmentName?: string;
}
