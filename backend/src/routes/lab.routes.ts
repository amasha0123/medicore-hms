import { Router } from 'express';

import { LabController } from '../controllers/labController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
    createLabRequestSchema,
    updateLabStatusSchema,
    createLabResultSchema
} from '../validators/lab.validator';
import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Laboratory
 *   description: Laboratory request, status, and result management operations
 */

/**
 * @swagger
 * /laboratory/requests:
 *   get:
 *     summary: Get laboratory requests
 *     description: Retrieve laboratory test requests.
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Laboratory requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
    '/requests',
    requirePermission(PERMISSIONS.LAB_READ),
    LabController.getLabRequests
);

/**
 * @swagger
 * /laboratory/requests:
 *   post:
 *     summary: Create laboratory request
 *     description: Create a new laboratory test request for a patient.
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Laboratory request information
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: "patient-123"
 *               testType:
 *                 type: string
 *                 example: Blood Test
 *               priority:
 *                 type: string
 *                 example: NORMAL
 *               notes:
 *                 type: string
 *                 example: Routine laboratory investigation
 *     responses:
 *       201:
 *         description: Laboratory request created successfully
 *       400:
 *         description: Invalid laboratory request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
    '/requests',
    requirePermission(PERMISSIONS.LAB_CREATE),
    validate(createLabRequestSchema),
    LabController.createLabRequest
);

/**
 * @swagger
 * /laboratory/requests/{id}/status:
 *   patch:
 *     summary: Update laboratory request status
 *     description: Update the processing status of a laboratory request.
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Laboratory request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Laboratory request status information
 *             properties:
 *               status:
 *                 type: string
 *                 example: IN_PROGRESS
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Laboratory request status updated successfully
 *       400:
 *         description: Invalid status data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Laboratory request not found
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/requests/:id/status',
    requirePermission(PERMISSIONS.LAB_UPDATE),
    validate(updateLabStatusSchema),
    LabController.updateStatus
);

/**
 * @swagger
 * /laboratory/results:
 *   post:
 *     summary: Enter laboratory results
 *     description: Record laboratory test results for a laboratory request.
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Laboratory result information
 *             properties:
 *               labRequestId:
 *                 type: string
 *                 example: "lab-request-123"
 *               result:
 *                 type: string
 *                 example: Test result details
 *               notes:
 *                 type: string
 *                 example: Laboratory findings and observations
 *     responses:
 *       201:
 *         description: Laboratory results entered successfully
 *       400:
 *         description: Invalid laboratory result data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Laboratory request not found
 *       500:
 *         description: Internal server error
 */
router.post(
    '/results',
    requirePermission(PERMISSIONS.LAB_RESULT_ENTRY),
    validate(createLabResultSchema),
    LabController.enterResults
);

export default router;

