
export type OutpatientQueueStatus = 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';

export interface OutpatientQueueItem {
  id: string;
  queueNumber: string; // e.g. "Q-101"
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  arrivalTime: string;
  priority: 'Normal' | 'Priority' | 'Emergency';
  status: OutpatientQueueStatus;
  consultationStartTime?: string;
  notes?: string;
}
