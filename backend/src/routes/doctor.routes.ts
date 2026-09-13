import { Router } from 'express';

import { DoctorController } from '../controllers/doctorController';

import { authenticate } from '../middleware/auth';

import { requirePermission } from '../middleware/rbac';

import { validate } from '../middleware/validate';

import {
    createDoctorSchema,
    updateDoctorSchema,
    doctorScheduleSchema,
} from '../validators/doctor.validator';

import { PERMISSIONS } from '../constants/roles';

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
| All doctor routes require authentication.
*/
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management and schedule operations
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     description: Retrieve a list of doctors registered in the hospital.
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/',
    requirePermission(PERMISSIONS.DOCTOR_READ),
    DoctorController.getDoctors
);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     description: Retrieve detailed information about a specific doctor.
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor not found
 */
router.get(
    '/:id',
    requirePermission(PERMISSIONS.DOCTOR_READ),
    DoctorController.getDoctorById
);

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create a doctor
 *     description: Register a new doctor in the hospital management system.
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Sarah
 *               lastName:
 *                 type: string
 *                 example: Perera
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sarah.perera@example.com
 *               phone:
 *                 type: string
 *                 example: "+94771234567"
 *               specialization:
 *                 type: string
 *                 example: Cardiology
 *               licenseNumber:
 *                 type: string
 *                 example: SLMC-12345
 *               departmentId:
 *                 type: string
 *                 example: dept-001
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: Invalid doctor data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    '/',
    requirePermission(PERMISSIONS.DOCTOR_CREATE),
    validate(createDoctorSchema),
    DoctorController.createDoctor
);

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update doctor
 *     description: Update an existing doctor's information.
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               departmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       400:
 *         description: Invalid doctor data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor not found
 */
router.put(
    '/:id',
    requirePermission(PERMISSIONS.DOCTOR_UPDATE),
    validate(updateDoctorSchema),
    DoctorController.updateDoctor
);

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Soft delete doctor
 *     description: Soft delete an existing doctor record.
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor not found
 */
router.delete(
    '/:id',
    requirePermission(PERMISSIONS.DOCTOR_DELETE),
    DoctorController.softDeleteDoctor
);

/**
 * @swagger
 * /doctors/{id}/schedule:
 *   post:
 *     summary: Create or update doctor schedule
 *     description: Create or update the schedule for a doctor.
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfWeek:
 *                 type: string
 *                 example: Monday
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 example: "16:00"
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Doctor schedule updated successfully
 *       400:
 *         description: Invalid schedule data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor not found
 */
router.post(
    '/:id/schedule',
    requirePermission(PERMISSIONS.DOCTOR_UPDATE),
    validate(doctorScheduleSchema),
    DoctorController.updateSchedule
);

/**
 * @swagger
 * /doctors/{id}/schedule:
 *   put:
 *     summary: Update doctor schedule
 *     description: Update an existing doctor's schedule.
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfWeek:
 *                 type: string
 *                 example: Monday
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 example: "16:00"
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Doctor schedule updated successfully
 *       400:
 *         description: Invalid schedule data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor not found
 */
router.put(
    '/:id/schedule',
    requirePermission(PERMISSIONS.DOCTOR_UPDATE),
    validate(doctorScheduleSchema),
    DoctorController.updateSchedule
);

export default router;
