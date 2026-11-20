// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

// GET: Show Register Page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// POST: Handle Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ name, email, password: hashedPassword });
        res.redirect('/auth/login');
    } catch (err) {
        res.render('register', { error: 'Email already exists or invalid data.' });
    }
});

// GET: Show Login Page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// POST: Handle Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
        return res.render('login', { error: 'User not found.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.render('login', { error: 'Invalid password.' });
    }

    // Save user to session (excluding the password for safety)
    req.session.user = { id: user.id, name: user.name, role: user.role };
    res.redirect('/');
});

// GET: Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;