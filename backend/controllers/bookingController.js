const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Create a new booking request
exports.createBooking = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        const { turfId, turfName, date, timeSlot, totalAmount, specialRequests } = req.body;

        // Create new booking
        const booking = new Booking({
            userId: user._id,
            turfId,
            turfName,
            date,
            timeSlot,
            totalAmount,
            customerName: user.fullName,
            customerEmail: user.email,
            customerPhone: user.phone || 'Not provided',
            specialRequests: specialRequests || '',
            status: 'pending'
        });

        await booking.save();

        res.status(201).json({ 
            message: 'Booking request submitted successfully!', 
            booking: booking 
        });
    } catch (err) {
        console.error('Booking creation error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const bookings = await Booking.find({ userId: decoded.id }).sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (err) {
        console.error('Get bookings error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get all bookings (for admin/owner)
exports.getAllBookings = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        
        if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
            return res.status(403).json({ error: 'Access denied. Admin/Owner privileges required.' });
        }

        const bookings = await Booking.find().populate('userId', 'fullName email phone').sort({ createdAt: -1 });
        res.json({ bookings });
    } catch (err) {
        console.error('Get all bookings error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Update booking status (for admin/owner)
exports.updateBookingStatus = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        
        if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
            return res.status(403).json({ error: 'Access denied. Admin/Owner privileges required.' });
        }

        const { bookingId } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value.' });
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status, updatedAt: Date.now() },
            { new: true }
        ).populate('userId', 'fullName email phone');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        res.json({ 
            message: `Booking ${status} successfully!`, 
            booking 
        });
    } catch (err) {
        console.error('Update booking status error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Cancel booking (user can cancel their own booking)
exports.cancelBooking = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const { bookingId } = req.params;

        const booking = await Booking.findOne({ _id: bookingId, userId: decoded.id });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or unauthorized.' });
        }

        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Cannot cancel this booking.' });
        }

        booking.status = 'cancelled';
        booking.updatedAt = Date.now();
        await booking.save();

        res.json({ 
            message: 'Booking cancelled successfully!', 
            booking 
        });
    } catch (err) {
        console.error('Cancel booking error:', err);
        res.status(500).json({ error: err.message });
    }
};