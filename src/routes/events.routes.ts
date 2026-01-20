import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
} from '../controllers/events.controller.js';

const router = Router();

// TODO: add Clerk requireAuth middleware to all routes

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);

export default router;
