import app from './app';
import { connectDB } from './config/prisma';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(Number(PORT), '0.0.0.0', () => {
    logger.info(`=================================================`);
    logger.info(`  MediCore HMS Backend API Server`);
    logger.info(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`  Server URL: http://localhost:${PORT}/api/v1`);
    logger.info(`  Swagger Docs: http://localhost:${PORT}/api/docs`);
    logger.info(`  Health Check: http://localhost:${PORT}/api/health`);
    logger.info(`=================================================`);
  });
}

startServer().catch((err) => {
  logger.error('Fatal server error:', err);
  process.exit(1);
});
