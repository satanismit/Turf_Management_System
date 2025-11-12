const express = require('express');
const Comment = require('../models/Comment');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all visible comments for a turf (public)
router.get('/:turfId', async (req, res) => {
    try {
        const comments = await Comment.find({ turfId: req.params.turfId, isVisible: true })
            .populate('userId', 'fullName username')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all comments for a turf (admin only - includes hidden)
router.get('/:turfId/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const comments = await Comment.find({ turfId: req.params.turfId })
            .populate('userId', 'fullName username')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new comment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { turfId, comment, rating } = req.body;
        const newComment = new Comment({
            userId: req.userId,
            turfId,
            comment,
            rating: rating || null
        });
        await newComment.save();
        const populatedComment = await Comment.findById(newComment._id)
            .populate('userId', 'fullName username');
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a comment (only by the owner)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (comment.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to update this comment' });
        }
        const { comment: commentText, rating } = req.body;
        comment.comment = commentText || comment.comment;
        comment.rating = rating !== undefined ? rating : comment.rating;
        await comment.save();
        const updatedComment = await Comment.findById(comment._id)
            .populate('userId', 'fullName username');
        res.json(updatedComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a comment (only by the owner or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (comment.userId.toString() !== req.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin routes for comment moderation
router.put('/:id/moderate', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        const { isVisible } = req.body;
        comment.isVisible = isVisible !== undefined ? isVisible : comment.isVisible;
        await comment.save();
        res.json({ message: 'Comment moderated successfully', comment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin delete any comment
router.delete('/:id/admin', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted by admin successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;