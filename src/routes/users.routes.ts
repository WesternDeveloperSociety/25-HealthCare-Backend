import { Router } from 'express';
import {
  getUserById,
  createUser,
  getCurrentUser,
  updateCurrentUser,
} from '../controllers/users.controller.js';
import {
  requireAuthentication,
} from '../middleware/auth.js';

const router = Router();

// Public route for creating/syncing users (for Clerk webhooks)
router.post('/', createUser);

// Protected routes - require authentication
router.use(requireAuthentication);

// Get current authenticated user
router.get('/me', getCurrentUser);

// Update current authenticated user
router.patch('/me', updateCurrentUser);

// Get specific user by ID
router.get('/:id', getUserById);

export default router;
