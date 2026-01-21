import { clerkClient, requireAuth } from '@clerk/express';

// requireAuth middleware handles authentication
export const requireAuthentication = requireAuth();

// Export clerkClient for direct API access in routes
export { clerkClient };

// Middleware to attach user info to request
export const getUserFromClerk = async (req: any, res: any, next: any) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach Clerk user ID to request
    req.clerkId = userId;
    next();
  } catch (error) {
    console.error('Error in getUserFromClerk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
