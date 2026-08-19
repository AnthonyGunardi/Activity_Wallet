const express = require('express');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

router.use('/api/v1', healthRoutes);

module.exports = router;
