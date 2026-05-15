import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please slow down.',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 60000,
  max: 20,
  message: {
    success: false,
    error: 'Too many requests on this endpoint.',
  },
});

// Socket.io per-event rate limiting helper
export class SocketRateLimiter {
  private counts: Map<string, { count: number; resetAt: number }> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 50, windowMs = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Cleanup old entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.counts.entries()) {
        if (value.resetAt < now) {
          this.counts.delete(key);
        }
      }
    }, 60000);
  }

  isAllowed(socketId: string): boolean {
    const now = Date.now();
    const entry = this.counts.get(socketId);

    if (!entry || entry.resetAt < now) {
      this.counts.set(socketId, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }
}
