import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { createSocket } from './config/socket.js';
import authRoutes from './routes/authRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const server = http.createServer(app);
const io = createSocket(server);
app.set('io', io);

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: env.clientUrl,
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: 'RATE_LIMIT_EXCEEDED: Too many auth requests, please try again later.' }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'agentflow-ai-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    langGraph: 'not-installed',
    environment: env.nodeEnv
  });
});

// Route Handlers
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('[API Error]', error);
  const status = error.status || error.statusCode || 500;
  res.status(status).json({
    error: error.code || 'INTERNAL_SERVER_ERROR',
    message: error.message || 'An unexpected error occurred.',
    stack: env.nodeEnv === 'development' ? error.stack : undefined
  });
});

// Start Server
await connectDatabase();
server.listen(env.port, () => {
  console.log(`=======================================================`);
  console.log(`⚡ Agentflow_AI Server listening on http://localhost:${env.port}`);
  console.log(`⚡ Real-Time Socket.IO Server active`);
  console.log(`⚡ Zero-Config Local Mode: Enabled`);
  console.log(`=======================================================`);
});
