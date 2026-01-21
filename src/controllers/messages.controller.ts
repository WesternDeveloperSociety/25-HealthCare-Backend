import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

interface AuthRequest extends Request {
  clerkId?: string;
}

// Get all messages for the authenticated user (sent or received)
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.clerkId;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { recipientId: user.id }],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            specialty: true,
            profileImage: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            specialty: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Get conversation between two users
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.clerkId;
    const { otherUserId } = req.params;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: user.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            specialty: true,
            profileImage: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            specialty: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.clerkId;
    const { recipientId, subject, body, attachments } = req.body;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!recipientId || !subject || !body) {
      return res.status(400).json({
        error: 'Missing required fields: recipientId, subject, body',
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        recipientId,
        subject,
        body,
        attachments: attachments || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            specialty: true,
            profileImage: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            specialty: true,
            profileImage: true,
          },
        },
      },
    });

    // Emit socket event (will be handled by socket.io)
    const io = req.app.get('io');
    if (io) {
      io.to(recipientId).emit('newMessage', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark message as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.clerkId;
    const { messageId } = req.params;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!messageId) {
      return res.status(400).json({ error: 'Message ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify user is the recipient
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.recipientId !== user.id) {
      return res
        .status(403)
        .json({ error: 'Not authorized to mark this message as read' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// Get unread message count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.clerkId;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const count = await prisma.message.count({
      where: {
        recipientId: user.id,
        isRead: false,
      },
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};
