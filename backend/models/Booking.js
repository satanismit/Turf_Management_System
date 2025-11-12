const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    turfId: { type: String, required: true }, // Changed to String to match turf IDs
    turfName: { type: String, required: true },
    sportType: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    bookingType: { type: String, enum: ['slot', 'custom'], default: 'slot' },
    timeSlot: { type: String, default: '' }, // For slot bookings
    startTime: { type: String, default: '' }, // For custom bookings (HH:MM format)
    endTime: { type: String, default: '' }, // For custom bookings (HH:MM format)
    duration: { type: Number, default: 0 }, // Duration in hours
    totalAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['created', 'paid', 'confirmed', 'cancelled', 'completed'], 
        default: 'created' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    paymentMethod: { 
        type: String, 
        enum: ['credit_card', 'debit_card', 'upi'], 
        default: null 
    },
    paymentDate: { type: Date },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    specialRequests: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

bookingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);