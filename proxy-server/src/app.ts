import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for API proxy
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) =>
  o.trim()
) || ['http://localhost:5173', 'http://localhost:3000'];

console.log('📋 Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      auth: process.env.AUTH_SERVER_URL,
      content: process.env.CONTENT_SERVER_URL,
      upload: process.env.UPLOAD_SERVER_URL,
      aiChat: process.env.AI_CHAT_URL,
    },
  });
});

// Proxy configuration helper
const createProxy = (target: string, pathRewrite?: Record<string, string>) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        // Forward original IP
        const forwarded = req.headers?.['x-forwarded-for'];
        const ip = forwarded
          ? String(forwarded).split(',')[0]
          : req.socket?.remoteAddress;
        proxyReq.setHeader('X-Forwarded-For', ip || '');
        proxyReq.setHeader('X-Real-IP', ip || '');

        // Log the actual path being proxied
        const originalPath = req.url;
        const targetPath = proxyReq.path;
        console.log(
          `[PROXY] ${req.method} ${originalPath} -> ${target}${targetPath}`
        );

        // Debug: Log headers and body info
        console.log('[PROXY DEBUG] Headers:', {
          'content-type': req.headers?.['content-type'],
          'content-length': req.headers?.['content-length'],
        });
      },
      proxyRes: (proxyRes, req) => {
        const statusCode = proxyRes.statusCode || 0;
        console.log(`[PROXY] ${req.method} ${req.url} <- ${statusCode}`);

        // Log error details for debugging
        if (statusCode >= 400) {
          console.error(
            `[PROXY ERROR] ${statusCode} response from ${target}${req.url}`
          );

          // Try to capture error response body
          let errorBody = '';
          proxyRes.on('data', (chunk) => {
            errorBody += chunk.toString();
          });
          proxyRes.on('end', () => {
            if (errorBody) {
              console.error('[PROXY ERROR BODY]:', errorBody.substring(0, 500));
            }
          });
        }
      },
      error: (err, req, res) => {
        console.error(`[PROXY ERROR] ${req.method} ${req.url}:`, err.message);
        if ('writeHead' in res) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Bad Gateway',
              message: 'The upstream service is unavailable',
              path: req.url,
            })
          );
        }
      },
    },
  });

// AI Chat proxy - handle all chat-related routes
// Manual path rewriting in the handler
app.use(
  '/api/chat',
  (req, res, next) => {
    // Rewrite the path: /turn_response -> /api/turn_response
    const originalUrl = req.url;
    req.url = '/api' + req.url;
    console.log(`[PATH REWRITE] ${originalUrl} -> ${req.url}`);
    next();
  },
  createProxy(process.env.AI_CHAT_URL || 'http://10.120.36.58')
);

// Alternative: if the AI chat has its own /api prefix, use this instead:
// app.use('/chat', createProxy(
//   process.env.AI_CHAT_URL || 'http://10.120.36.58'
// ));

// Auth server proxy
app.use(
  '/api/auth',
  createProxy(
    process.env.AUTH_SERVER_URL || 'http://localhost:3001',
    { '^/api/auth': '/api/v1' } // Rewrite to match auth server routes
  )
);

// Content server proxy
app.use(
  '/api/content',
  createProxy(
    process.env.CONTENT_SERVER_URL || 'http://localhost:3002',
    { '^/api/content': '/api/v1' } // Rewrite to match content server routes
  )
);

// Upload server proxy
app.use(
  '/api/upload',
  createProxy(
    process.env.UPLOAD_SERVER_URL || 'http://localhost:3003',
    { '^/api/upload': '/api/v1' } // Rewrite to match upload server routes
  )
);

// Catch-all for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl,
    availableRoutes: [
      '/health',
      '/api/auth/*',
      '/api/content/*',
      '/api/upload/*',
      '/api/chat/*',
    ],
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
  });
});

export default app;
