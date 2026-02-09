import { getAuth } from '@clerk/express';
import { UserRole } from '@prisma/client';
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
  // Validated by Zod
  const limit = req.query.limit ? Number(req.query.limit) : 30;
  const before = req.query.before ? Number(req.query.before) : undefined;
  const auth = getAuth(req);

  // Fetching Messages
  await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw AppError.NotFound('Conversation not found');
    }

    const messages = await tx.message.findMany({
      where: {
        conversationId,
        ...(before && { createdAt: { lt: new Date(Number(before)) } }),
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
      take: limit ? Number(limit) : 30,
      orderBy: { createdAt: 'desc' },
    });

    const attachements = await Promise.all(
      messages.map((message) => {
        message.attachments.map((attachment) => { });
      })
    );

    // Sending Messages (Client Recieves Messages)
    res.status(200).json(messages);

    // Updating Read Receipts
    if (auth.userId) {
      const unreadMessages = await tx.message.findMany({
        where: {
          conversationId,
          isRead: true,
          readBy: {
            none: {
              id: auth.userId,
            },
          },
        },
      });

      await Promise.all(
        unreadMessages.map((message) =>
          tx.message.update({
            where: { id: message.id },
            data: { readBy: { connect: { id: auth.userId } } },
          })
        )
      );
    }
  });
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
        conversationId: conversationId as string,
        userId: auth.userId,
      },
    },
  });

  if (!membership) {
    throw AppError.Forbidden('You are not a member of this conversation');
  }

  // Accept both 'body' (schema) and 'content' (frontend compatibility)
  const { body, content, attachments } = req.body as {
    body?: string;
    content?: string;
    attachments?: string[]
  };

  const messageBody = body || content;

  if (!messageBody || messageBody.trim() === '') {
    throw AppError.BadRequest('Message body is required');
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversationId as string,
      senderId: auth.userId,
      body: messageBody,
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
