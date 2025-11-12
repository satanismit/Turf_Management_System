const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const requireAdminOrOwner = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
            return res.status(403).json({ error: 'Access denied. Admin/Owner privileges required.' });
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { authenticateToken, requireAdmin, requireAdminOrOwner };