import { Router } from 'express';

import { DepartmentController } from '../controllers/departmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management operations
 */

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     description: Retrieve a list of all hospital departments.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', DepartmentController.getDepartments);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     description: Retrieve a specific hospital department using its ID.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', DepartmentController.getDepartmentById);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a department
 *     description: Create a new hospital department.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cardiology
 *               description:
 *                 type: string
 *                 example: Department responsible for cardiovascular care
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Invalid department data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', DepartmentController.createDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update a department
 *     description: Update an existing hospital department.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cardiology
 *               description:
 *                 type: string
 *                 example: Cardiovascular medicine and treatment
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         description: Invalid department data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', DepartmentController.updateDepartment);

export default router;

