import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  getCurrentUser,
  updateCurrentUser,
} from '../controllers/users.controller.js';
import {
  requireAuthentication,
  getUserFromClerk,
} from '../middleware/auth.js';

const router = Router();

// Public route for creating/syncing users (for Clerk webhooks)
router.post('/', createUser);

// Protected routes - require authentication
router.use(requireAuthentication);
router.use(getUserFromClerk);

// Get current authenticated user
router.get('/me', getCurrentUser);

// Update current authenticated user
router.patch('/me', updateCurrentUser);

// Get all users (with optional filtering)
router.get('/', getAllUsers);

// Get specific user by ID
router.get('/:id', getUserById);

export default router;
