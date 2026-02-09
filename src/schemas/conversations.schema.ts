import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { registry } from '@/lib/openapi';
import { strictObject } from '@/utils';

extendZodWithOpenApi(z);

/**
 * Schemas - defined inline to avoid duplication
 */

export const GetConversationsSchema = strictObject({
  query: strictObject({
    limit: z.coerce.number().min(1).max(100).optional().default(50),
    offset: z.coerce.number().min(0).optional().default(0),
  }).partial(),
});

export const GetConversationByIdSchema = strictObject({
  params: strictObject({
    conversationId: z.uuid(),
  }),
});

export const SubscribeToConversationSchema = strictObject({
  params: strictObject({
    conversationId: z.uuid(),
  }),
});

export const CreateConversationSchema = strictObject({
  body: strictObject({
    userIds: z.array(z.string().min(1)).min(1).max(50),
    title: z.string().min(1).max(100).optional(),
  }),
});

export const UpdateConversationSchema = strictObject({
  params: strictObject({
    conversationId: z.uuid(),
  }),
  body: strictObject({
    title: z.string().min(1).max(100),
  }).partial(),
});

export const AddMemberSchema = strictObject({
  params: strictObject({
    conversationId: z.uuid(),
  }),
  body: strictObject({
    userId: z.string().min(1),
    role: z.enum(['MEMBER', 'ADMIN']).optional().default('MEMBER'),
  }),
});

export const RemoveMemberSchema = strictObject({
  params: strictObject({
    conversationId: z.uuid(),
    userId: z.string().min(1),
  }),
});

export const LeaveConversationSchema = strictObject({
  params: strictObject({
    conversationId: z.uuid(),
  }),
});

/**
 * Response schemas for OpenAPI
 */
const ConversationListItemSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  isGroup: z.boolean(),
  createdAt: z.string(),
});

const ConversationDetailSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  isGroup: z.boolean(),
  createdAt: z.string(),
  members: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    role: z.string(),
    user: z.object({
      firstName: z.string(),
      lastName: z.string(),
    }).optional(),
  })),
});

/**
 * Register OpenAPI paths - using inline schema definitions
 */

registry.registerPath({
  method: 'get',
  path: '/conversations',
  description: 'Get all conversations for the current user',
  summary: 'List conversations',
  tags: ['Conversations'],
  request: {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).optional().default(50),
      offset: z.coerce.number().min(0).optional().default(0),
    }),
  },
  responses: {
    200: {
      description: 'List of conversations',
      content: {
        'application/json': {
          schema: z.array(ConversationListItemSchema.openapi('ConversationListItem')),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/conversations/{conversationId}',
  description: 'Get a specific conversation by ID',
  summary: 'Get conversation',
  tags: ['Conversations'],
  request: {
    params: z.object({
      conversationId: z.uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Conversation details',
    },
    404: {
      description: 'Conversation not found',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/conversations',
  description: 'Create a new conversation',
  summary: 'Create conversation',
  tags: ['Conversations'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z
            .object({
              userIds: z.array(z.string().min(1)).min(1).max(50),
              title: z.string().min(1).max(100).optional(),
            })
            .openapi('CreateConversationBody'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Conversation created',
      content: {
        'application/json': {
          schema: ConversationDetailSchema.openapi('ConversationDetail'),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/conversations/{conversationId}',
  description: 'Update conversation settings',
  summary: 'Update conversation',
  tags: ['Conversations'],
  request: {
    params: z.object({
      conversationId: z.uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z
            .object({
              title: z.string().min(1).max(100),
            })
            .openapi('UpdateConversationBody'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Conversation updated',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/conversations/subscribe/{conversationId}',
  description: 'Subscribe to conversation events (SSE)',
  summary: 'Subscribe to conversation',
  tags: ['Conversations'],
  request: {
    params: z.object({
      conversationId: z.uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Event stream',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/conversations/{conversationId}/members',
  description: 'Add a member to a conversation',
  summary: 'Add member',
  tags: ['Conversations'],
  request: {
    params: z.object({
      conversationId: z.uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z
            .object({
              userId: z.string().min(1),
              role: z.enum(['MEMBER', 'ADMIN']).optional().default('MEMBER'),
            })
            .openapi('AddMemberBody'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Member added',
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/conversations/{conversationId}/members/{userId}',
  description: 'Remove a member from a conversation',
  summary: 'Remove member',
  tags: ['Conversations'],
  request: {
    params: z.object({
      conversationId: z.uuid(),
      userId: z.string().min(1),
    }),
  },
  responses: {
    200: {
      description: 'Member removed',
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/conversations/{conversationId}/leave',
  description: 'Leave a conversation',
  summary: 'Leave conversation',
  tags: ['Conversations'],
  request: {
    params: z.object({
      conversationId: z.uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Left conversation',
    },
  },
});
