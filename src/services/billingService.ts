
import { Invoice, Payment } from '../types/billing';
import { INITIAL_INVOICES, INITIAL_PAYMENTS } from '../data/mockData';
import { getStoredItem, setStoredItem } from './storage';
import { auditService } from './auditService';

const INVOICES_KEY = 'medicore_invoices';
const PAYMENTS_KEY = 'medicore_payments';

export const billingService = {
  getInvoices(): Invoice[] {
    return getStoredItem<Invoice[]>(INVOICES_KEY, INITIAL_INVOICES);
  },

  getInvoiceById(id: string): Invoice | undefined {
    return this.getInvoices().find(i => i.id === id || i.invoiceNumber === id);
  },

  getPayments(): Payment[] {
    return getStoredItem<Payment[]>(PAYMENTS_KEY, INITIAL_PAYMENTS);
  },

  createInvoice(data: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice {
    const invoices = this.getInvoices();
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now().toString(36)}`,
      invoiceNumber: `INV-2026-0${89 + invoices.length + 1}`
    };
    setStoredItem(INVOICES_KEY, [newInvoice, ...invoices]);

    auditService.log({
      userId: 'acc-01',
      userName: 'David Sterling, CPA',
      userRole: 'ACCOUNTANT',
      action: 'GENERATE_INVOICE',
      module: 'BILLING',
      recordIdentifier: newInvoice.invoiceNumber,
      details: `Generated invoice of $${newInvoice.totalAmount.toFixed(2)} for ${newInvoice.patientName}`
    });

    return newInvoice;
  },

  recordPayment(data: Omit<Payment, 'id' | 'paymentNumber'>): Payment {
    const payments = this.getPayments();
    const invoices = this.getInvoices();

    const newPayment: Payment = {
      ...data,
      id: `pay-${Date.now().toString(36)}`,
      paymentNumber: `PAY-2026-0${50 + payments.length + 1}`
    };

    setStoredItem(PAYMENTS_KEY, [newPayment, ...payments]);

    // Update the invoice paid amount & balance
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === data.invoiceId || inv.invoiceNumber === data.invoiceNumber) {
        const newPaid = inv.paidAmount + data.amount;
        const newBalance = Math.max(0, inv.totalAmount - newPaid);
        const status = newBalance <= 0.01 ? 'Paid' : 'Partially Paid';
        return {
          ...inv,
          paidAmount: newPaid,
          balanceDue: newBalance,
          status: status as Invoice['status'],
          paymentMethod: data.paymentMethod
        };
      }
      return inv;
    });

    setStoredItem(INVOICES_KEY, updatedInvoices);

    auditService.log({
      userId: 'acc-01',
      userName: data.receivedBy,
      userRole: 'ACCOUNTANT',
      action: 'PROCESS_PAYMENT',
      module: 'BILLING',
      recordIdentifier: newPayment.paymentNumber,
      details: `Recorded payment of $${data.amount.toFixed(2)} via ${data.paymentMethod} for ${data.patientName}`
    });

    return newPayment;
  }
};
