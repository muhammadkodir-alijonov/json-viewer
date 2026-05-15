import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from './types/index.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { setupSocketHandlers } from './rooms/socketHandler.js';
import jsonRoutes from './routes/json.js';
import roomRoutes from './routes/rooms.js';
import healthRoutes from './routes/health.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app: Application = express();
  const httpServer = createServer(app);

  // ─── Socket.io Setup ──────────────────────────────────────────────
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Performance settings for 100+ users
    pingTimeout: 20000,
    pingInterval: 10000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 10 * 1024 * 1024, // 10MB
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    // Compression
    perMessageDeflate: {
      threshold: 1024, // 1KB dan katta bo'lsa compress
    },
  });

  // ─── Express Middleware ────────────────────────────────────────────
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }));

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  app.use(compression());

  app.use(express.json({
    limit: `${process.env.MAX_JSON_SIZE_MB || '10'}mb`,
  }));

  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // ─── Routes ───────────────────────────────────────────────────────
  app.use('/health', healthRoutes);
  app.use('/api/json', apiRateLimiter, jsonRoutes);
  app.use('/api/rooms', roomRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Route ${req.path} not found`,
    });
  });

  // Global error handler
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    });
  });

  // ─── Socket Handlers ──────────────────────────────────────────────
  setupSocketHandlers(io);

  return { app, httpServer, io };
}
