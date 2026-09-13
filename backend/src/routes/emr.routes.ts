import { Router } from 'express';

import { EMRController } from '../controllers/emrController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createMedicalRecordSchema } from '../validators/emr.validator';
import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Medical Records
 *   description: Electronic Medical Records (EMR) management operations
 */

/**
 * @swagger
 * /medical-records:
 *   get:
 *     summary: Get medical records
 *     description: Retrieve electronic medical records.
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medical records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
    '/',
    requirePermission(PERMISSIONS.MEDICAL_RECORD_READ),
    EMRController.getMedicalRecords
);

/**
 * @swagger
 * /medical-records/{id}:
 *   get:
 *     summary: Get medical record by ID
 *     description: Retrieve a specific electronic medical record.
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medical record ID
 *     responses:
 *       200:
 *         description: Medical record retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Medical record not found
 *       500:
 *         description: Internal server error
 */
router.get(
    '/:id',
    requirePermission(PERMISSIONS.MEDICAL_RECORD_READ),
    EMRController.getMedicalRecordById
);

/**
 * @swagger
 * /medical-records:
 *   post:
 *     summary: Create a medical record
 *     description: Create a new electronic medical record for a patient.
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Medical record information
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: "patient-123"
 *               doctorId:
 *                 type: string
 *                 example: "doctor-456"
 *               diagnosis:
 *                 type: string
 *                 example: Hypertension
 *               treatment:
 *                 type: string
 *                 example: Medication and follow-up monitoring
 *               notes:
 *                 type: string
 *                 example: Patient advised to attend follow-up consultation
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *       400:
 *         description: Invalid medical record data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
    '/',
    requirePermission(PERMISSIONS.MEDICAL_RECORD_CREATE),
    validate(createMedicalRecordSchema),
    EMRController.createMedicalRecord
);

export default router;

