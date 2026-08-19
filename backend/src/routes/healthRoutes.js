const express = require('express');
const { formatSuccess } = require('../utils/responseEnvelope');
const database = require('../config/database');

const router = express.Router();

/**
 * GET /api/v1/health
 * Public health check endpoint
 */
router.get('/health', async (req, res) => {
  const dbOk = await database.testConnection();
  return res.status(200).json(
    formatSuccess({
      status: 'healthy',
      database: dbOk ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    })
  );
});

module.exports = router;
