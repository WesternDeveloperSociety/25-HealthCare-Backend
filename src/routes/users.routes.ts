import { Router } from 'express';

import {
  createUser,
  getCurrentUser,
  getUserById,
  updateCurrentUser,
} from '@/controllers/users.controller';
import { requireAuthentication } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  CreateUserSchema,
  GetUserByIdSchema,
  UpdateUserSchema,
} from '@/schemas/users.schema';

const router = Router();

// Public route for creating/syncing users (for Clerk webhooks)
router.post('/', validate(CreateUserSchema.shape), createUser);

// Protected routes - require authentication
router.use(requireAuthentication);

// Get current authenticated user
router.get('/me', getCurrentUser);

// Update current authenticated user
router.patch('/me', validate(UpdateUserSchema.shape), updateCurrentUser);

// Get specific user by ID
router.get('/:id', validate(GetUserByIdSchema.shape), getUserById);

export default router;
