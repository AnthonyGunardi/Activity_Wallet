const express = require('express');
const boothController = require('../controllers/boothController');
const { validateBody } = require('../middleware/validate');
const { scanSchema, deductionSchema } = require('../schemas/boothSchemas');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// All booth operations require authentication (Staff or Admin)
router.use(requireAuth);

/**
 * @route POST /api/v1/booth/scan
 * @desc Scan participant QR token and view balance & eligible activities
 */
router.post('/scan', validateBody(scanSchema), boothController.scan);

/**
 * @route POST /api/v1/booth/transactions
 * @desc Execute atomic credit deduction for water sport activity
 */
router.post('/transactions', validateBody(deductionSchema), boothController.createDeduction);

/**
 * @route GET /api/v1/booth/transactions/recent
 * @desc Get recent transactions processed by authenticated staff
 */
router.get('/transactions/recent', boothController.getRecentTransactions);

module.exports = router;
