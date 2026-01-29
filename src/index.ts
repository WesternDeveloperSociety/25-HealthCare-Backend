import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import usersRouter from './routes/users.routes.js';

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;


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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
