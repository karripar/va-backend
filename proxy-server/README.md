# VA Proxy Server

Unified reverse proxy server for Vaihtoaktivaattori backend services and AI chat integration.

## Overview

This proxy server provides a single entry point (port 3004) for all backend services and AI chat, simplifying frontend configuration and enabling centralized security, CORS, and rate limiting.

### Proxied Services:

- **Auth Server** (port 3001) → `/api/auth/*`
- **Content Server** (port 3002) → `/api/content/*`
- **Upload Server** (port 3003) → `/api/upload/*`
- **AI Chat Service** (Ubuntu server) → `/api/chat/*`

## Features

- ✅ **Unified API Gateway** - Single endpoint for all services
- ✅ **CORS Management** - Centralized CORS with multiple origin support
- ✅ **Rate Limiting** - Protection against abuse (100 req/min per IP)
- ✅ **Security Headers** - Helmet.js integration
- ✅ **Request Logging** - Morgan logging middleware
- ✅ **Health Checks** - `/health` endpoint for monitoring
- ✅ **Error Handling** - Graceful error responses
- ✅ **SSE Streaming** - Support for OpenAI Responses API streaming
- ✅ **Path Rewriting** - Automatic path transformation for AI chat
- ✅ **IP Forwarding** - Real client IP forwarded to backend services

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

| Route                     | Target                | Description                          |
| ------------------------- | --------------------- | ------------------------------------ |
| `GET /health`             | -                     | Health check endpoint                |
| `/api/auth/*`             | Auth Server (3001)    | Authentication & authorization       |
| `/api/content/*`          | Content Server (3002) | Content & destination management     |
| `/api/upload/*`           | Upload Server (3003)  | File uploads & document management   |
| `/api/chat/turn_response` | AI Chat Service       | OpenAI Responses API (SSE streaming) |

### Path Rewriting

The proxy automatically rewrites paths for AI chat:

- Frontend: `/api/chat/turn_response` → AI Service: `/api/turn_response`

This ensures the frontend uses a consistent `/api/chat/*` prefix while the backend AI service uses `/api/*`.

## Environment Variables

### Required

```bash
PORT=3004                                      # Proxy server port
AUTH_SERVER_URL=http://localhost:3001         # Auth service
CONTENT_SERVER_URL=http://localhost:3002      # Content service
UPLOAD_SERVER_URL=http://localhost:3003       # Upload service
AI_CHAT_URL=http://10.120.36.58              # AI Chat service (Ubuntu server)
```

### Optional

```bash
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000                    # 1 minute window
RATE_LIMIT_MAX_REQUESTS=100                   # Max 100 requests per window

# Environment
NODE_ENV=development                           # development | production
```

### CORS Origins

Add all frontend URLs that need to access the API:

- Development: `http://localhost:3000`, `http://localhost:5173`
- Staging: `https://staging.yourdomain.com`
- Production: `https://yourdomain.com`

## Usage Examples

### Frontend Configuration

**Before (direct to services):**

```typescript
// .env
NEXT_PUBLIC_AUTH_API=http://localhost:3001/api/v1
NEXT_PUBLIC_CONTENT_API=http://localhost:3002/api/v1
NEXT_PUBLIC_UPLOAD_API=http://localhost:3003/api/v1
NEXT_PUBLIC_CHAT_API=http://10.120.36.58/api
```

**After (through proxy):**

```typescript
// .env
NEXT_PUBLIC_AUTH_API=http://localhost:3004/api/auth
NEXT_PUBLIC_CONTENT_API=http://localhost:3004/api/content
NEXT_PUBLIC_UPLOAD_API=http://localhost:3004/api/upload
NEXT_PUBLIC_CHAT_API=http://localhost:3004/api/chat
```

### Benefits

✅ **Single Port** - Frontend only needs to connect to port 3004  
✅ **Unified CORS** - One place to manage allowed origins  
✅ **Centralized Security** - Rate limiting and headers in one place  
✅ **Simplified Deployment** - Only expose one port to the internet

### Health Check

```bash
curl http://localhost:3004/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-08T10:30:00.000Z",
  "uptime": 3600.5
}
```

