const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.use('/api/v1', healthRoutes);
router.use('/api/v1/auth', authRoutes);

module.exports = router;
