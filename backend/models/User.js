const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
    address: { type: String, default: '' },
    role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
    profileImage: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], required: false },
    emergencyContact: { type: String, default: '' },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}); userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        this.updatedAt = Date.now();
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    this.updatedAt = Date.now();
    next();
});

userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);