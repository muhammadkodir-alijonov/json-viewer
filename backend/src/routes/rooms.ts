import { Router, Request, Response } from 'express';
import { roomManager } from '../rooms/roomManager.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * POST /api/rooms/create
 * Yangi room yaratish
 */
router.post('/create', apiRateLimiter, (req: Request, res: Response) => {
  try {
    const roomId = roomManager.createRoom();
    return res.status(201).json({
      success: true,
      data: { roomId },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create room',
    });
  }
});

/**
 * GET /api/rooms/:roomId
 * Room mavjudligini va statistikasini olish
 */
router.get('/:roomId', apiRateLimiter, (req: Request, res: Response) => {
  const { roomId } = req.params;

  if (!roomManager.roomExists(roomId)) {
    return res.status(404).json({
      success: false,
      error: 'Room not found',
    });
  }

  const stats = roomManager.getRoomStats(roomId);
  return res.json({
    success: true,
    data: stats,
  });
});

/**
 * GET /api/rooms/:roomId/clients
 * Room clientlarini olish
 */
router.get('/:roomId/clients', apiRateLimiter, (req: Request, res: Response) => {
  const { roomId } = req.params;

  if (!roomManager.roomExists(roomId)) {
    return res.status(404).json({
      success: false,
      error: 'Room not found',
    });
  }

  const clients = roomManager.getRoomClients(roomId);
  return res.json({
    success: true,
    data: { clients, count: clients.length },
  });
});

export default router;
