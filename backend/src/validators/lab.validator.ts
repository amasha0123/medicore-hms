import { z } from 'zod';

export const createLabRequestSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid(),
    testName: z.string().min(1, 'Test name is required'),
    category: z.enum(['Hematology', 'Biochemistry', 'Microbiology', 'Radiology', 'Pathology']),
    priority: z.enum(['Normal', 'Urgent', 'Critical']).optional(),
    sampleType: z.string().min(1, 'Sample type is required'),
    notes: z.string().optional()
  })
});

export const updateLabStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(['Requested', 'Sample Collected', 'Processing', 'Completed'])
  })
});

export const createLabResultSchema = z.object({
  body: z.object({
    requestId: z.string().uuid(),
    patientId: z.string().uuid(),
    testName: z.string().min(1),
    results: z.array(
      z.object({
        parameter: z.string(),
        value: z.string(),
        unit: z.string(),
        referenceRange: z.string(),
        isAbnormal: z.boolean()
      })
    ),
    technicianNotes: z.string().optional(),
    pathologistRemarks: z.string().optional(),
    attachmentName: z.string().optional(),
    performedBy: z.string().min(1)
  })
});
