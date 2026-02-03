const express = require('express');
const multer = require('multer');
const router = express.Router();
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
    // Cloudinary returns the secure_url in req.file.path
    res.json({
        message: 'Image uploaded',
        filePath: req.file.path
    });
});

module.exports = router;
