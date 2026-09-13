import { z } from 'zod';

export const createDoctorSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    name: z.string().optional(),
    registrationNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    specialization: z.string().min(1, 'Specialization is required'),
    departmentId: z.string().optional(),
    department: z.string().optional(),
    phone: z.string().min(5, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
    experienceYears: z.union([z.number(), z.string()]).transform(val => Number(val) || 0).optional(),
    consultationFee: z.union([z.number(), z.string()]).transform(val => Number(val) || 100).optional(),
    profileImage: z.string().optional(),
    status: z.enum(['Available', 'On Leave', 'In Consultation', 'Off Duty']).optional()
  })
});

export const updateDoctorSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: createDoctorSchema.shape.body.partial()
});

export const doctorScheduleSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    schedules: z.array(
      z.object({
        dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        startTime: z.string(),
        endTime: z.string(),
        room: z.string().optional(),
        available: z.boolean().optional(),
        consultationDuration: z.number().positive().optional()
      })
    )
  })
});
