const express = require('express');
const { 
    createBooking, 
    getUserBookings, 
    getAllBookings, 
    updateBookingStatus, 
    cancelBooking 
} = require('../controllers/bookingController');

const router = express.Router();

// User routes
router.post('/create', createBooking);
router.get('/user', getUserBookings);
router.put('/cancel/:bookingId', cancelBooking);

// Admin/Owner routes
router.get('/all', getAllBookings);
router.put('/status/:bookingId', updateBookingStatus);

module.exports = router;