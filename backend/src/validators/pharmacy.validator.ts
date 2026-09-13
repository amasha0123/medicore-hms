import { z } from 'zod';

export const createMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Medicine name is required'),
    genericName: z.string().min(1, 'Generic name is required'),
    categoryName: z.string().min(1, 'Category name is required'),
    dosageForm: z.enum(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Inhaler']),
    strength: z.string().min(1, 'Strength is required'),
    manufacturer: z.string().min(1, 'Manufacturer is required'),
    batchNumber: z.string().min(1, 'Batch number is required'),
    quantityInStock: z.number().int().nonnegative(),
    reorderLevel: z.number().int().positive(),
    unitPrice: z.number().positive(),
    expiryDate: z.string().refine((val) => !isNaN(Date.parse(val))),
    location: z.string().min(1, 'Location is required')
  })
});

export const updateMedicineSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: createMedicineSchema.shape.body.partial()
});

export const stockAdjustmentSchema = z.object({
  body: z.object({
    medicineId: z.string().uuid(),
    quantity: z.number().int().positive('Quantity must be greater than zero'),
    notes: z.string().optional()
  })
});

export const dispensePrescriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    items: z.array(
      z.object({
        medicineId: z.string().uuid(),
        quantityToDispense: z.number().int().positive()
      })
    ),
    notes: z.string().optional()
  })
});
