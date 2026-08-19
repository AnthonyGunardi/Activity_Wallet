if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { formatError } = require('./utils/responseEnvelope');

const app = express();

// SECURITY HEADERS
const cspImgSrc = process.env.CSP_IMG_SRC ? process.env.CSP_IMG_SRC.split(',') : [];
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        imgSrc: ["'self'", 'data:', ...cspImgSrc]
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

const shouldSkipMorgan = (req, res) => res.statusCode < 400;

// REQUEST LOGGING
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { skip: shouldSkipMorgan }));
}

// CORS CONFIGURATION
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : [];

const corsOriginResolver = (origin, callback) => {
  if (!origin) return callback(null, true);
  const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (allowedOrigins.includes(origin) || isLocalhost) return callback(null, true);

  const err = new Error('Not allowed by CORS');
  err.name = 'CORS_ERROR';
  err.origin = origin;
  return callback(err, false);
};

const corsOptions = {
  origin: corsOriginResolver,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// RATE LIMITING
app.use(apiLimiter);

// BODY PARSERS
app.use(express.urlencoded({ extended: false, limit: process.env.BODY_SIZE_LIMIT || '2mb' }));
app.use(express.json({ limit: process.env.BODY_SIZE_LIMIT || '2mb' }));

// MOUNT APPLICATION ROUTES
app.use(routes);

// 404 CATCH-ALL
app.use((req, res) => {
  res.status(404).json(formatError('ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
});

// CENTRALIZED ERROR HANDLER
app.use(errorHandler);

module.exports = app;
module.exports.shouldSkipMorgan = shouldSkipMorgan;
module.exports.corsOriginResolver = corsOriginResolver;
