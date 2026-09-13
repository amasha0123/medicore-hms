import { Router } from 'express';

import { PharmacyController } from '../controllers/pharmacyController';

import { authenticate } from '../middleware/auth';

import { requirePermission } from '../middleware/rbac';

import { validate } from '../middleware/validate';

import {
    createMedicineSchema,
    stockAdjustmentSchema,
    dispensePrescriptionSchema
} from '../validators/pharmacy.validator';

import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Pharmacy
 *   description: Pharmacy, medicine inventory, prescriptions, and dispensing management
 */

/**
 * @swagger
 * /pharmacy/medicines:
 *   get:
 *     summary: Get medicines
 *     description: Retrieve medicines available in the pharmacy inventory.
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medicines retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/medicines',
    requirePermission(PERMISSIONS.PHARMACY_READ),
    PharmacyController.getMedicines
);

/**
 * @swagger
 * /pharmacy/medicines:
 *   post:
 *     summary: Create a medicine
 *     description: Add a new medicine to the pharmacy inventory.
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             name: "Paracetamol"
 *             description: "Pain reliever and fever reducer"
 *             quantity: 100
 *             unitPrice: 25.00
 *     responses:
 *       201:
 *         description: Medicine created successfully
 *       400:
 *         description: Invalid medicine data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    '/medicines',
    requirePermission(PERMISSIONS.PHARMACY_CREATE),
    validate(createMedicineSchema),
    PharmacyController.createMedicine
);

/**
 * @swagger
 * /pharmacy/stock/in:
 *   post:
 *     summary: Add medicine stock
 *     description: Increase pharmacy inventory by recording incoming medicine stock.
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             medicineId: "MED-001"
 *             quantity: 100
 *             reference: "PO-2026-001"
 *     responses:
 *       200:
 *         description: Stock added successfully
 *       400:
 *         description: Invalid stock adjustment data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Medicine not found
 */
router.post(
    '/stock/in',
    requirePermission(PERMISSIONS.PHARMACY_UPDATE),
    validate(stockAdjustmentSchema),
    PharmacyController.stockIn
);

/**
 * @swagger
 * /pharmacy/prescriptions:
 *   get:
 *     summary: Get prescriptions
 *     description: Retrieve prescriptions available for pharmacy processing.
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/prescriptions',
    requirePermission(PERMISSIONS.PHARMACY_READ),
    PharmacyController.getPrescriptions
);

/**
 * @swagger
 * /pharmacy/prescriptions/{id}/dispense:
 *   post:
 *     summary: Dispense a prescription
 *     description: Dispense medicines associated with a prescription.
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             notes: "Prescription dispensed successfully"
 *     responses:
 *       200:
 *         description: Prescription dispensed successfully
 *       400:
 *         description: Invalid dispensing data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Prescription not found
 */
router.post(
    '/prescriptions/:id/dispense',
    requirePermission(PERMISSIONS.PHARMACY_DISPENSE),
    validate(dispensePrescriptionSchema),
    PharmacyController.dispensePrescription
);

export default router;

