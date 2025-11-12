const Booking = require('../models/Booking');
const User = require('../models/User');
const Turf = require('../models/Turf');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdminOrOwner } = require('../middleware/authMiddleware');

// Helper function to calculate duration in hours
const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const durationMinutes = endMinutes - startMinutes;
    return Math.max(0, durationMinutes / 60); // Convert to hours
};

// Helper function to validate time range
const isValidTimeRange = (startTime, endTime) => {
    const duration = calculateDuration(startTime, endTime);
    return duration > 0 && duration <= 12; // Max 12 hours
};

// Create a new booking request
exports.createBooking = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        const { 
            turfId, 
            date, 
            bookingType = 'slot', 
            timeSlot, 
            startTime, 
            endTime, 
            specialRequests 
        } = req.body;

        // Get turf details for price calculation
        const turf = await Turf.findById(turfId);
        if (!turf) {
            return res.status(404).json({ error: 'Turf not found.' });
        }

        let duration = 0;
        let totalAmount = 0;
        let bookingData = {
            userId: user._id,
            turfId,
            turfName: turf.name,
            sportType: turf.sportType,
            location: turf.location,
            date,
            bookingType,
            customerName: user.fullName,
            customerEmail: user.email,
            customerPhone: user.phone || 'Not provided',
            specialRequests: specialRequests || '',
            status: 'created'
        };

        if (bookingType === 'slot') {
            // Slot booking - fixed duration (assuming 2 hours per slot)
            duration = 2; // You can make this configurable
            totalAmount = turf.price * duration;
            bookingData.timeSlot = timeSlot;
            bookingData.duration = duration;
        } else if (bookingType === 'custom') {
            // Custom time range booking
            if (!startTime || !endTime) {
                return res.status(400).json({ error: 'Start time and end time are required for custom bookings.' });
            }

            if (!isValidTimeRange(startTime, endTime)) {
                return res.status(400).json({ error: 'Invalid time range. Maximum booking duration is 12 hours.' });
            }

            duration = calculateDuration(startTime, endTime);
            totalAmount = Math.ceil(turf.price * duration); // Round up to nearest rupee
            bookingData.startTime = startTime;
            bookingData.endTime = endTime;
            bookingData.duration = duration;
        } else {
            return res.status(400).json({ error: 'Invalid booking type.' });
        }

        bookingData.totalAmount = totalAmount;

        // Create new booking
        const booking = new Booking(bookingData);
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
        const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (err) {
        console.error('Get bookings error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get all bookings (for admin/owner)
exports.getAllBookings = async (req, res) => {
    try {
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
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!['created', 'paid', 'confirmed', 'cancelled', 'completed'].includes(status)) {
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
        const { bookingId } = req.params;

        const booking = await Booking.findOne({ _id: bookingId, userId: req.userId });
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