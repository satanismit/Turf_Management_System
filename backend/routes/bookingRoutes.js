const express = require('express');
const {
    createBooking,
    getUserBookings,
    getAllBookings,
    updateBookingStatus,
    cancelBooking
} = require('../controllers/bookingController');
const { authenticateToken, requireAdminOrOwner } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/create', authenticateToken, createBooking);
router.get('/user', authenticateToken, getUserBookings);
router.put('/cancel/:bookingId', authenticateToken, cancelBooking);

// Admin/Owner routes
router.get('/all', authenticateToken, requireAdminOrOwner, getAllBookings);
router.put('/status/:bookingId', authenticateToken, requireAdminOrOwner, updateBookingStatus);

module.exports = router;