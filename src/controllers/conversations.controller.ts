import { getAuth } from '@clerk/express';
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
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
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
      createdAt: 'desc',
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
 * POST /api/conversations
 * Create a new conversation with members.
 * For 1:1 conversations (exactly 2 members), returns the existing
 * conversation if one already exists between the two users.
 */
export const createConversation = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw AppError.Unauthorized('Unauthorized');

  const { title, userIds } = req.body as { title?: string; userIds: string[] };

  if (!userIds || userIds.length === 0) {
    throw AppError.BadRequest('At least one member is required');
  }

  // Include the current user in the conversation
  const allMemberIds = [...new Set([userId, ...userIds])];
  const isGroup = allMemberIds.length > 2;

  // For 1:1 conversations, check if one already exists between these two users
  if (!isGroup && allMemberIds.length === 2) {
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: allMemberIds.map((id) => ({
          members: {
            some: { userId: id },
          },
        })),
        // Ensure it has exactly 2 members (not a group that happens to include both)
        members: {
          every: {
            userId: { in: allMemberIds },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      // Return the existing conversation instead of creating a duplicate
      res.status(200).json(existingConversation);
      return;
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      title: title || null,
      isGroup,
      members: {
        create: allMemberIds.map((id, index) => ({
          userId: id,
          role: index === 0 ? 'ADMIN' : 'MEMBER', // First member (creator) is admin
        })),
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json(conversation);
};

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
