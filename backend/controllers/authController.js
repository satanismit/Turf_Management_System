const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendResetEmail } = require('../utils/email');

exports.signup = async (req, res) => {
    try {
        const { fullName, email, username, password, confPassword, phone } = req.body;

        if (password !== confPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const user = new User({ fullName, email, username, password, phone });
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

        res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, username: user.username } });
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

        res.json({ message: 'Reset email sent' });
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


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password for security
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};