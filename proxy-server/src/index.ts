import dotenv from 'dotenv';

// Load environment variables FIRST before importing app
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Proxying to:`);
  console.log(`   - Auth Server: ${process.env.AUTH_SERVER_URL}`);
  console.log(`   - Content Server: ${process.env.CONTENT_SERVER_URL}`);
  console.log(`   - Upload Server: ${process.env.UPLOAD_SERVER_URL}`);
  console.log(`   - AI Chat: ${process.env.AI_CHAT_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
