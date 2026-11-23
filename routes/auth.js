// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { sendPasswordResetEmail } = require('../config/mailer');
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});
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
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});
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
    req.session.user = { id: user.id, name: user.name, role: user.role };
    res.redirect('/');
});
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { error: null, message: null });
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.render('forgot-password', { error: null, message: 'If an account exists, an email has been sent.' });
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 15);
        user.resetToken = resetCode;
        user.resetTokenExpiry = expiryTime;
        await user.save();
        await sendPasswordResetEmail(user.email, resetCode);
        res.render('forgot-password', { error: null, message: 'A secret code has been sent to your email.' });
    } catch (err) {
        console.error(err);
        res.render('forgot-password', { error: 'Something went wrong.', message: null });
    }
});
router.get('/reset-password', (req, res) => {
    res.render('reset-password', { error: null });
});
router.post('/reset-password', async (req, res) => {
    try {
        const { code, newPassword } = req.body;
        const user = await User.findOne({ where: { resetToken: code } });
        if (!user) {
            return res.render('reset-password', { error: 'Invalid secret code.' });
        }
        if (new Date() > user.resetTokenExpiry) {
            return res.render('reset-password', { error: 'This code has expired. Please request a new one.' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.render('reset-password', { error: 'Something went wrong.' });
    }
});

module.exports = router;