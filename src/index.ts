import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import usersRouter from './routes/users.routes.js';
import appointmentsRouter from './routes/appointments.routes.js';
import documentsRouter from './routes/documents.routes.js';
import messagesRouter from './routes/messages.routes.js';
import { initializeSocket } from './config/socket.js';

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/messages', messagesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

httpServer.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📡 WebSocket server ready for connections`);
});
