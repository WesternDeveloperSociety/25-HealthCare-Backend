import 'dotenv/config';
import express from 'express';
import usersRouter from './routes/users.routes.js';
import appointmentsRouter from './routes/appointments.routes.js';
import documentsRouter from './routes/documents.routes.js';
import chatsRouter from './routes/chats.routes.js';

const app = express();
const port = process.env.PORT;

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/chats', chatsRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
