import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from './config/index.js';
import { initDatabase, testConnection, closeDatabase } from './config/database.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import {
  helmetConfig,
  corsConfig,
  hppConfig,
  rateLimiter,
  xssSanitize,
  requestId,
} from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Create Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(corsConfig);
app.use(hppConfig);
app.use(requestId);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compression
app.use(compression());

// Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
app.use('/api', rateLimiter);

// XSS sanitization
app.use(xssSanitize);

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    database: dbStatus,
  });
});

// Serve uploaded images as static files
app.use('/uploads', express.static(join(__dirname, '../../uploads')));

// API routes
app.use(`/api/${config.apiVersion}`, routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize database connection pool
    logger.info('Connecting to SQL Server database...');
    await initDatabase();

    // Test database connection
    const dbStatus = await testConnection();
    if (!dbStatus.connected) {
      logger.warn(`Database connection issue: ${dbStatus.message}`);
    } else {
      logger.info('Database connected successfully');
    }

    // Start listening
    app.listen(config.port, () => {
      logger.info(`
╔════════════════════════════════════════════════════════════╗
║                    TanaCargo API Server                    ║
║                    (SQL Server Edition)                    ║
╠════════════════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(43)}║
║  Port: ${String(config.port).padEnd(50)}║
║  API Version: ${config.apiVersion.padEnd(43)}║
║  Database: ${config.database.name.padEnd(46)}║
║  URL: http://localhost:${config.port}/api/${config.apiVersion}${' '.repeat(30)}║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  closeDatabase().finally(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  closeDatabase().finally(() => process.exit(1));
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  try {
    await closeDatabase();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

export default app;
