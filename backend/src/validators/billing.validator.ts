import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val))),
    discountPercentage: z.number().nonnegative().max(100).optional(),
    taxPercentage: z.number().nonnegative().max(100).optional(),
    items: z.array(
      z.object({
        serviceCategory: z.enum(['Consultation', 'Laboratory', 'Pharmacy', 'Admission', 'Surgery', 'Nursing', 'Other']),
        description: z.string().min(1, 'Item description required'),
        unitPrice: z.number().positive('Price must be positive'),
        quantity: z.number().int().positive('Quantity must be positive')
      })
    ).min(1, 'At least one invoice item is required'),
    notes: z.string().optional()
  })
});

export const recordPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().uuid(),
    patientId: z.string().uuid(),
    amount: z.number().positive('Payment amount must be positive'),
    paymentMethod: z.enum(['Cash', 'Card', 'Bank Transfer', 'Insurance']),
    transactionRef: z.string().optional(),
    receivedBy: z.string().optional()
  })
});
