const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendResetEmail } = require('../utils/email');

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
            gender: gender || ''
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
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id).select('-password -resetToken -resetTokenExpires');
        
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
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const { fullName, phone, address, dateOfBirth, gender, emergencyContact } = req.body;

        const user = await User.findByIdAndUpdate(
            decoded.id,
            {
                fullName: fullName || user.fullName,
                phone: phone || user.phone,
                address: address || user.address,
                dateOfBirth: dateOfBirth || user.dateOfBirth,
                gender: gender || user.gender,
                emergencyContact: emergencyContact || user.emergencyContact,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password -resetToken -resetTokenExpires');

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ message: 'Profile updated successfully!', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all users (for admin)
exports.getAllUsers = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        const users = await User.find().select('-password -resetToken -resetTokenExpires');
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password for security
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};