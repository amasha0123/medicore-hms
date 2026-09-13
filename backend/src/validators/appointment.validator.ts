import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string().uuid('Invalid patient ID'),
    doctorId: z.string().uuid('Invalid doctor ID'),
    departmentId: z.string().optional(),
    appointmentDate: z.string().optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    time: z.string().optional(),
    endTime: z.string().optional(),
    appointmentType: z.string().optional(),
    type: z.string().optional(),
    reason: z.string().optional(),
    notes: z.string().optional(),
    room: z.string().optional()
  })
});

export const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
  })
});

export const rescheduleAppointmentSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val))),
    startTime: z.string().min(1, 'New start time required'),
    endTime: z.string().optional(),
    notes: z.string().optional()
  })
});
