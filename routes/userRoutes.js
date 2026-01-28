const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');

const usersFilePath = path.join(__dirname, '../data/users.js');

const getUsers = () => {
    delete require.cache[require.resolve(usersFilePath)];
    return require(usersFilePath);
};

const saveUsers = (users) => {
    const content = `const users = ${JSON.stringify(users, null, 4)};\n\nmodule.exports = users;`;
    fs.writeFileSync(usersFilePath, content);
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (user && bcrypt.compareSync(password, user.password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
router.post('/', (req, res) => {
    const { name, email, password } = req.body;
    const users = getUsers();
    const userExists = users.find(u => u.email === email);

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const newUser = {
        _id: (Math.max(...users.map(u => parseInt(u._id)), 0) + 1).toString(),
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        isAdmin: false,
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        token: generateToken(newUser._id),
    });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, (req, res) => {
    const user = req.user;
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;
