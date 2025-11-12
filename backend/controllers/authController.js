const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendResetEmail } = require('../utils/email');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

exports.signup = async (req, res) => {
    try {
        const { fullName, email, username, password, confPassword, phone, address, dateOfBirth, gender } = req.body;

        if (password !== confPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const user = new User({
            fullName,
            email,
            username,
            password,
            phone,
            address: address || '',
            dateOfBirth: dateOfBirth || null,
            ...(gender && { gender }) // Only include gender if it's provided and not empty
        });
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(email, fullName);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: 'Email or username already exists' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};


exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                username: user.username,
                phone: user.phone,
                address: user.address,
                role: user.role,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                profileImage: user.profileImage,
                emergencyContact: user.emergencyContact
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
        user.resetToken = resetToken;
        user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        await sendResetEmail(email, resetToken);

        res.json({ message: `Reset email sent to ${email}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confPassword } = req.body;

        if (newPassword !== confPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        if (!user || user.resetToken !== token || user.resetTokenExpires < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -resetToken -resetTokenExpires');

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { fullName, phone, address, dateOfBirth, gender, emergencyContact } = req.body;
        // Load current user to preserve fields not provided in the update
        const currentUser = await User.findById(req.userId).select('-password -resetToken -resetTokenExpires');
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const updatedData = {
            fullName: fullName || currentUser.fullName,
            phone: phone || currentUser.phone,
            address: address || currentUser.address,
            dateOfBirth: dateOfBirth || currentUser.dateOfBirth,
            gender: gender || currentUser.gender,
            emergencyContact: emergencyContact || currentUser.emergencyContact,
            updatedAt: Date.now()
        };

        const user = await User.findByIdAndUpdate(req.userId, updatedData, { new: true }).select('-password -resetToken -resetTokenExpires');

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ message: 'Profile updated successfully!', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -resetToken -resetTokenExpires');
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update user status (block/unblock) (admin only)
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Prevent admin from blocking themselves
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot modify your own status' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                status: status,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password -resetToken -resetTokenExpires');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: `User ${status} successfully`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add turf to favorites
exports.addToFavorites = async (req, res) => {
    try {
        const { turfId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if turf is already in favorites
        if (user.favorites.includes(turfId)) {
            return res.status(400).json({ error: 'Turf already in favorites' });
        }

        user.favorites.push(turfId);
        await user.save();

        res.json({ message: 'Turf added to favorites successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove turf from favorites
exports.removeFromFavorites = async (req, res) => {
    try {
        const { turfId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.favorites = user.favorites.filter(id => id.toString() !== turfId);
        await user.save();

        res.json({ message: 'Turf removed from favorites successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get user's favorite turfs
exports.getFavoriteTurfs = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ favorites: user.favorites });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};