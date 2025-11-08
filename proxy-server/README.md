# VA Proxy Server

Reverse proxy server for Vaihtoaktivaattori backend services and AI chat integration.

## Overview

This proxy server acts as a single entry point for all backend services:

- **Auth Server** (port 3001) - User authentication and authorization
- **Content Server** (port 3002) - Content management
- **Upload Server** (port 3003) - File uploads
- **AI Chat** (http://10.120.36.58) - OpenAI chat assistant

## Features

- ✅ Reverse proxy to multiple backend services
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ Request logging
- ✅ Health check endpoint
- ✅ Error handling
- ✅ IP forwarding

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.sample` to `.env` and update the values:

   ```bash
   cp .env.sample .env
   ```

3. **Build TypeScript:**

   ```bash
   npm run build
   ```

4. **Start the server:**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Routes

| Route            | Target                 | Description              |
| ---------------- | ---------------------- | ------------------------ |
| `GET /health`    | -                      | Health check endpoint    |
| `/api/auth/*`    | Auth Server (3001)     | Authentication endpoints |
| `/api/content/*` | Content Server (3002)  | Content management       |
| `/api/upload/*`  | Upload Server (3003)   | File uploads             |
| `/api/chat/*`    | AI Chat (10.120.36.58) | AI assistant chat        |

## Environment Variables

### Required

- `PORT` - Proxy server port (default: 3000)
- `AUTH_SERVER_URL` - Auth server URL
- `CONTENT_SERVER_URL` - Content server URL
- `UPLOAD_SERVER_URL` - Upload server URL
- `AI_CHAT_URL` - AI chat service URL

### Optional

- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds (default: 60000)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `NODE_ENV` - Environment (development/production)

## Usage Examples

### Frontend Configuration

Update your frontend to use the proxy server:

```typescript
// Old (direct to services)
const AUTH_API = 'http://localhost:3001/api/v1';
const CONTENT_API = 'http://localhost:3002/api/v1';
const AI_CHAT_API = 'http://10.120.36.58';

// New (through proxy)
const API_BASE = 'http://localhost:3000';
const AUTH_API = `${API_BASE}/api/auth`;
const CONTENT_API = `${API_BASE}/api/content`;
const AI_CHAT_API = `${API_BASE}/api/chat`;
```

### Health Check

```bash
curl http://localhost:3000/health
```

### Testing Proxied Requests

```bash
# Auth request
curl http://localhost:3000/api/auth/users

# Content request
curl http://localhost:3000/api/content/destinations

# AI Chat request
curl -X POST http://localhost:3000/api/chat/turn_response \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

## Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name va-proxy

# Save configuration
pm2 save
pm2 startup
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Nginx Configuration (Optional)

If you want to put Nginx in front of the proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Considerations

1. **Rate Limiting**: Configured to 100 requests/minute per IP
2. **CORS**: Restrict allowed origins in production
3. **Helmet**: Security headers enabled
4. **IP Forwarding**: Real client IP forwarded to backend services
5. **Error Messages**: Sanitized in production mode

## Troubleshooting

### Service Unavailable (502)

- Check if backend services are running
- Verify URLs in `.env` are correct
- Check network connectivity to AI chat server

### CORS Errors

- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- Ensure credentials are properly configured

### Rate Limiting

- Adjust `RATE_LIMIT_MAX_REQUESTS` if needed
- Check logs for IP addresses being rate limited

## Development

```bash
# Run with hot reload
npm run dev

# Lint code
npm run lint

# Build
npm run build
```

## License

MIT
