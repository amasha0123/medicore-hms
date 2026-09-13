import { z } from 'zod';

export const createPatientSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    fullName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    NIC: z.string().optional(),
    nationalId: z.string().optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    phone: z.string().min(5, 'Phone number must be valid').optional(),
    email: z.string().email('Invalid email address').optional(),
    address: z.union([
      z.string(),
      z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional()
      })
    ]).optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional()
    }).optional(),
    allergies: z.union([z.array(z.string()), z.string()]).optional(),
    chronicConditions: z.union([z.array(z.string()), z.string()]).optional(),
    status: z.enum(['Active', 'Inpatient', 'Discharged', 'Critical']).optional(),
    primaryDepartment: z.string().optional(),
    assignedDoctorId: z.string().optional()
  })
});

export const updatePatientSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid patient ID format')
  }),
  body: createPatientSchema.shape.body.partial()
});

export const queryPatientsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    q: z.string().optional(),
    gender: z.string().optional(),
    bloodGroup: z.string().optional(),
    status: z.string().optional(),
    department: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});
