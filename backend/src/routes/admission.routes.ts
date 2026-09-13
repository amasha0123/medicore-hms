import { Router } from 'express';

import { AdmissionController } from '../controllers/admissionController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
    createAdmissionSchema,
    updateBedStatusSchema
} from '../validators/admission.validator';
import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Admissions
 *   description: Inpatient admissions, wards, beds, and discharge management
 */

/**
 * @swagger
 * /admissions/wards:
 *   get:
 *     summary: Get hospital wards
 *     description: Retrieve the available hospital wards.
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wards retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
    '/wards',
    requirePermission(PERMISSIONS.ADMISSION_READ),
    AdmissionController.getWards
);

/**
 * @swagger
 * /admissions/beds:
 *   get:
 *     summary: Get hospital beds
 *     description: Retrieve hospital beds and their current availability/status.
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Beds retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
    '/beds',
    requirePermission(PERMISSIONS.ADMISSION_READ),
    AdmissionController.getBeds
);

/**
 * @swagger
 * /admissions/beds/{id}/status:
 *   patch:
 *     summary: Update bed status
 *     description: Update the current status of a hospital bed.
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bed ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Bed status update data
 *             properties:
 *               status:
 *                 type: string
 *                 example: AVAILABLE
 *     responses:
 *       200:
 *         description: Bed status updated successfully
 *       400:
 *         description: Invalid bed status data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Bed not found
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/beds/:id/status',
    requirePermission(PERMISSIONS.ADMISSION_UPDATE),
    validate(updateBedStatusSchema),
    AdmissionController.updateBedStatus
);

/**
 * @swagger
 * /admissions:
 *   get:
 *     summary: Get admissions
 *     description: Retrieve hospital admission records.
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admissions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
    '/',
    requirePermission(PERMISSIONS.ADMISSION_READ),
    AdmissionController.getAdmissions
);

/**
 * @swagger
 * /admissions:
 *   post:
 *     summary: Create an admission
 *     description: Create a new inpatient hospital admission.
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Admission information
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: "patient-123"
 *               wardId:
 *                 type: string
 *                 example: "ward-001"
 *               bedId:
 *                 type: string
 *                 example: "bed-001"
 *               admissionDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-09T10:00:00Z"
 *               reason:
 *                 type: string
 *                 example: Medical observation
 *     responses:
 *       201:
 *         description: Admission created successfully
 *       400:
 *         description: Invalid admission data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
    '/',
    requirePermission(PERMISSIONS.ADMISSION_CREATE),
    validate(createAdmissionSchema),
    AdmissionController.createAdmission
);

/**
 * @swagger
 * /admissions/{id}/discharge:
 *   patch:
 *     summary: Discharge a patient
 *     description: Discharge a patient from an active hospital admission.
 *     tags: [Admissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admission ID
 *     responses:
 *       200:
 *         description: Patient discharged successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Admission not found
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/:id/discharge',
    requirePermission(PERMISSIONS.ADMISSION_UPDATE),
    AdmissionController.discharge
);

export default router;

