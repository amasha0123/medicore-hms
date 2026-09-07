
export interface WorkingSchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  room: string;
}

export interface Doctor {
  id: string;
  doctorId: string; // e.g. "DOC-101"
  name: string;
  specialization: string;
  department: string;
  email: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  consultationFee: number;
  workingDays: string[];
  schedule: WorkingSchedule[];
  status: 'Available' | 'On Leave' | 'In Consultation' | 'Off Duty';
  avatar?: string;
  rating: number;
}
