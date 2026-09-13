import { Router } from 'express';

import { OutpatientController } from '../controllers/outpatientController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Outpatients
 *   description: Outpatient queue and status management operations
 */

/**
 * @swagger
 * /outpatients/queue:
 *   get:
 *     summary: Get outpatient queue
 *     description: Retrieve the current outpatient queue.
 *     tags: [Outpatients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Outpatient queue retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
    '/queue',
    requirePermission(PERMISSIONS.OUTPATIENT_READ),
    OutpatientController.getQueue
);

/**
 * @swagger
 * /outpatients/queue:
 *   post:
 *     summary: Add patient to outpatient queue
 *     description: Add a patient to the current outpatient queue.
 *     tags: [Outpatients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Patient queue information
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: "patient-123"
 *               appointmentId:
 *                 type: string
 *                 example: "appointment-456"
 *               priority:
 *                 type: string
 *                 example: NORMAL
 *     responses:
 *       201:
 *         description: Patient added to outpatient queue successfully
 *       400:
 *         description: Invalid queue data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
    '/queue',
    requirePermission(PERMISSIONS.OUTPATIENT_MANAGE),
    OutpatientController.addToQueue
);

/**
 * @swagger
 * /outpatients/queue/{id}/status:
 *   patch:
 *     summary: Update outpatient queue status
 *     description: Update the status of a patient in the outpatient queue.
 *     tags: [Outpatients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Queue status information
 *             properties:
 *               status:
 *                 type: string
 *                 example: IN_PROGRESS
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Queue status updated successfully
 *       400:
 *         description: Invalid status data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Queue entry not found
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/queue/:id/status',
    requirePermission(PERMISSIONS.OUTPATIENT_MANAGE),
    OutpatientController.updateStatus
);

export default router;

