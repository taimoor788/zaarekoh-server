const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');

const learnFilePath = path.join(__dirname, '../data/learn.js');

const getLearnContent = () => {
    delete require.cache[require.resolve(learnFilePath)];
    return require(learnFilePath);
};

const saveLearnContent = (content) => {
    const fileContent = `const learnContent = ${JSON.stringify(content, null, 4)};\n\nmodule.exports = learnContent;`;
    fs.writeFileSync(learnFilePath, fileContent);
};

// @desc    Get learn content
// @route   GET /api/learn
// @access  Public
router.get('/', (req, res) => {
    try {
        const content = getLearnContent();
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update learn content
// @route   PUT /api/learn
// @access  Private/Admin
router.put('/', protect, admin, (req, res) => {
    try {
        const content = req.body;
        saveLearnContent(content);
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Error updating content' });
    }
});

module.exports = router;
