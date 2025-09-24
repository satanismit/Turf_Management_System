const express = require('express');
const { signup, login, forgotPassword, resetPassword, getAllUsers } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users', getAllUsers);

module.exports = router;