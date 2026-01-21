import { Router } from 'express';
import {
  getMessages,
  getConversation,
  sendMessage,
  markAsRead,
  getUnreadCount,
} from '../controllers/messages.controller.js';
import { requireAuthentication, getUserFromClerk } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireAuthentication);
router.use(getUserFromClerk);

// GET /api/messages - Get all messages for the authenticated user
router.get('/', getMessages);

// GET /api/messages/unread-count - Get unread message count
router.get('/unread-count', getUnreadCount);

// GET /api/messages/conversation/:otherUserId - Get conversation with specific user
router.get('/conversation/:otherUserId', getConversation);

// POST /api/messages - Send a new message
router.post('/', sendMessage);

// PATCH /api/messages/:messageId/read - Mark message as read
router.patch('/:messageId/read', markAsRead);

export default router;
