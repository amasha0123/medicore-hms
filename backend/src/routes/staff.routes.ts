import { Router } from 'express';

import { StaffController } from '../controllers/staffController';

import { authenticate } from '../middleware/auth';

import { requirePermission } from '../middleware/rbac';

import { validate } from '../middleware/validate';

import {
    createEmployeeSchema,
    attendanceCheckInSchema,
    createLeaveRequestSchema
} from '../validators/staff.validator';

import { PERMISSIONS } from '../constants/roles';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Employee, attendance, and leave management
 */

/**
 * @swagger
 * /staff/employees:
 *   get:
 *     summary: Get employees
 *     description: Retrieve hospital staff and employee records.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/employees',
    requirePermission(PERMISSIONS.STAFF_READ),
    StaffController.getEmployees
);

/**
 * @swagger
 * /staff/employees:
 *   post:
 *     summary: Create employee
 *     description: Register a new hospital employee or staff member.
 *     tags: [Staff]
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
 *             email: "john.perera@example.com"
 *             phone: "+94112234567"
 *             role: "NURSE"
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Invalid employee data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    '/employees',
    requirePermission(PERMISSIONS.STAFF_CREATE),
    validate(createEmployeeSchema),
    StaffController.createEmployee
);

/**
 * @swagger
 * /staff/attendance:
 *   get:
 *     summary: Get attendance records
 *     description: Retrieve staff attendance records.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/attendance',
    requirePermission(PERMISSIONS.STAFF_READ),
    StaffController.getAttendance
);

/**
 * @swagger
 * /staff/attendance/check-in:
 *   post:
 *     summary: Check in staff member
 *     description: Record a staff member's attendance check-in.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             employeeId: "EMP-001"
 *     responses:
 *       200:
 *         description: Check-in recorded successfully
 *       400:
 *         description: Invalid check-in data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    '/attendance/check-in',
    requirePermission(PERMISSIONS.STAFF_READ),
    validate(attendanceCheckInSchema),
    StaffController.checkIn
);

/**
 * @swagger
 * /staff/attendance/check-out:
 *   post:
 *     summary: Check out staff member
 *     description: Record a staff member's attendance check-out.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Check-out recorded successfully
 *       400:
 *         description: Check-out could not be recorded
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    '/attendance/check-out',
    requirePermission(PERMISSIONS.STAFF_READ),
    StaffController.checkOut
);

/**
 * @swagger
 * /staff/leave:
 *   get:
 *     summary: Get leave requests
 *     description: Retrieve staff leave requests.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave requests retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/leave',
    requirePermission(PERMISSIONS.STAFF_READ),
    StaffController.getLeaveRequests
);

/**
 * @swagger
 * /staff/leave:
 *   post:
 *     summary: Create leave request
 *     description: Submit a new staff leave request.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             employeeId: "EMP-001"
 *             leaveType: "ANNUAL"
 *             startDate: "2026-09-15"
 *             endDate: "2026-09-17"
 *             reason: "Personal leave"
 *     responses:
 *       201:
 *         description: Leave request created successfully
 *       400:
 *         description: Invalid leave request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    '/leave',
    requirePermission(PERMISSIONS.STAFF_READ),
    validate(createLeaveRequestSchema),
    StaffController.createLeaveRequest
);

/**
 * @swagger
 * /staff/leave/{id}/approve:
 *   patch:
 *     summary: Approve leave request
 *     description: Approve a staff leave request.
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave request ID
 *         example: "leave-001"
 *     responses:
 *       200:
 *         description: Leave request approved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Leave request not found
 */
router.patch(
    '/leave/:id/approve',
    requirePermission(PERMISSIONS.STAFF_UPDATE),
    StaffController.approveLeave
);

export default router;

