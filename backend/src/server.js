import http from 'http';
import app from './app.js';
import config from './config/env.js';
import { testConnection, sequelize } from './config/database.js';
import { initSockets } from './sockets/index.js';
import logger from './utils/logger.js';

const httpServer = http.createServer(app);

// Initialize Socket.IO Real-Time Chat
const io = initSockets(httpServer);

const startServer = async () => {
  try {
    // 1. Verify database connection
    await testConnection();

    // 2. Start HTTP server
    httpServer.listen(config.port, '0.0.0.0', () => {
      logger.info(`Bizora Backend Server is running in ${config.nodeEnv} mode on port ${config.port}`);
      // logger.info(`REST API available at: ${config.apiBaseUrl}/api/v1`);
      // logger.info(`Swagger Documentation available at: ${config.apiBaseUrl}/api-docs`);
      // logger.info(`Health check available at: ${config.apiBaseUrl}/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  httpServer.close(async () => {
    logger.info('HTTP server closed.');

    if (io) {
      io.close(() => {
        logger.info('Socket.IO connections closed.');
      });
    }

    try {
      await sequelize.close();
      logger.info('Database connection pool closed successfully.');
    } catch (err) {
      logger.error(`Error closing database connection: ${err.message}`);
    }

    process.exit(0);
  });

  // Force exit if not gracefully closed within 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

export { app, httpServer, io, sequelize };

