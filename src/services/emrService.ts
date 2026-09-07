
import { MedicalRecord } from '../types/emr';
import { INITIAL_EMR_RECORDS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';

const EMR_KEY = 'medicore_emr_records';

export const emrService = {
  getAll(): MedicalRecord[] {
    return getStoredItem<MedicalRecord[]>(EMR_KEY, INITIAL_EMR_RECORDS);
  },

  getByPatientId(patientId: string): MedicalRecord[] {
    return this.getAll().filter(r => r.patientId === patientId);
  },

  getById(id: string): MedicalRecord | undefined {
    return this.getAll().find(r => r.id === id || r.recordNumber === id);
  },

  create(data: Omit<MedicalRecord, 'id' | 'recordNumber' | 'createdAt'>): MedicalRecord {
    const list = this.getAll();
    const newRecord: MedicalRecord = {
      ...data,
      id: `emr-${Date.now().toString(36)}`,
      recordNumber: `EMR-2026-0${80 + list.length + 1}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setStoredItem(EMR_KEY, [newRecord, ...list]);

    auditService.log({
      userId: 'doc-01',
      userName: data.doctorName,
      userRole: 'DOCTOR',
      action: 'CREATE',
      module: 'EMR',
      recordIdentifier: newRecord.recordNumber,
      details: `Created clinical encounter for ${data.patientName}: ${data.diagnosisCode} - ${data.diagnosisDescription}`
    });

    return newRecord;
  }
};
