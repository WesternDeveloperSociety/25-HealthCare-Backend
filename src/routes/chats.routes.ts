import { Router } from 'express';
import { getAllChats, getMessages, sendMessage } from '../controllers/chats.controller.js';

const router = Router();

// TODO: add Clerk requireAuth middleware to all routes

// Get messages between current user and recipient
router.get('/', getAllChats);
router.get('/:recipientId', getMessages);

// Send a new message (minimal helper for testing)
router.post('/:recipientId', sendMessage);

export default router;
