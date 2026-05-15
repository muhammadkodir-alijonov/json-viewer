import { Router, Request, Response } from 'express';
import { roomManager } from '../rooms/roomManager.js';

const router = Router();

/**
 * GET /health
 * Server health check
 */
router.get('/', (req: Request, res: Response) => {
  const stats = roomManager.getServerStats();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: stats.uptime,
    version: process.env.npm_package_version || '1.0.0',
    stats: {
      rooms: stats.totalRooms,
      clients: stats.totalClients,
      memory: {
        used: Math.round(stats.memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(stats.memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      },
    },
  });
});

export default router;
