const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const participantRoutes = require('./participantRoutes');
const boothRoutes = require('./boothRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/api/v1', healthRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/participants', participantRoutes);
router.use('/api/v1/booth', boothRoutes);
router.use('/api/v1/admin', adminRoutes);

module.exports = router;
