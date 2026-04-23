const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: passwordHash
        });

        const savedUser = await newUser.save();
        res.json({
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'No account with this email has been registered' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key');
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
