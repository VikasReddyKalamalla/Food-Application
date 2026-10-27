import http from 'node:http';
import app from './app.js';
import env from './config/env.js';
import logger from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { initSocketServer, getIO } from './infrastructure/realtime/socket.js';

const httpServer = http.createServer(app);

// Initialize real-time Socket.IO layer
const io = initSocketServer(httpServer);

let isShuttingDown = false;

/**
 * Graceful termination handler
 * @param {string} signal
 */
export const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, 'Received termination signal, starting graceful shutdown...');

  // Force termination if graceful shutdown stalls
  const forceExitTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out after 10s. Forcing exit.');
    process.exit(1);
  }, 10000);
  forceExitTimeout.unref();

  try {
    // 1. Close HTTP server (stops accepting new connections)
    if (httpServer.listening) {
      await new Promise((resolve) => {
        httpServer.close((err) => {
          if (err) logger.error({ err }, 'Error closing HTTP server');
          else logger.info('HTTP server closed successfully');
          resolve();
        });
      });
    }

    // 2. Close Socket.IO connections
    if (io) {
      await new Promise((resolve) => {
        io.close(() => {
          logger.info('Socket.IO connections closed successfully');
          resolve();
        });
      });
    }

    // 3. Disconnect MongoDB
    await disconnectDatabase();

    logger.info('Graceful shutdown completed successfully.');
    process.exit(0);
  } catch (error) {
    logger.error({ error: error.message }, 'Error occurred during graceful shutdown');
    process.exit(1);
  }
};

/**
 * Main application startup
 */
export const startServer = async () => {
  try {
    // Connect to Database
    await connectDatabase();

    // Start Listening
    httpServer.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
          apiDocs: `http://localhost:${env.PORT}/api-docs`,
          healthEndpoint: `http://localhost:${env.PORT}/health`,
          readyEndpoint: `http://localhost:${env.PORT}/ready`,
        },
        'Food Delivery Platform Backend started successfully'
      );
    });

    // Process Signal Handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Process Exception Safety
    process.on('unhandledRejection', (reason) => {
      logger.fatal({ reason }, 'Unhandled Promise Rejection detected');
      gracefulShutdown('unhandledRejection');
    });

    process.on('uncaughtException', (err) => {
      logger.fatal({ err: err.message, stack: err.stack }, 'Uncaught Exception detected');
      gracefulShutdown('uncaughtException');
    });

    return httpServer;
  } catch (error) {
    logger.fatal({ error: error.message }, 'Failed to start server');
    process.exit(1);
  }
};

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}

export default {
  startServer,
  gracefulShutdown,
  httpServer,
};
