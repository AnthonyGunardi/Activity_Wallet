---
name: scaffold-express-error-handler
description: Scaffolds the centralized Express error handler middleware. Includes standard mappings for CORS, Sequelize validation, and database errors. Use ONLY for initial setup. Do NOT use this skill to update an existing error-handler.js.
---

# Scaffold Error Handler

## When to use this skill
- Use ONLY to initialize, create, or scaffold a brand new centralized error handler.
- **DO NOT** use this skill if the user is asking to modify an already existing error handler.

## How to use it
To ensure a successful setup, follow these steps strictly:

1. **State Check (The Safety Valve):** Before generating code, check if `error-handler.js` already exists. If it contains existing user code, **ABORT** the execution of this template. Inform the user that this skill is for initial scaffolding only and ask if they would like you to manually modify the requested error handler instead.
2. **Dependencies:**
  - If the agent has permission to execute terminal commands:
    - Run: `npm install winston`
  - If terminal execution is NOT available:
    - Provide the exact command for the user to run:
      `npm install winston`
3. **Local Modules:** A configured Winston logger instance is required. **If `../utils/logger.js` does not exist, you MUST generate a minimal placeholder file to prevent `MODULE_NOT_FOUND` errors on startup.**

## Output Enforcement

- The generated `error-handler.js` MUST strictly follow the `## Implementation Template`.
- Do NOT create a custom structure or alternative implementation.
- Only modify the template in the following cases:
  - Adjust logger import path if required.
- Do NOT omit any error mappings defined in the template.

## Required Environment Variables

The generated code MUST rely on:

- `NODE_ENV` → `development` | `production`

## Implementation Template

```javascript
const logger = require('../utils/logger');
const isProduction = process.env.NODE_ENV === 'production';

const errorHandler = (err, req, res, next) => {
  // CORS errors
  if (err.name === 'CORS_ERROR') {
    logger.warn(`CORS blocked origin : ${err.origin}`);
    return res.status(403).json({ status: 'error', type: 'CORS_ERROR', message: 'Request blocked by CORS policy' });
  }

  // Log the error
  logger.error(err.message, {
    stack: err.stack,
    name: err.name,
    status: err.status || 500,
    path: req.originalUrl,
    method: req.method
  });

  // Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => e.path === 'username' ? 'Username is already registered' : e.message);
    return res.status(400).json({ status: 'error', type: 'VALIDATION_ERROR', message: errors.join(', ') });
  }

  // Sequelize Database Errors
  if (err.name === 'SequelizeDatabaseError') {
    const message = isProduction ? 'Database error occurred' : `Database Error: ${err.message}`;
    return res.status(500).json({ status: 'error', type: 'DATABASE_ERROR', message });
  }

  // Custom Errors
  if (err.status && err.message) {
    return res.status(err.status).json({ status: 'error', type: 'CUSTOM_ERROR', message: err.message });
  }

  // Catch-all
  const fallbackMessage = isProduction ? 'Internal Server Error' : `Internal Server Error: ${err.message}\n${err.stack || ''}`;
  return res.status(500).json({ status: 'error', type: 'INTERNAL_SERVER_ERROR', message: fallbackMessage.trim() });
};

module.exports = errorHandler;
```