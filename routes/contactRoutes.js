const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');

const messagesFilePath = path.join(__dirname, '../data/messages.js');

const getMessages = () => {
    delete require.cache[require.resolve(messagesFilePath)];
    return require(messagesFilePath);
};

const saveMessages = (messages) => {
    const content = `const messages = ${JSON.stringify(messages, null, 4)};\n\nmodule.exports = messages;`;
    fs.writeFileSync(messagesFilePath, content);
};

// @desc    Submit a message
// @route   POST /api/contact
// @access  Public
router.post('/', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        res.status(400).json({ message: 'Please provide name, email and message' });
        return;
    }

    const messages = getMessages();
    const newMessage = {
        _id: (Math.max(...messages.map(m => parseInt(m._id) || 0), 0) + 1).toString(),
        name,
        email,
        message,
        isRead: false,
        createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    saveMessages(messages);

    res.status(201).json({ message: 'Message sent successfully' });
});

// @desc    Get all messages
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', protect, admin, (req, res) => {
    const messages = getMessages();
    res.json(messages);
});

// @desc    Mark message as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
router.put('/:id/read', protect, admin, (req, res) => {
    const messages = getMessages();
    const message = messages.find(m => m._id === req.params.id);

    if (message) {
        message.isRead = true;
        saveMessages(messages);
        res.json({ message: 'Message marked as read' });
    } else {
        res.status(404).json({ message: 'Message not found' });
    }
});

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, (req, res) => {
    const messages = getMessages();
    const updatedMessages = messages.filter(m => m._id !== req.params.id);

    if (messages.length === updatedMessages.length) {
        res.status(404).json({ message: 'Message not found' });
        return;
    }

    saveMessages(updatedMessages);
    res.json({ message: 'Message deleted successfully' });
});

module.exports = router;
