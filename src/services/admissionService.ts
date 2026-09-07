
import { Bed, AdmissionRecord, BedStatus } from '../types/admission';
import { INITIAL_BEDS, INITIAL_ADMISSIONS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';

const BEDS_KEY = 'medicore_beds';
const ADMISSIONS_KEY = 'medicore_admissions';

export const admissionService = {
  getBeds(): Bed[] {
    return getStoredItem<Bed[]>(BEDS_KEY, INITIAL_BEDS);
  },

  getAdmissions(): AdmissionRecord[] {
    return getStoredItem<AdmissionRecord[]>(ADMISSIONS_KEY, INITIAL_ADMISSIONS);
  },

  admitPatient(data: Omit<AdmissionRecord, 'id' | 'admissionNumber' | 'status'>): AdmissionRecord {
    const admissions = this.getAdmissions();
    const beds = this.getBeds();

    const newAdmission: AdmissionRecord = {
      ...data,
      id: `adm-${Date.now().toString(36)}`,
      admissionNumber: `ADM-2026-0${30 + admissions.length + 1}`,
      status: 'Admitted'
    };

    // Update bed to Occupied
    const updatedBeds = beds.map(b => {
      if (b.bedNumber === data.bedNumber) {
        return {
          ...b,
          status: 'Occupied' as BedStatus,
          currentPatientId: data.patientId,
          currentPatientName: data.patientName,
          admittedDate: data.admissionDate,
          attendingDoctorName: data.attendingDoctorName
        };
      }
      return b;
    });

    setStoredItem(BEDS_KEY, updatedBeds);
    setStoredItem(ADMISSIONS_KEY, [newAdmission, ...admissions]);

    auditService.log({
      userId: 'nurse-01',
      userName: 'Priya Patel, RN',
      userRole: 'NURSE',
      action: 'ADMIT',
      module: 'ADMISSIONS',
      recordIdentifier: newAdmission.admissionNumber,
      details: `Admitted ${data.patientName} to Ward ${data.ward}, Bed ${data.bedNumber}`
    });

    return newAdmission;
  },

  dischargePatient(admissionId: string, bedNumber: string): void {
    const admissions = this.getAdmissions();
    const beds = this.getBeds();

    const updatedAdmissions = admissions.map(a => {
      if (a.id === admissionId) {
        return {
          ...a,
          status: 'Discharged' as AdmissionRecord['status'],
          actualDischargeDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return a;
    });

    const updatedBeds = beds.map(b => {
      if (b.bedNumber === bedNumber) {
        return {
          ...b,
          status: 'Available' as BedStatus,
          currentPatientId: undefined,
          currentPatientName: undefined,
          admittedDate: undefined,
          attendingDoctorName: undefined
        };
      }
      return b;
    });

    setStoredItem(ADMISSIONS_KEY, updatedAdmissions);
    setStoredItem(BEDS_KEY, updatedBeds);

    auditService.log({
      userId: 'doc-01',
      userName: 'Dr. Michael Chen',
      userRole: 'DOCTOR',
      action: 'DISCHARGE',
      module: 'ADMISSIONS',
      recordIdentifier: admissionId,
      details: `Discharged patient from bed ${bedNumber}`
    });
  }
};
