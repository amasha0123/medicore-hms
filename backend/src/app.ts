import express, {
  Application,
  Request,
  Response,
} from 'express';

import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Application imports
import { logger } from './utils/logger';
import { prisma } from './config/prisma';
import { swaggerSpec } from './config/swagger';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponse } from './utils/apiResponse';

const app: Application = express();

/* ============================================================
   SECURITY HEADERS
   ============================================================ */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

/* ============================================================
   CORS
   ============================================================ */

const allowedOrigin =
  process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allowed origins (development & production Vercel apps)
      if (
        origin === allowedOrigin ||
        origin.endsWith('.vercel.app') ||
        origin === 'http://localhost:5173' ||
        origin === 'http://localhost:4173'
      ) {
        callback(null, true);
        return;
      }

      // Permissive during development.
      // Make this strict in production.
      callback(null, true);
    },

    credentials: true,
  })
);

/* ============================================================
   RATE LIMITING
   ============================================================ */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Maximum 500 requests per IP
  max: 500,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many requests from this IP, please try again later.',
  },
});

app.use(limiter);

/* ============================================================
   BODY PARSERS
   ============================================================ */

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

/* ============================================================
   HTTP LOGGING
   ============================================================ */

app.use(
  pinoHttp({
    logger,
    autoLogging: false,
  })
);

/* ============================================================
   STATIC UPLOAD FILES
   ============================================================ */

const uploadDir =
  process.env.UPLOAD_DIR || './uploads';

app.use(
  '/uploads',
  express.static(path.resolve(uploadDir))
);

/* ============================================================
   SWAGGER API DOCUMENTATION
   ============================================================ */

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,

    customSiteTitle:
      'MediCore HMS API Documentation',

    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

/* ============================================================
   SWAGGER JSON SPECIFICATION
   ============================================================ */

app.get(
  '/api/docs.json',
  (_req: Request, res: Response) => {
    res.json(swaggerSpec);
  }
);

/* ============================================================
   HEALTH CHECK
   ============================================================ */

app.get(
  '/api/health',
  async (_req: Request, res: Response) => {
    const timestamp = new Date().toISOString();
    try {
      await prisma.$queryRaw`SELECT 1`;

      return res.status(200).json({
        success: true,
        message: 'Health check passed',
        status: 'healthy',
        database: 'connected',
        timestamp,
        data: {
          status: 'healthy',
          database: 'connected',
          timestamp,
        },
      });
    } catch (error: any) {
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp,
        data: {
          status: 'unhealthy',
          database: 'disconnected',
          timestamp,
        },
      });
    }
  }
);

/* ============================================================
   API ROUTES
   ============================================================ */

app.use(
  '/api/v1',
  apiRouter
);

/* ============================================================
   CENTRALIZED ERROR HANDLER
   ============================================================ */

app.use(errorHandler);

/* ============================================================
   EXPORT APP
   ============================================================ */

export default app;
