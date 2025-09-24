const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    turfId: { type: Number, required: true },
    turfName: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
        default: 'pending' 
    },
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