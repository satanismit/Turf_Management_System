const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    sportType: { type: String, required: true },
    price: { type: Number, required: true },
    facilities: [{ type: String }],
    image: { type: String, required: true },
    description: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Turf', turfSchema);