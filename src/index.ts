import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import usersRouter from './routes/users.routes.js';
import appointmentsRouter from './routes/appointments.routes.js';
import documentsRouter from './routes/documents.routes.js';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/documents', documentsRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.send('Hello World');
});
