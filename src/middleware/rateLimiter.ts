import rateLimit from 'express-rate-limit';

export const clerkAwareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  skip: (req) => {
    // Skip rate limiting if not authenticated or if it's an M2M token
    const auth = req.auth;
    return !auth || !('userId' in auth) || !auth.userId;
  },
  keyGenerator: (req) => {
    const auth = req.auth;
    // Type guard: check if auth has userId property (user auth vs M2M)
    if (auth && 'userId' in auth && auth.userId) {
      return `user:${auth.userId}`;
    }
    // Fallback to IP-based limiting for M2M or unauthenticated requests
    return `ip:${req.ip}`;
  },
});

export const globalIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // loose
  keyGenerator: (req) => `ip:${req.ip}`,
  standardHeaders: true, // adds RateLimit-* headers
  legacyHeaders: false, // disables X-RateLimit-* headers
});
