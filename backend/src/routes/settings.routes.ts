import { Router } from 'express';

import { SettingController } from '../controllers/settingController';

import { authenticate } from '../middleware/auth';

import { requirePermission } from '../middleware/rbac';

import { validate } from '../middleware/validate';

import { updateSettingsSchema } from '../validators/settings.validator';

import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Hospital system configuration and settings management
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get system settings
 *     description: Retrieve the current hospital system settings.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get(
    '/',
    SettingController.getSettings
);

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update system settings
 *     description: Update hospital system configuration settings.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             hospitalName: "MediCore Hospital"
 *             contactEmail: "admin@medicore.hospital"
 *             contactPhone: "+94112234567"
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid settings data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.put(
    '/',
    requirePermission(PERMISSIONS.SETTINGS_MANAGE),
    validate(updateSettingsSchema),
    SettingController.updateSettings
);

export default router;

