import { z } from 'zod';

export const createAdmissionSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    attendingDoctorId: z.string().uuid(),
    wardId: z.string().uuid(),
    bedId: z.string().uuid(),
    expectedDischargeDate: z.string().optional(),
    diagnosis: z.string().min(1, 'Admission diagnosis is required'),
    emergencyContact: z.string().min(1, 'Emergency contact is required'),
    insuranceProvider: z.string().optional()
  })
});

export const updateBedStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(['Available', 'Occupied', 'Reserved', 'Maintenance'])
  })
});
