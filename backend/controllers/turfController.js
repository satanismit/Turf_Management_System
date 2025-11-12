const Turf = require('../models/Turf');
const fs = require('fs');
const path = require('path');

// Get all turfs
exports.getAllTurfs = async (req, res) => {
    try {
        const turfs = await Turf.find({ isActive: true }).populate('ownerId', 'fullName email');
        res.json({ turfs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get turf by ID
exports.getTurfById = async (req, res) => {
    try {
        const turf = await Turf.findById(req.params.id).populate('ownerId', 'fullName email');
        if (!turf) {
            return res.status(404).json({ error: 'Turf not found' });
        }
        res.json({ turf });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create new turf (admin only)
exports.createTurf = async (req, res) => {
    try {
        const { name, location, sportType, price, facilities, description } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';

        const turf = new Turf({
            name,
            location,
            sportType,
            price: parseFloat(price),
            facilities: facilities ? facilities.split(',').map(f => f.trim()) : [],
            image,
            description,
            ownerId: req.user._id // Admin creating it
        });

        await turf.save();
        res.status(201).json({ message: 'Turf created successfully', turf });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update turf (admin only)
exports.updateTurf = async (req, res) => {
    try {
        const { name, location, sportType, price, facilities, description, isActive } = req.body;
        const updateData = {
            name,
            location,
            sportType,
            price: price ? parseFloat(price) : undefined,
            facilities: facilities ? facilities.split(',').map(f => f.trim()) : undefined,
            description,
            isActive: isActive !== undefined ? isActive : undefined
        };

        // Handle image upload
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;

            // Delete old image if exists
            const existingTurf = await Turf.findById(req.params.id);
            if (existingTurf && existingTurf.image) {
                const oldImagePath = path.join(__dirname, '..', existingTurf.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const turf = await Turf.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!turf) {
            return res.status(404).json({ error: 'Turf not found' });
        }

        res.json({ message: 'Turf updated successfully', turf });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete turf (admin only)
exports.deleteTurf = async (req, res) => {
    try {
        const turf = await Turf.findById(req.params.id);
        if (!turf) {
            return res.status(404).json({ error: 'Turf not found' });
        }

        // Delete associated image
        if (turf.image) {
            const imagePath = path.join(__dirname, '..', turf.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Turf.findByIdAndDelete(req.params.id);
        res.json({ message: 'Turf deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};