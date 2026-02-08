import type { NextFunction, Request, Response } from 'express';

/**
 * Prevents caching of sensitive / private responses.
 * Safe for healthcare / PHI.
 *
 * Blocks:
 * - Browser cache
 * - CDN cache
 * - ISP / proxy cache
 */
export function noCache(req: Request, res: Response, next: NextFunction) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, private'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  next();
}
