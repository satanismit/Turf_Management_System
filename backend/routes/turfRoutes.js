const express = require('express');
const {
    getAllTurfs,
    getTurfById,
    createTurf,
    updateTurf,
    deleteTurf
} = require('../controllers/turfController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllTurfs);
router.get('/:id', getTurfById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, upload.single('image'), createTurf);
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), updateTurf);
router.delete('/:id', authenticateToken, requireAdmin, deleteTurf);

module.exports = router;