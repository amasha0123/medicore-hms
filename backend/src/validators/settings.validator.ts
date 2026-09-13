import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    hospitalName: z.string().min(1).optional(),
    hospitalAddress: z.string().min(1).optional(),
    contactNumber: z.string().min(1).optional(),
    email: z.string().email().optional(),
    workingHours: z.string().optional(),
    sessionTimeout: z.string().optional(),
    currency: z.string().optional(),
    timezone: z.string().optional()
  })
});
