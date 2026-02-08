import { getAuth } from '@clerk/express';
import { UserRole } from '@prisma/client';
import type { Request, Response } from 'express';
import { AppError } from '@/utils/AppError';

import prisma from '@/lib/prisma';

/* 
ROUTES
  /conversations/subscribe/:conversationId GET = subscribeToConversation,
  /conversations/:conversationId POST = createConverstation,
  
  /conversations/members/:conversationId/members POST = addMemberToConversation,
  /converstations/members/:conversationId/leave DELETE = removeMemberFromConversation
  /conversations/:conversationId/members/:userId DELETE = leaveConverstation,
*/

/**
 * GET /api/conversations
 */
export const getConversations = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw AppError.Unauthorized('Unauthorized');

  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc', // or last message time
    },
  });

  res.json(conversations);
};

/**
 * GET /api/conversations/subscribe/:conversationId
 */
export const subscribeToConversation = async (
  req: Request,
  res: Response
) => {
  // Mock implementation for now
  res.status(501).json({ message: 'Not implemented' });
};

/**
 * POST /api/conversations/:conversationId
 */
export const createConverstation = async (req: Request, res: Response) => { };

/**
 * POST /api/conversations/members/:conversationId/members
 */
export const addMemberToConversation = async (
  req: Request,
  res: Response
) => { };

/**
 * DELETE /api/converstations/members/:conversationId/leave
 */
export const leaveConverstation = async (req: Request, res: Response) => { };

/**
 * DELETE /api/conversations/:conversationId/members/:userId
 */
export const removeMemberFromConversation = async (
  req: Request,
  res: Response
) => { };
