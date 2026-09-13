import { Router } from 'express';

import { AppointmentController } from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
    createAppointmentSchema,
    updateAppointmentStatusSchema,
    rescheduleAppointmentSchema
} from '../validators/appointment.validator';
import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment scheduling and management operations
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get appointments
 *     description: Retrieve hospital appointments.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
    '/',
    requirePermission(PERMISSIONS.APPOINTMENT_READ),
    AppointmentController.getAppointments
);

/**
 * @swagger
 * /appointments/calendar:
 *   get:
 *     summary: Get calendar events
 *     description: Retrieve appointments formatted as calendar events.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Calendar events retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
    '/calendar',
    requirePermission(PERMISSIONS.APPOINTMENT_READ),
    AppointmentController.getCalendarEvents
);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create an appointment
 *     description: Create a new patient appointment with a doctor.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Appointment information
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: "patient-123"
 *               doctorId:
 *                 type: string
 *                 example: "doctor-456"
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-15T09:30:00Z"
 *               reason:
 *                 type: string
 *                 example: General consultation
 *               notes:
 *                 type: string
 *                 example: Routine medical consultation
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Invalid appointment data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
    '/',
    requirePermission(PERMISSIONS.APPOINTMENT_CREATE),
    validate(createAppointmentSchema),
    AppointmentController.createAppointment
);

/**
 * @swagger
 * /appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     description: Update the status of an existing appointment.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: CONFIRMED
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *       400:
 *         description: Invalid status data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/:id/status',
    requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
    validate(updateAppointmentStatusSchema),
    AppointmentController.updateStatus
);

/**
 * @swagger
 * /appointments/{id}/reschedule:
 *   patch:
 *     summary: Reschedule an appointment
 *     description: Change the date or time of an existing appointment.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: New appointment schedule
 *             properties:
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-16T10:00:00Z"
 *               reason:
 *                 type: string
 *                 example: Doctor schedule conflict
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *       400:
 *         description: Invalid rescheduling data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/:id/reschedule',
    requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
    validate(rescheduleAppointmentSchema),
    AppointmentController.reschedule
);

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     description: Cancel an existing patient appointment.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/:id/cancel',
    requirePermission(PERMISSIONS.APPOINTMENT_CANCEL),
    AppointmentController.cancelAppointment
);

export default router;

