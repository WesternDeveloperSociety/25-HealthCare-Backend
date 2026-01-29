import type { Request, Response } from 'express';

// chat example
let messages: Array<{
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: string;
}> = [
  {
    id: 'm1',
    senderId: '1',
    recipientId: '2',
    text: 'Hey Doctor! Can we discuss the date of my appointment?',
    createdAt: new Date(2024, 0, 1, 12, 0, 0).toISOString(),
  },
  {
    id: 'm2',
    senderId: '2',
    recipientId: '1',
    text: 'Hi! We definitely can.',
    createdAt: new Date(2024, 0, 1, 12, 1, 0).toISOString(),
  },
  {
    id: 'm3',
    senderId: '1',
    recipientId: '3',
    text: 'Okay, thank you!',
    createdAt: new Date(2024, 0, 2, 9, 0, 0).toISOString(),
  },
];


/**
 * GET /api/chats
 * List all chats (in-memory). Replace with DB queries later.
 */
export const getAllChats = async (req: Request, res: Response) => {
  // TODO: add filtering, search, pagination
  res.json(messages);
};



/**
 * GET /api/chats/:recipientId
 * Returns chat messages between the current user and the recipient,
 * ordered by `createdAt` ascending.
 *
 * Notes:
 * - There is no auth middleware in this starter repo; clients should
 *   send the current user's id in the `x-user-id` header or as
 *   `currentUserId` in the query/body. This handler accepts either.
 * - Replace the in-memory store with Prisma queries once you add a
 *   Message model to `prisma/schema.prisma`.
 */
export const getMessages = async (req: Request, res: Response) => {
  const { recipientId } = req.params;

  if (!recipientId) {
    return res.status(400).json({ message: 'recipientId required' });
  }

  // Try several common locations for the current user id. Need to switch to authenticated session info or a middleware.
  const currentUserId =
    (req.header('x-user-id') as string) ||
    (req.query.currentUserId as string) ||
    (req.body.currentUserId as string);

  if (!currentUserId) {
    return res.status(400).json({ message: 'currentUserId required' });
  }

  const convo = messages
    .filter((m) =>
      (m.senderId === currentUserId && m.recipientId === recipientId) ||
      (m.senderId === recipientId && m.recipientId === currentUserId)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json(convo);
};

/**
 * POST /api/chats/:recipientId
 * Minimal helper to append a message to the in-memory store. This
 * mirrors the `createUser` pattern used elsewhere and is useful for
 * quickly testing the GET route from the frontend.
 */
export const sendMessage = async (req: Request, res: Response) => {
  const { recipientId } = req.params;
  const currentUserId = (req.header('x-user-id') as string) || (req.body.currentUserId as string);
  const { text } = req.body;

  if (!recipientId) {
    return res.status(400).json({ message: 'recipientId required' });
  }

  if (!currentUserId || !text) {
    return res.status(400).json({ message: 'currentUserId and text required' });
  }

  const newMessage = {
    id: Date.now().toString(),
    senderId: currentUserId,
    recipientId: recipientId,
    text,
    createdAt: new Date().toISOString(),
  };

  messages.push(newMessage);

  res.status(201).json(newMessage);
};
