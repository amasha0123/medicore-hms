
export type InvoiceStatus = 'Paid' | 'Pending' | 'Partially Paid' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Insurance';

export interface InvoiceLineItem {
  id: string;
  serviceCategory: 'Consultation' | 'Laboratory' | 'Pharmacy' | 'Admission' | 'Surgery' | 'Nursing';
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-089"
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAddress: string;
  date: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string; // e.g. "PAY-2026-052"
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  receivedBy: string;
  status: 'Successful' | 'Refunded';
}
