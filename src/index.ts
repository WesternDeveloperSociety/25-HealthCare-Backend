import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { startupChecks } from '@/lib/env';
import { generateOpenAPI } from '@/lib/openapi';
import { errorHandler } from '@/middleware/errorHandler';
import { noCache } from '@/middleware/noCache';
import { clerkAwareLimiter, globalIpLimiter } from '@/middleware/rateLimiter';
import conversationsRouter from '@/routes/conversations.routes';
// import documentsRouter from '@/routes/documents.routes';
import messagesRouter from '@/routes/messages.routes';
import uploadRouter from '@/routes/upload.routes';
import usersRouter from '@/routes/users.routes';

// Checks if All Environment Variables Exist
await startupChecks();

/* Basic Setup Boilerplate */
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5110;
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:19006',
    credentials: true,
  })
);
app.use(express.json());

// OpenAPI JSON endpoint for frontend type generation
app.get('/api/openapi.json', (req, res) => {
  res.json(generateOpenAPI());
});

// Routes
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/upload', uploadRouter);
// app.use('/api/documents', documentsRouter);

/* SECURITY */
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' })); // limit for JSON bodies
app.use(express.urlencoded({ limit: '10mb', extended: true })); // limit for URL-encoded bodies

/* SECURITY - Middleware */
app.use(clerkMiddleware());
app.use(globalIpLimiter); // Limits requests per IP
app.use(clerkAwareLimiter); // Limits requests per Clerk user
app.use(noCache); // Prevents caching of sensitive / private responses
app.use(errorHandler);

/* SECURITY - Dev Only Tools */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(generateOpenAPI()));
}

/* Start Server */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
