import { Router } from 'express';

import { ReportController } from '../controllers/reportController';

import { authenticate } from '../middleware/auth';

import { requirePermission } from '../middleware/rbac';

import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Hospital reports and analytics
 */

/**
 * @swagger
 * /reports/revenue:
 *   get:
 *     summary: Get revenue report
 *     description: Retrieve hospital revenue and financial reporting data.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *         example: "2026-12-31"
 *     responses:
 *       200:
 *         description: Revenue report retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/revenue',
    requirePermission(PERMISSIONS.REPORT_READ),
    ReportController.getRevenueReport
);

/**
 * @swagger
 * /reports/patients:
 *   get:
 *     summary: Get patient report
 *     description: Retrieve patient statistics and reporting data.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *         example: "2026-12-31"
 *     responses:
 *       200:
 *         description: Patient report retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/patients',
    requirePermission(PERMISSIONS.REPORT_READ),
    ReportController.getPatientReport
);

/**
 * @swagger
 * /reports/appointments:
 *   get:
 *     summary: Get appointment report
 *     description: Retrieve appointment statistics and reporting data.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *         example: "2026-12-31"
 *     responses:
 *       200:
 *         description: Appointment report retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/appointments',
    requirePermission(PERMISSIONS.REPORT_READ),
    ReportController.getAppointmentReport
);

export default router;

