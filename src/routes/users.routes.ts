import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
} from '../controllers/users.controller.js';

const router = Router();

// TODO: add Clerk requireAuth middleware to all routes

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

export default router;
