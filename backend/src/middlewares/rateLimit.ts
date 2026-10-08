import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

interface Window {
  count: number;
  resetAt: number;
}

/**
 * Simple fixed-window rate limiter keyed by user id (falls back to IP).
 * State is kept in memory, so limits are per server instance and reset on restart.
 */
export const rateLimit = ({ windowMs, max }: { windowMs: number; max: number }) => {
  const windows = new Map<string, Window>();

  // Drop expired entries so the map does not grow forever
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of windows) {
      if (win.resetAt <= now) windows.delete(key);
    }
  }, windowMs).unref();

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const key = req.userId || req.ip || 'unknown';
    const now = Date.now();
    let win = windows.get(key);

    if (!win || win.resetAt <= now) {
      win = { count: 0, resetAt: now + windowMs };
      windows.set(key, win);
    }

    win.count++;
    if (win.count > max) {
      res.setHeader('Retry-After', Math.ceil((win.resetAt - now) / 1000));
      res.status(429).json({
        IsSuccess: false,
        Data: null,
        Message: 'Too many AI requests. Please wait a moment and try again.',
      });
      return;
    }

    next();
  };
};
