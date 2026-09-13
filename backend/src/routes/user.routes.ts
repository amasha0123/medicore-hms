import { Router } from 'express';

import { UserController } from '../controllers/userController';

import { authenticate } from '../middleware/auth';

import { requirePermission } from '../middleware/rbac';

import { validate } from '../middleware/validate';

import {
    createUserSchema,
    updateUserStatusSchema,
    adminResetPasswordSchema,
    approveUserSchema,
    rejectUserSchema
} from '../validators/user.validator';

import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User account and access management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users
 *     description: Retrieve users registered in the hospital management system.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/',
    requirePermission(PERMISSIONS.USER_MANAGE),
    UserController.getUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve details of a specific user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user-001"
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get(
    '/:id',
    requirePermission(PERMISSIONS.USER_MANAGE),
    UserController.getUserById
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user
 *     description: Create a new user account for the hospital management system.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             firstName: "John"
 *             lastName: "Perera"
 *             email: "john@example.com"
 *             role: "DOCTOR"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid user data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    '/',
    requirePermission(PERMISSIONS.USER_MANAGE),
    validate(createUserSchema),
    UserController.createUser
);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Toggle user status
 *     description: Activate or deactivate a user account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             isActive: false
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.patch(
    '/:id/status',
    requirePermission(PERMISSIONS.USER_MANAGE),
    validate(updateUserStatusSchema),
    UserController.toggleStatus
);

/**
 * @swagger
 * /users/{id}/approve:
 *   patch:
 *     summary: Approve user
 *     description: Approve a pending user account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User approved successfully
 *       400:
 *         description: Invalid approval data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.patch(
    '/:id/approve',
    requirePermission(PERMISSIONS.USER_MANAGE),
    validate(approveUserSchema),
    UserController.approveUser
);

/**
 * @swagger
 * /users/{id}/reject:
 *   patch:
 *     summary: Reject user
 *     description: Reject a pending user account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User rejected successfully
 *       400:
 *         description: Invalid rejection data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.patch(
    '/:id/reject',
    requirePermission(PERMISSIONS.USER_MANAGE),
    validate(rejectUserSchema),
    UserController.rejectUser
);

/**
 * @swagger
 * /users/{id}/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Reset a user's password through administrative user management.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             password: "NewSecurePassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid password reset data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.post(
    '/:id/reset-password',
    requirePermission(PERMISSIONS.USER_MANAGE),
    validate(adminResetPasswordSchema),
    UserController.resetPassword
);

export default router;

