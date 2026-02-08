import { Router } from 'express';

import { getMessages, postMessages } from '@/controllers/messages.controller';
import { requireAuthentication } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  GetMessagesSchema,
  PostMessageSchema,
} from '@/schemas/messages.schema';

const router = Router();

// Protected routes - require authentication
router.use(requireAuthentication);

/* MESSAGE BASED */
router.get('/:conversationId', validate(GetMessagesSchema.shape), getMessages); // paginated method to get data
// ^ example: GET /123?limit=30&before=2026-02-05T01:22:00Z
router.post(
  '/:conversationId',
  validate(PostMessageSchema.shape),
  postMessages
); // create conversation

export default router;
