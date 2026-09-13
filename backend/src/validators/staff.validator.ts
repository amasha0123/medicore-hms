import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_STAFF', 'PHARMACIST', 'ACCOUNTANT']),
    departmentId: z.string().optional(),
    email: z.string().email(),
    phone: z.string().min(7),
    joinDate: z.string().refine((val) => !isNaN(Date.parse(val))),
    qualification: z.string().min(1),
    shift: z.enum(['Morning', 'Evening', 'Night', 'Rotating']).optional()
  })
});

export const attendanceCheckInSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid(),
    notes: z.string().optional()
  })
});

export const createLeaveRequestSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid(),
    leaveType: z.enum(['Annual Leave', 'Sick Leave', 'Maternity/Paternity', 'Casual Leave', 'Emergency']),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val))),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val))),
    reason: z.string().min(1, 'Reason for leave required')
  })
});
