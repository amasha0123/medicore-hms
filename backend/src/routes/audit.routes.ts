import { Router } from 'express';

import { AuditController } from '../controllers/auditController';

import { authenticate } from '../middleware/auth';

import { requirePermission } from '../middleware/rbac';

import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: System audit log and activity tracking
 */

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieve system audit log entries. Requires audit log read permission.
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/',
    requirePermission(PERMISSIONS.AUDIT_READ),
    AuditController.getAuditLogs
);

/**
 * @swagger
 * /audit-logs:
 *   post:
 *     summary: Create an audit log entry
 *     description: Create an audit log entry for an authenticated user. This endpoint can be used by the frontend to record client-side events.
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             action: "PATIENT_VIEWED"
 *             entity: "Patient"
 *             entityId: "patient-001"
 *             details: "Patient record viewed from the frontend"
 *     responses:
 *       201:
 *         description: Audit log created successfully
 *       400:
 *         description: Invalid audit log data
 *       401:
 *         description: Authentication required
 */
router.post(
    '/',
    AuditController.createAuditLog
);

export default router;

