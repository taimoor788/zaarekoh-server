const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// @desc    Submit a message
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, message, subject } = req.body;

    if (!name || !email || !message) {
        res.status(400).json({ message: 'Please provide name, email and message' });
        return;
    }

    try {
        const newMessage = await Message.create({
            name,
            email,
            subject: subject || 'New Message',
            message
        });

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all messages
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const messages = await Message.find({});
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark message as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
router.put('/:id/read', protect, admin, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (message) {
            message.isRead = true;
            await message.save();
            res.json({ message: 'Message marked as read' });
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (message) {
            await message.deleteOne();
            res.json({ message: 'Message deleted successfully' });
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
