---
name: scaffold-http-server
description: Scaffolds the Node.js HTTP server entry point. Use ONLY when creating a new HTTP server entry point (e.g., server.js, index.js, main.ts) where `http.createServer` is absent to set up robust timeouts, socket tracking, connection management, and graceful shutdown signal handling.
---

# Scaffold HTTP Server

## When to use this skill
- Use ONLY to initialize, create, or scaffold a brand new HTTP server entry point.
- **DO NOT** use this skill if the user is asking to modify an already existing server file or if `http.createServer` is already present.

## How to use it
### Prerequisites
Ensure the following dependencies are available or created before scaffolding:
- `app`: The Express application instance (e.g., `./app`). **If this file does not exist, you MUST execute the `scaffold-express-app` skill first to generate it.**
- `logger`: A configured Winston logger instance (e.g., `./utils/logger`).

## Output Enforcement

- The generated server entry point MUST strictly follow the `## Implementation Template`.
- Do NOT create a custom structure or alternative implementation.
- Only modify the template in the following cases:
  - Adjust environment variable usage if required (e.g., `PORT`).

## Required Environment Variables

The generated code MUST rely on:

- `PORT` → Port number for the HTTP server (default: 3000)

## Implementation Template

```javascript
const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// TIMEOUT TUNING
server.keepAliveTimeout = 5000;
server.headersTimeout = 6000;

// CONNECTION MANAGEMENT
const connections = new Set();
server.on('connection', (socket) => {
  connections.add(socket);
  socket.on('close', () => connections.delete(socket));
});

// SHUTDOWN STATE & HEADERS
let isShuttingDown = false;
server.on('request', (req, res) => {
  if (isShuttingDown) res.setHeader('Connection', 'close');
});

server.listen(port, () => {
  logger.info(`HTTP server running on port ${port}`);
});

// GRACEFUL SHUTDOWN
function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      logger.error(`Error closing server: ${err.message}`, { stack: err.stack });
      return setImmediate(() => process.exit(1));
    }
    logger.info('Server closed successfully.');
    process.exit(0);
  });

  // SAFETY NET: Force close after 10s
  setTimeout(() => {
    logger.warn('Graceful period expired. Closing remaining connections...');
    connections.forEach((socket) => {
      if (!socket.destroyed && !socket.writableEnded) socket.destroy();
    });

    setTimeout(() => {
      logger.error('Forcing immediate shutdown.');
      process.exit(1);
    }, 1000).unref();
  }, 10000).unref();
}

// SIGNAL & ERROR HANDLERS
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason instanceof Error ? reason : { message: reason });
  process.exitCode = 1;
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  setImmediate(() => process.exit(1));
});
```