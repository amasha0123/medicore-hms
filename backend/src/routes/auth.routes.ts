import { Router } from 'express';

import { AuthController } from '../controllers/authController';

import { validate } from '../middleware/validate';

import {
    loginSchema,
    refreshTokenSchema,
    registerSchema
} from '../validators/auth.validator';

import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, token management, and authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account in the hospital management system.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             email: "user@example.com"
 *             password: "SecurePassword123"
 *             firstName: "John"
 *             lastName: "Perera"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid registration data
 *       409:
 *         description: User already exists
 */
router.post(
    '/register',
    validate(registerSchema),
    AuthController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticate a user and obtain JWT access and refresh tokens.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             email: "user@example.com"
 *             password: "SecurePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid login data
 *       401:
 *         description: Invalid email or password
 */
router.post(
    '/login',
    validate(loginSchema),
    AuthController.login
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generate a new access token using a valid refresh token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             refreshToken: "your-refresh-token"
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       400:
 *         description: Invalid refresh token data
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
    '/refresh',
    validate(refreshTokenSchema),
    AuthController.refreshToken
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     description: Log out the currently authenticated user and invalidate the active authentication session.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Authentication required
 */
router.post(
    '/logout',
    authenticate,
    AuthController.logout
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     description: Retrieve the profile and authentication information of the currently authenticated user.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get(
    '/me',
    authenticate,
    AuthController.me
);

export default router;


