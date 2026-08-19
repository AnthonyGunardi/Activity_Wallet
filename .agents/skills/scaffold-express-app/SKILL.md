---
name: scaffold-express-app
description: Scaffolds the initial Express app.js entry point for a new project. Use ONLY for initial setup to configure baseline security, CORS, and body parsers. Do NOT use this skill to update an existing app.js.
---

# Scaffold Express App 

## When to use this skill
- Use ONLY to initialize, create, or scaffold a brand new Express application.
- **DO NOT** use this skill if the user is asking to add a single middleware to an already existing project.

## How to use it
To ensure a successful setup, follow these steps strictly:

1. **State Check (The Safety Valve):** Before generating code, check if `app.js` already exists. If it contains existing user code, **ABORT** the execution of this template. Inform the user that this skill is for initial scaffolding only and ask if they would like you to manually add the requested middleware instead.
2. **Dependencies:**
  - If the agent has permission to execute terminal commands:
    - Run: `npm install express cors helmet morgan express-fileupload dotenv`
  - If terminal execution is NOT available:
    - Provide the exact command for the user to run:
      `npm install express cors helmet morgan express-fileupload dotenv`
3. **Environment Setup:** Output a `.env.example` snippet in your response containing the required variables so the user knows exactly what to configure.
4. **Local Modules:**
  - `./routes/index.js`: **If this file does not exist, you MUST generate a minimal placeholder file to prevent `MODULE_NOT_FOUND` errors on startup.**
  - `./middlewares/error-handler.js`: **If this file does not exist, you MUST execute the `scaffold-error-handler` skill first to generate it.**

## Output Enforcement

- The generated `app.js` MUST strictly follow the `## Implementation Template`.
- Do NOT create a custom structure or alternative implementation.
- Only modify the template in the following cases:
  - Adjust environment variable usage if required
  - Comment sections if dependencies are intentionally omitted
- Do NOT omit any middleware defined in the template.

## Required Environment Variables

The generated code MUST rely on:

- `NODE_ENV` → `development` | `production`
- `CSP_IMG_SRC` → comma-separated allowed image sources
- `CORS_ALLOWED_ORIGINS` → comma-separated allowed origins
- `BODY_SIZE_LIMIT` → max upload size (number, optional)

## Implementation Template

```javascript
// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');

const routes = require('./routes');
const errorHandler = require('./middlewares/error-handler');

const app = express();

// SECURITY HEADERS
const cspImgSrc = process.env.CSP_IMG_SRC ? process.env.CSP_IMG_SRC.split(',') : [];
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        imgSrc: ["'self'", "data:", ...cspImgSrc],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// REQUEST LOGGING
app.use(morgan('combined', { skip: (req, res) => res.statusCode < 400 }));

// CORS 
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : [];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocalhost) return callback(null, true);
    
    const err = new Error('Not allowed by CORS');
    err.name = 'CORS_ERROR';
    err.origin = origin;
    return callback(err, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// BODY PARSERS
app.use(express.urlencoded({ extended: false, limit: process.env.BODY_SIZE_LIMIT || '2mb' }));
app.use(express.json({ limit: process.env.BODY_SIZE_LIMIT || '2mb' }));

// FILE UPLOAD
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/uploads',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    abortOnLimit: true,
    createParentPath: true,
  })
);

// STATIC FILES
app.use('/public', express.static(path.join(__dirname, 'public')));

// ROUTES
app.get('/', (req, res) => res.send('Welcome to API'));
app.use(routes);

// ERROR HANDLER
app.use(errorHandler);

module.exports = app;
```