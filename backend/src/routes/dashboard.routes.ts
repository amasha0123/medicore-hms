import { Router } from 'express';

import { DashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { USER_ROLES } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Role-based hospital dashboard operations
 */

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Get administrator dashboard
 *     description: Retrieve dashboard data for hospital administrators.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Administrator dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - administrator role required
 *       500:
 *         description: Internal server error
 */
router.get(
    '/admin',
    authorize(USER_ROLES.ADMIN),
    DashboardController.getAdminDashboard
);

/**
 * @swagger
 * /dashboard/doctor:
 *   get:
 *     summary: Get doctor dashboard
 *     description: Retrieve dashboard data for doctors and administrators.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - doctor or administrator role required
 *       500:
 *         description: Internal server error
 */
router.get(
    '/doctor',
    authorize(USER_ROLES.ADMIN, USER_ROLES.DOCTOR),
    DashboardController.getDoctorDashboard
);

/**
 * @swagger
 * /dashboard/nurse:
 *   get:
 *     summary: Get nurse dashboard
 *     description: Retrieve dashboard data for nurses and administrators.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nurse dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - nurse or administrator role required
 *       500:
 *         description: Internal server error
 */
router.get(
    '/nurse',
    authorize(USER_ROLES.ADMIN, USER_ROLES.NURSE),
    DashboardController.getNurseDashboard
);

/**
 * @swagger
 * /dashboard/receptionist:
 *   get:
 *     summary: Get receptionist dashboard
 *     description: Retrieve dashboard data for receptionists and administrators.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Receptionist dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - receptionist or administrator role required
 *       500:
 *         description: Internal server error
 */
router.get(
    '/receptionist',
    authorize(USER_ROLES.ADMIN, USER_ROLES.RECEPTIONIST),
    DashboardController.getReceptionistDashboard
);

/**
 * @swagger
 * /dashboard/laboratory:
 *   get:
 *     summary: Get laboratory dashboard
 *     description: Retrieve dashboard data for laboratory staff and administrators.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Laboratory dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - laboratory staff or administrator role required
 *       500:
 *         description: Internal server error
 */
router.get(
    '/laboratory',
    authorize(USER_ROLES.ADMIN, USER_ROLES.LAB_STAFF),
    DashboardController.getLabDashboard
);

/**
 * @swagger
 * /dashboard/pharmacy:
 *   get:
 *     summary: Get pharmacy dashboard
 *     description: Retrieve dashboard data for pharmacists and administrators.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pharmacy dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - pharmacist or administrator role required
 *       500:
 *         description: Internal server error
 */
router.get(
    '/pharmacy',
    authorize(USER_ROLES.ADMIN, USER_ROLES.PHARMACIST),
    DashboardController.getPharmacyDashboard
);

/**
 * @swagger
 * /dashboard/accountant:
 *   get:
 *     summary: Get accountant dashboard
 *     description: Retrieve dashboard data for accountants and administrators.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accountant dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - accountant or administrator role required
 *       500:
 *         description: Internal server error
 */
router.get(
    '/accountant',
    authorize(USER_ROLES.ADMIN, USER_ROLES.ACCOUNTANT),
    DashboardController.getAccountantDashboard
);

export default router;

