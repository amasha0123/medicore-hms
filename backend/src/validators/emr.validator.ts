import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid(),
    appointmentId: z.string().uuid().optional(),
    visitDate: z.string().optional(),
    chiefComplaint: z.string().min(1, 'Chief complaint is required'),
    symptoms: z.string().min(1, 'Symptoms are required'),
    diagnosis: z.string().min(1, 'Diagnosis is required'),
    diagnosisCode: z.string().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    temperature: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    treatment: z.string().min(1, 'Treatment plan is required'),
    notes: z.string().optional()
  })
});

export const updateMedicalRecordSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: createMedicalRecordSchema.shape.body.partial()
});
