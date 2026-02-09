import { getAuth } from '@clerk/express';
import type { Request, Response } from 'express';

import prisma from '@/lib/prisma';
import { AppError } from '@/utils/AppError';

/*
ROUTES
  /messages/:conversationId?limit=30&before=2026-02-05T01:22:00Z GET = getMessages
  /messages/:convsersationId POST = postMessages
*/

/**
 * GET /api/messages/:conversationId?limit=30&before=59581850069 // unix time
 */
export const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params as { conversationId: string };
  const limit = req.query.limit ? Number(req.query.limit) : 30;
  const before = req.query.before ? Number(req.query.before) : undefined;
  const auth = getAuth(req);

  if (!auth.userId) {
    throw AppError.Unauthorized('User not authenticated');
  }

  // Verify the user is a member of this conversation
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: auth.userId,
      },
    },
  });

  if (!membership) {
    throw AppError.Forbidden('You are not a member of this conversation');
  }

  // Fetch messages
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(before && { createdAt: { lt: new Date(before) } }),
    },
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  // Send the response immediately
  res.status(200).json(messages);

  // Mark unread messages as read in the background (fire-and-forget)
  // Find messages NOT sent by the current user that they haven't read yet
  try {
    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: auth.userId },
        isRead: false,
      },
      select: { id: true },
    });

    if (unreadMessages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: unreadMessages.map((m) => m.id) },
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }
  } catch (err) {
    // Non-critical -- log but don't fail the request
    console.error('Failed to update read receipts:', err);
  }
};

/**
 * POST /api/messages/:conversationId
 */
export const postMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const auth = getAuth(req);

  if (!auth.userId) {
    throw AppError.Unauthorized('User not authenticated');
  }

  if (!conversationId) {
    throw AppError.BadRequest('Conversation ID is required');
  }

  // Verify conversation exists and user is a member
  const membership = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: auth.userId,
      },
    },
  });

  if (!membership) {
    throw AppError.Forbidden('You are not a member of this conversation');
  }

  // Use the validated 'content' field from the Zod schema
  const { content, attachments } = req.body as {
    content: string;
    attachments?: string[];
  };

  if (!content || content.trim() === '') {
    throw AppError.BadRequest('Message content is required');
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: auth.userId,
      body: content,
      attachments: attachments || [],
    },
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  res.status(201).json(message);
};
