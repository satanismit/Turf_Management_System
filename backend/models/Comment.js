const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    turfId: { type: String, required: true }, // Changed to String to match static data IDs
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: null },
    isVisible: { type: Boolean, default: true }, // Admin can hide comments
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

commentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Comment', commentSchema);