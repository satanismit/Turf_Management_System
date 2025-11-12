const express = require('express');
const { processPayment, getPaymentStatus } = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Process payment
router.post('/process', authenticateToken, processPayment);

// Get payment status
router.get('/status/:bookingId', authenticateToken, getPaymentStatus);

module.exports = router;