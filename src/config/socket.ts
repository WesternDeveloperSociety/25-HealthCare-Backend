import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import prisma from '../lib/prisma.js';

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Store user socket connections
  const userSockets = new Map<string, string>(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user to their personal room
    socket.on('join', async (userId: string) => {
      try {
        // Verify user exists
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          socket.join(userId);
          userSockets.set(userId, socket.id);
          console.log(
            `User ${user.firstName} ${user.lastName} joined room ${userId}`
          );

          // Send confirmation
          socket.emit('joined', { userId, socketId: socket.id });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ senderId, recipientId }) => {
      io.to(recipientId).emit('userTyping', { userId: senderId });
    });

    // Handle stop typing
    socket.on('stopTyping', ({ senderId, recipientId }) => {
      io.to(recipientId).emit('userStoppedTyping', { userId: senderId });
    });

    // Handle message read receipt
    socket.on('messageRead', ({ messageId, userId }) => {
      // Broadcast to sender that message was read
      io.emit('messageReadReceipt', { messageId, userId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Remove user from online users
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};
