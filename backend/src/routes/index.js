const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const participantRoutes = require('./participantRoutes');

const router = express.Router();

router.use('/api/v1', healthRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/participants', participantRoutes);

module.exports = router;
