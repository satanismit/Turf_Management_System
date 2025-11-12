
const express = require('express');

const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    addToFavorites,
    removeFromFavorites,
    getFavoriteTurfs
} = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.post('/favorites/:turfId', authenticateToken, addToFavorites);
router.delete('/favorites/:turfId', authenticateToken, removeFromFavorites);
router.get('/favorites', authenticateToken, getFavoriteTurfs);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/users/:userId/status', authenticateToken, requireAdmin, updateUserStatus);
router.delete('/users/:userId', authenticateToken, requireAdmin, deleteUser);

module.exports = router;