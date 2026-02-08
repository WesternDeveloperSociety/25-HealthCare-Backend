import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { registry } from '@/lib/openapi';
import { strictObject } from '@/utils';

extendZodWithOpenApi(z);

/**
 * Schemas - defined inline to avoid duplication
 */

export const GetMessagesSchema = strictObject({
  params: strictObject({
    conversationId: z.uuid(),
  }),
  query: strictObject({
    limit: z.coerce.number().min(1).max(100).optional().default(50),
    before: z.coerce.number().optional(),
  }).partial(),
});

export const PostMessageSchema = strictObject({
  params: strictObject({
    conversationId: z.uuid(),
  }),
  body: strictObject({
    content: z.string().min(1).max(10000),
    attachments: z.array(z.string()).max(10).optional(),
  }),
});

export const MarkMessageAsReadSchema = strictObject({
  params: strictObject({
    conversationId: z.uuid(),
    messageId: z.uuid(),
  }),
});

/**
 * Register OpenAPI paths - using inline schema definitions
 */

registry.registerPath({
  method: 'get',
  path: '/messages/{conversationId}',
  description: 'Get messages for a conversation',
  summary: 'Get messages',
  tags: ['Messages'],
  request: {
    params: z.object({
      conversationId: z.uuid(),
    }),
    query: z.object({
      limit: z.coerce.number().min(1).max(100).optional().default(50),
      before: z.coerce.number().optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of messages',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/messages/{conversationId}',
  description: 'Post a message to a conversation',
  summary: 'Post message',
  tags: ['Messages'],
  request: {
    params: z.object({
      conversationId: z.uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z
            .object({
              content: z.string().min(1).max(10000),
              attachments: z.array(z.string()).max(10).optional(),
            })
            .openapi('PostMessageBody'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Message created',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/messages/{conversationId}/{messageId}/read',
  description: 'Mark a message as read',
  summary: 'Mark as read',
  tags: ['Messages'],
  request: {
    params: z.object({
      conversationId: z.uuid(),
      messageId: z.uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Message marked as read',
    },
  },
});
