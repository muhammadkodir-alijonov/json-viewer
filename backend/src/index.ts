import 'dotenv/config';
import { createApp } from './server.js';
import { logger } from './utils/logger.js';
import { roomManager } from './rooms/roomManager.js';

const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const { httpServer } = createApp();

  httpServer.listen(PORT, HOST, () => {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('  JSON Viewer Backend — Started!');
    logger.info(`  URL:  http://localhost:${PORT}`);
    logger.info(`  Mode: ${process.env.NODE_ENV || 'development'}`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info(`\nReceived ${signal}. Shutting down gracefully...`);
    httpServer.close(() => {
      roomManager.destroy();
      logger.info('Server closed.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Force shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
}

main();
