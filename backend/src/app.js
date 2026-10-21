import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import config from './config/env.js';
import corsOptions from './config/cors.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';
import { setupSwagger } from './docs/swagger.js';
import logger from './utils/logger.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
app.use(cors(corsOptions));

// Cookie Parser
app.use(cookieParser());

// Body Parsers with payload limits (preserves rawBody for webhook signature verification)
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
if (config.nodeEnv !== 'test') {
  app.use(
    morgan('dev', {
      stream: { write: (message) => logger.info(message.trim()) }
    })
  );
}

// Global Rate Limiting
app.use(globalLimiter);

// Protect private chat attachments from unauthorized direct access
app.use('/uploads/chat-attachments', (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Direct access to chat attachments is forbidden. Use authenticated chat endpoints.'
  });
});

// Serve static uploaded files safely (avatars, product images, store banners)
const uploadsPath = path.resolve(process.cwd(), config.upload.dir);
app.use('/uploads', express.static(uploadsPath));

// API Documentation via Swagger UI
setupSwagger(app);

// Mount Application Routes
app.use(routes);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;

