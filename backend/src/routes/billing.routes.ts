import { Router } from 'express';

import { BillingController } from '../controllers/billingController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
    createInvoiceSchema,
    recordPaymentSchema
} from '../validators/billing.validator';
import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Invoice, payment, and billing management operations
 */

/**
 * @swagger
 * /billing/invoices:
 *   get:
 *     summary: Get invoices
 *     description: Retrieve hospital invoices.
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
    '/invoices',
    requirePermission(PERMISSIONS.BILLING_READ),
    BillingController.getInvoices
);

/**
 * @swagger
 * /billing/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     description: Retrieve detailed information about a specific invoice.
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.get(
    '/invoices/:id',
    requirePermission(PERMISSIONS.BILLING_READ),
    BillingController.getInvoiceById
);

/**
 * @swagger
 * /billing/invoices:
 *   post:
 *     summary: Create an invoice
 *     description: Create a new hospital billing invoice.
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Invoice information
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: "patient-123"
 *               amount:
 *                 type: number
 *                 format: double
 *                 example: 15000.00
 *               description:
 *                 type: string
 *                 example: Consultation and laboratory services
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-30"
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Invalid invoice data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
    '/invoices',
    requirePermission(PERMISSIONS.BILLING_CREATE),
    validate(createInvoiceSchema),
    BillingController.createInvoice
);

/**
 * @swagger
 * /billing/payments:
 *   post:
 *     summary: Record a payment
 *     description: Record a payment against a hospital invoice.
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payment information
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 example: "invoice-123"
 *               amount:
 *                 type: number
 *                 format: double
 *                 example: 15000.00
 *               paymentMethod:
 *                 type: string
 *                 example: CASH
 *               reference:
 *                 type: string
 *                 example: PAY-2026-0001
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *       400:
 *         description: Invalid payment data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.post(
    '/payments',
    requirePermission(PERMISSIONS.PAYMENT_CREATE),
    validate(recordPaymentSchema),
    BillingController.recordPayment
);

/**
 * @swagger
 * /billing/payments/{id}/receipt:
 *   get:
 *     summary: Get payment receipt
 *     description: Retrieve the receipt for a specific payment.
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment receipt retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.get(
    '/payments/:id/receipt',
    requirePermission(PERMISSIONS.PAYMENT_READ),
    BillingController.getReceipt
);

export default router;

