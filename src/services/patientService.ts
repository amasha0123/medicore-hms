
import { Patient } from '../types/patient';
import { INITIAL_PATIENTS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';

const PATIENTS_KEY = 'medicore_patients';

export const patientService = {
  getAll(): Patient[] {
    return getStoredItem<Patient[]>(PATIENTS_KEY, INITIAL_PATIENTS);
  },

  getById(id: string): Patient | undefined {
    const patients = this.getAll();
    return patients.find(p => p.id === id || p.patientNumber.toLowerCase() === id.toLowerCase());
  },

  create(patientData: Omit<Patient, 'id' | 'patientNumber' | 'registeredDate'>): Patient {
    const patients = this.getAll();
    const nextNum = 1000 + patients.length + 1;
    const newPatient: Patient = {
      ...patientData,
      id: `p-${nextNum}`,
      patientNumber: `P-${nextNum}`,
      registeredDate: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0]
    };
    const updated = [newPatient, ...patients];
    setStoredItem(PATIENTS_KEY, updated);

    auditService.log({
      userId: 'staff',
      userName: 'Hospital Staff',
      userRole: 'RECEPTIONIST',
      action: 'CREATE',
      module: 'PATIENT',
      recordIdentifier: newPatient.patientNumber,
      details: `Registered new patient ${newPatient.fullName}`
    });

    return newPatient;
  },

  update(id: string, updates: Partial<Patient>): Patient {
    const patients = this.getAll();
    let updated: Patient | null = null;
    const next = patients.map(p => {
      if (p.id === id) {
        updated = { ...p, ...updates };
        return updated;
      }
      return p;
    });
    setStoredItem(PATIENTS_KEY, next);

    if (updated) {
      auditService.log({
        userId: 'staff',
        userName: 'Clinical Staff',
        userRole: 'DOCTOR',
        action: 'UPDATE',
        module: 'PATIENT',
        recordIdentifier: (updated as Patient).patientNumber,
        details: `Updated clinical details for patient ${(updated as Patient).fullName}`
      });
    }

    return updated!;
  },

  delete(id: string): void {
    const patients = this.getAll();
    const target = patients.find(p => p.id === id);
    const next = patients.filter(p => p.id !== id);
    setStoredItem(PATIENTS_KEY, next);

    if (target) {
      auditService.log({
        userId: 'admin',
        userName: 'Administrator',
        userRole: 'ADMIN',
        action: 'DELETE',
        module: 'PATIENT',
        recordIdentifier: target.patientNumber,
        details: `Removed patient record for ${target.fullName}`,
        status: 'WARNING'
      });
    }
  }
};
