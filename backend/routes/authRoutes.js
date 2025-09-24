const express = require('express');
const { 
    signup, 
    login, 
    forgotPassword, 
    resetPassword, 
    getUserProfile,
    updateUserProfile,
    getAllUsers 
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/users', getAllUsers);

module.exports = router;