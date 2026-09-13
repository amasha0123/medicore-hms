import { Router } from 'express';

import { PatientController } from '../controllers/patientController';

import { authenticate } from '../middleware/auth';

import { requirePermission } from '../middleware/rbac';

import { validate } from '../middleware/validate';

import {
    createPatientSchema,
    updatePatientSchema,
    queryPatientsSchema,
} from '../validators/patient.validator';

import { multerUpload } from '../utils/storage';

import { PERMISSIONS } from '../constants/roles';

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
| All patient routes require authentication.
*/
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management and medical history operations
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     description: Retrieve a paginated list of patients.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of patients per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search patients
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/',
    requirePermission(PERMISSIONS.PATIENT_READ),
    validate(queryPatientsSchema),
    PatientController.getPatients
);

/**
 * @swagger
 * /patients/search:
 *   get:
 *     summary: Search patients
 *     description: Search for patients by available patient information.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient search term
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    '/search',
    requirePermission(PERMISSIONS.PATIENT_READ),
    PatientController.getPatients
);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     description: Retrieve a specific patient's details.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 */
router.get(
    '/:id',
    requirePermission(PERMISSIONS.PATIENT_READ),
    PatientController.getPatientById
);

/**
 * @swagger
 * /patients/{id}/medical-history:
 *   get:
 *     summary: Get patient medical history
 *     description: Retrieve the medical history of a specific patient.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Medical history retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 */
router.get(
    '/:id/medical-history',
    requirePermission(PERMISSIONS.PATIENT_READ),
    PatientController.getMedicalHistory
);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Register a new patient
 *     description: Create a new patient record.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               gender:
 *                 type: string
 *                 example: Male
 *               phone:
 *                 type: string
 *                 example: "+94771234567"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               address:
 *                 type: string
 *                 example: Colombo, Sri Lanka
 *               bloodGroup:
 *                 type: string
 *                 example: O+
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Invalid patient data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    '/',
    requirePermission(PERMISSIONS.PATIENT_CREATE),
    validate(createPatientSchema),
    PatientController.createPatient
);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update patient
 *     description: Update an existing patient's information.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
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
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               bloodGroup:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       400:
 *         description: Invalid patient data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 */
router.put(
    '/:id',
    requirePermission(PERMISSIONS.PATIENT_UPDATE),
    validate(updatePatientSchema),
    PatientController.updatePatient
);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Soft delete patient
 *     description: Soft delete an existing patient record.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Patient not found
 */
router.delete(
    '/:id',
    requirePermission(PERMISSIONS.PATIENT_DELETE),
    PatientController.softDeletePatient
);

/**
 * @swagger
 * /patients/{id}/documents:
 *   post:
 *     summary: Upload patient document
 *     description: Upload a document associated with a patient.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Patient document file
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    '/:id/documents',
    requirePermission(PERMISSIONS.PATIENT_UPDATE),
    multerUpload.single('file'),
    PatientController.uploadDocument
);

/**
 * @swagger
 * /patients/documents/{id}:
 *   delete:
 *     summary: Delete patient document
 *     description: Delete a document associated with a patient.
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Document not found
 */
router.delete(
    '/documents/:id',
    requirePermission(PERMISSIONS.PATIENT_UPDATE),
    PatientController.deleteDocument
);

export default router;