### Testing Proxied Requests

```bash
# Test auth service
curl http://localhost:3004/api/auth/users

# Test content service
curl http://localhost:3004/api/content/destinations

# Test upload service
curl http://localhost:3004/api/upload/files

# Test AI Chat (with streaming)
curl -N -X POST http://localhost:3004/api/chat/turn_response \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "toolsState": {
      "fileSearchEnabled": true,
      "vectorStore": {"id": "vs_xxx"}
    }
  }'
```

### Testing with Vector Store

```bash
# AI Chat with file search enabled
curl -N -X POST http://localhost:3004/api/chat/turn_response \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Mitä tiedät Erasmus-ohjelmasta?"}
    ],
    "toolsState": {
      "fileSearchEnabled": true,
      "vectorStore": {"id": "vs_68fa07260d8881918b4120b38a649a9e"}
    }
  }'
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

### ✅ Implemented

1. **Rate Limiting** - 100 requests/minute per IP (configurable)
2. **CORS Protection** - Whitelist allowed origins
3. **Helmet.js** - Security headers (XSS, clickjacking, etc.)
4. **IP Forwarding** - `X-Forwarded-For` header preserved
5. **Error Sanitization** - Production errors don't leak internals
6. **Request Logging** - Morgan middleware for audit trail

### 🔒 Production Recommendations

1. **HTTPS Only**

   ```bash
   # Use nginx for SSL termination
   # Or deploy behind Cloudflare/AWS ALB
   ```

2. **Restrict Origins**

   ```bash
   # ❌ Don't use wildcard in production
   ALLOWED_ORIGINS=*

   # ✅ Explicit origins only
   ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
   ```

3. **Environment Variables**

   - Never commit `.env` files
   - Use secrets manager (AWS Secrets, Azure Key Vault)
   - Rotate API keys regularly

4. **Monitoring**

   - Set up health check monitoring (UptimeRobot, Pingdom)
   - Log aggregation (CloudWatch, Datadog)
   - Alert on rate limit violations

5. **Network Security**
   - Firewall rules for backend services
   - VPC/private network for service-to-service
   - Only expose proxy port to internet

## Troubleshooting

### Service Unavailable (502/503)

**Problem:** Backend service not reachable

**Solutions:**

- Verify backend services are running:

  ```bash
  # Check auth server
  curl http://localhost:3001/health

  # Check content server
  curl http://localhost:3002/health

  # Check AI chat server
  curl http://10.120.36.58/health
  ```

- Check `.env` URLs are correct
- Verify network connectivity to AI chat server (Ubuntu)
- Check firewall rules on AI chat server

### CORS Errors in Browser

**Problem:** `Access-Control-Allow-Origin` error

**Solutions:**

- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- Clear browser cache (CORS responses are cached)
- Restart proxy server after `.env` changes
- Check browser console for exact origin being blocked

**Example:**

```bash
# Development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Rate Limiting (429 Too Many Requests)

**Problem:** Client exceeds 100 requests/minute

**Solutions:**

- Increase `RATE_LIMIT_MAX_REQUESTS` in `.env`
- Increase `RATE_LIMIT_WINDOW_MS` for longer window
- Check logs for abusive IPs
- Implement per-user rate limiting (not per-IP)

### Path Rewriting Issues

**Problem:** AI chat requests return 404

**Solutions:**

- Verify path is `/api/chat/turn_response` (not `/api/turn_response`)
- Check proxy logs for path transformation
- Ensure AI chat service accepts `/api/turn_response`

### SSE Streaming Not Working

**Problem:** AI responses don't stream, or connection closes early

**Solutions:**

- Ensure `Accept: text/event-stream` header is set
- Check that proxy doesn't buffer SSE responses
- Verify AI chat service returns proper SSE format
- Check network timeouts (nginx, load balancers)

### Environment Variables Not Loading

**Problem:** `.env` changes not applied

**Solutions:**

- Restart proxy server (`npm run dev` or `pm2 restart va-proxy`)
- Check `.env` file location (should be in `proxy-server/` root)
- Verify `dotenv` is loaded before app initialization
- Check for syntax errors in `.env` file

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
