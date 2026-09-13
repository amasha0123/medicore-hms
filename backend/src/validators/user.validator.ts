import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(8),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT']),
    departmentId: z.string().optional()
  })
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT'])
  })
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    isActive: z.boolean()
  })
});

export const adminResetPasswordSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    newPassword: z.string().min(8)
  })
});

export const approveUserSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT']),
    departmentId: z.string().optional()
  })
});

export const rejectUserSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});
