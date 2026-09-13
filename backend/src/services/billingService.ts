import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';

export class BillingService {
  private static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    const nextNum = (count + 1).toString().padStart(6, '0');
    return `INV-${year}-${nextNum}`;
  }

  private static async generatePaymentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.payment.count();
    const nextNum = (count + 1).toString().padStart(6, '0');
    return `PAY-${year}-${nextNum}`;
  }

  public static async getInvoices(query: { patientId?: string; status?: string; search?: string }) {
    const where: any = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { invoiceNumber: { contains: query.search } },
        { patient: { fullName: { contains: query.search } } }
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { invoiceDate: 'desc' },
      include: {
        patient: true,
        items: true,
        payments: true
      }
    });

    return invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      patientId: inv.patientId,
      patientName: inv.patient.fullName,
      patientPhone: inv.patient.phone,
      patientAddress: inv.patient.address,
      date: inv.invoiceDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
      items: inv.items.map((i: any) => ({
        id: i.id,
        serviceCategory: i.serviceCategory,
        description: i.description,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        total: Number(i.total)
      })),
      subtotal: Number(inv.subtotal),
      discountPercentage: Number(inv.discountPercentage),
      discountAmount: Number(inv.discountAmount),
      taxPercentage: Number(inv.taxPercentage),
      taxAmount: Number(inv.taxAmount),
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      balanceDue: Number(inv.balanceDue),
      status: inv.status,
      paymentMethod: inv.paymentMethod || undefined,
      notes: inv.notes || undefined
    }));
  }

  public static async getInvoiceById(id: string) {
    const inv = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        items: true,
        payments: true
      }
    });

    if (!inv) throw ApiError.notFound('Invoice not found');

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      patientId: inv.patientId,
      patientName: inv.patient.fullName,
      patientPhone: inv.patient.phone,
      patientAddress: inv.patient.address,
      date: inv.invoiceDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
      items: inv.items.map((i) => ({
        id: i.id,
        serviceCategory: i.serviceCategory,
        description: i.description,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        total: Number(i.total)
      })),
      subtotal: Number(inv.subtotal),
      discountPercentage: Number(inv.discountPercentage),
      discountAmount: Number(inv.discountAmount),
      taxPercentage: Number(inv.taxPercentage),
      taxAmount: Number(inv.taxAmount),
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      balanceDue: Number(inv.balanceDue),
      status: inv.status,
      paymentMethod: inv.paymentMethod || undefined,
      notes: inv.notes || undefined
    };
  }

  public static async createInvoice(input: any, currentUserId?: string, currentUserName?: string) {
    const patient = await prisma.patient.findFirst({ where: { id: input.patientId, deletedAt: null } });
    if (!patient) throw ApiError.notFound('Patient not found');

    // Calculate totals on backend
    let subtotal = 0;
    const itemsData = input.items.map((item: any) => {
      const lineTotal = item.unitPrice * item.quantity;
      subtotal += lineTotal;
      return {
        serviceCategory: item.serviceCategory,
        description: item.description,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: lineTotal
      };
    });

    const discountPercentage = input.discountPercentage || 0;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxPercentage = input.taxPercentage || 0;
    const taxAmount = (taxableAmount * taxPercentage) / 100;
    const totalAmount = taxableAmount + taxAmount;
    const balanceDue = totalAmount;

    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId: input.patientId,
        invoiceDate: new Date(),
        dueDate: new Date(input.dueDate),
        subtotal,
        discountPercentage,
        discountAmount,
        taxPercentage,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balanceDue,
        status: 'PENDING',
        notes: input.notes,
        items: {
          create: itemsData
        }
      }
    });

    await AuditService.log({
      userId: currentUserId,
      userName: currentUserName,
      action: 'GENERATE_INVOICE',
      module: 'BILLING',
      recordIdentifier: invoice.invoiceNumber,
      description: `Generated invoice ${invoice.invoiceNumber} for ${patient.fullName} (Total: $${totalAmount.toFixed(2)})`
    });

    return this.getInvoiceById(invoice.id);
  }

  public static async recordPayment(input: any, currentUserId?: string, currentUserName?: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: input.invoiceId },
      include: { patient: true }
    });

    if (!invoice) throw ApiError.notFound('Invoice not found');

    const amount = Number(input.amount);
    if (amount <= 0) throw ApiError.badRequest('Payment amount must be greater than zero');

    const currentBalance = Number(invoice.balanceDue);
    if (amount > currentBalance + 0.01) {
      throw ApiError.badRequest(`Payment amount ($${amount}) exceeds remaining balance ($${currentBalance.toFixed(2)})`);
    }

    const paymentNumber = await this.generatePaymentNumber();
    const newPaidAmount = Number(invoice.paidAmount) + amount;
    const newBalanceDue = Number(invoice.totalAmount) - newPaidAmount;

    let newStatus = invoice.status;
    if (newBalanceDue <= 0.01) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    // Execute atomic payment transaction
    return prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: input.invoiceId,
          patientId: input.patientId,
          amount,
          paymentDate: new Date(),
          paymentMethod: input.paymentMethod,
          transactionRef: input.transactionRef || `REF-${Date.now()}`,
          receivedBy: input.receivedBy || currentUserName || 'Accountant',
          status: 'Successful'
        }
      });

      await tx.invoice.update({
        where: { id: input.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceDue: newBalanceDue,
          status: newStatus,
          paymentMethod: input.paymentMethod
        }
      });

      await AuditService.log({
        userId: currentUserId,
        userName: currentUserName,
        action: 'PROCESS_PAYMENT',
        module: 'BILLING',
        recordIdentifier: payment.paymentNumber,
        description: `Recorded payment of $${amount.toFixed(2)} for Invoice ${invoice.invoiceNumber}`
      });

      return {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        invoiceNumber: invoice.invoiceNumber,
        amount,
        newBalanceDue,
        status: newStatus
      };
    });
  }

  public static async getReceipt(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: { include: { items: true } },
        patient: true
      }
    });

    if (!payment) throw ApiError.notFound('Payment record not found');

    return {
      hospital: {
        name: 'MediCore Hospital',
        address: '124 Healthcare Boulevard, Medical District, NY 10001',
        phone: '+1 (555) 234-5678',
        email: 'billing@medicore.hospital'
      },
      patient: {
        patientNumber: payment.patient.patientId,
        name: payment.patient.fullName,
        phone: payment.patient.phone
      },
      invoice: {
        invoiceNumber: payment.invoice.invoiceNumber,
        totalAmount: Number(payment.invoice.totalAmount),
        paidAmount: Number(payment.invoice.paidAmount),
        balanceDue: Number(payment.invoice.balanceDue)
      },
      payment: {
        paymentNumber: payment.paymentNumber,
        amount: Number(payment.amount),
        date: payment.paymentDate.toISOString(),
        paymentMethod: payment.paymentMethod,
        transactionRef: payment.transactionRef,
        receivedBy: payment.receivedBy
      }
    };
  }
}
