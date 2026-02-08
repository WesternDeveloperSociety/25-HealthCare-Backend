import { Router } from 'express';

import {
  addMemberToConversation,
  createConverstation,
  leaveConverstation,
  removeMemberFromConversation,
  subscribeToConversation,
} from '@/controllers/conversations.controller';
import { requireAuthentication } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  AddMemberSchema,
  CreateConversationSchema,
  LeaveConversationSchema,
  RemoveMemberSchema,
  SubscribeToConversationSchema,
} from '@/schemas/conversations.schema';

const router = Router();

// Protected routes - require authentication
router.use(requireAuthentication);

/* CONVERSATION BASED */
// Conversation Management
router.get(
  '/subscribe/:conversationId',
  validate(SubscribeToConversationSchema.shape),
  subscribeToConversation
); // via SSE (sever sent events)

router.post('/', validate(CreateConversationSchema.shape), createConverstation);

// Membership Relating Routes
router.post(
  '/members/:conversationId/members',
  validate(AddMemberSchema.shape),
  addMemberToConversation
);
router.delete(
  '/members/:conversationId/members/:userId',
  validate(RemoveMemberSchema.shape),
  removeMemberFromConversation
);
router.delete(
  '/members/:conversationId/leave',
  validate(LeaveConversationSchema.shape),
  leaveConverstation
);

export default router;
