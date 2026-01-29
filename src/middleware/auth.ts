import { clerkClient, requireAuth } from '@clerk/express';

// requireAuth middleware handles authentication
export const requireAuthentication = requireAuth();

// Export clerkClient for direct API access in routes
export { clerkClient };