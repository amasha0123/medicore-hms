import { Router } from 'express';

import { SearchController } from '../controllers/searchController';

import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Global hospital system search
 */

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search the hospital system
 *     description: Perform an authenticated search across available hospital system records.
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "John"
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Invalid or missing search query
 *       401:
 *         description: Authentication required
 */
router.get(
    '/',
    SearchController.search
);

export default router;

