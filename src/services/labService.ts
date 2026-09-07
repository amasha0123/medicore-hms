
import { LaboratoryTest, SampleStatus } from '../types/laboratory';
import { INITIAL_LAB_TESTS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';

const LAB_KEY = 'medicore_lab_tests';

export const labService = {
  getAll(): LaboratoryTest[] {
    return getStoredItem<LaboratoryTest[]>(LAB_KEY, INITIAL_LAB_TESTS);
  },

  getById(id: string): LaboratoryTest | undefined {
    return this.getAll().find(t => t.id === id || t.testCode === id);
  },

  createRequest(data: Omit<LaboratoryTest, 'id' | 'testCode' | 'sampleStatus'>): LaboratoryTest {
    const tests = this.getAll();
    const newTest: LaboratoryTest = {
      ...data,
      id: `lab-${Date.now().toString(36)}`,
      testCode: `LAB-2026-0${120 + tests.length + 1}`,
      sampleStatus: 'Requested'
    };
    setStoredItem(LAB_KEY, [newTest, ...tests]);

    auditService.log({
      userId: 'doc',
      userName: data.doctorName,
      userRole: 'DOCTOR',
      action: 'CREATE',
      module: 'LABORATORY',
      recordIdentifier: newTest.testCode,
      details: `Ordered laboratory test ${newTest.testName} for ${newTest.patientName} (Priority: ${newTest.priority})`
    });

    return newTest;
  },

  updateStatus(id: string, sampleStatus: SampleStatus): LaboratoryTest {
    const tests = this.getAll();
    let updated: LaboratoryTest | null = null;
    const next = tests.map(t => {
      if (t.id === id) {
        updated = {
          ...t,
          sampleStatus,
          sampleCollectedDate: sampleStatus === 'Sample Collected' && !t.sampleCollectedDate ? new Date().toISOString().replace('T', ' ').substring(0, 16) : t.sampleCollectedDate,
          completedDate: sampleStatus === 'Completed' && !t.completedDate ? new Date().toISOString().replace('T', ' ').substring(0, 16) : t.completedDate
        };
        return updated;
      }
      return t;
    });
    setStoredItem(LAB_KEY, next);
    return updated!;
  },

  enterResults(id: string, results: LaboratoryTest['results'], remarks?: string): LaboratoryTest {
    const tests = this.getAll();
    let updated: LaboratoryTest | null = null;
    const next = tests.map(t => {
      if (t.id === id) {
        updated = {
          ...t,
          results,
          pathologistRemarks: remarks,
          sampleStatus: 'Completed',
          completedDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        return updated;
      }
      return t;
    });
    setStoredItem(LAB_KEY, next);

    if (updated) {
      auditService.log({
        userId: 'lab-staff',
        userName: 'Marco Garcia, MLS',
        userRole: 'LAB_STAFF',
        action: 'UPDATE',
        module: 'LABORATORY',
        recordIdentifier: (updated as LaboratoryTest).testCode,
        details: `Entered and finalized diagnostic results for ${(updated as LaboratoryTest).testName}`
      });
    }

    return updated!;
  }
};
