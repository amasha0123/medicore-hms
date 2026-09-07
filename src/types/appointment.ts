
export type AppointmentStatus = 
  | 'Scheduled' 
  | 'Confirmed' 
  | 'Checked In' 
  | 'In Progress' 
  | 'Completed' 
  | 'Cancelled' 
  | 'No Show';

export type AppointmentType = 'General Checkup' | 'Follow-up' | 'Emergency' | 'Routine Consult' | 'Specialist Consultation';

export interface Appointment {
  id: string;
  appointmentNumber: string; // e.g. "APT-2026-0042"
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  room?: string;
  createdAt: string;
}
