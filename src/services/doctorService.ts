
import { Doctor } from '../types/doctor';
import { INITIAL_DOCTORS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';

const DOCTORS_KEY = 'medicore_doctors';

export const doctorService = {
  getAll(): Doctor[] {
    return getStoredItem<Doctor[]>(DOCTORS_KEY, INITIAL_DOCTORS);
  },

  getById(id: string): Doctor | undefined {
    return this.getAll().find(d => d.id === id || d.doctorId === id);
  },

  getDepartments(): string[] {
    const doctors = this.getAll();
    return Array.from(new Set(doctors.map(d => d.department)));
  },

  create(data: Omit<Doctor, 'id' | 'doctorId'>): Doctor {
    const docs = this.getAll();
    const newDoc: Doctor = {
      ...data,
      id: `doc-0${docs.length + 1}`,
      doctorId: `DOC-${100 + docs.length + 1}`
    };
    setStoredItem(DOCTORS_KEY, [...docs, newDoc]);
    return newDoc;
  }
};
