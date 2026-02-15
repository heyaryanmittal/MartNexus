const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');
const prisma = require('../utils/prismaClient');

const router = express.Router();


router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60000); 

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                otp,
                otpExpires
            }
        });

        
        await emailService.sendOTPEmail(email, otp);

        res.status(201).json({ message: 'User registered. Please verify OTP.' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email already registered' });
        }
        res.status(500).json({ error: error.message });
    }
});



router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        await prisma.user.update({
            where: { email },
            data: { isVerified: true, otp: null, otpExpires: null }
        });

        res.json({ message: 'Account verified successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'User not found' });
        if (!user.isVerified) return res.status(400).json({ message: 'User not verified' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user.id, id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token, userId: user.id, name: user.email.split('@')[0], role: user.role });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});





router.get('/me', require('../middleware/authMiddleware'), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId || req.user.id },
            select: { id: true, email: true, isVerified: true, role: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ ...user, name: user.email.split('@')[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.put('/update-profile', require('../middleware/authMiddleware'), async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.user.userId || req.user.id },
            data: { name, email }
        });
        res.json({ message: 'Profile updated successfully', user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/change-password', require('../middleware/authMiddleware'), async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId || req.user.id }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Current password is incorrect' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        
        const userName = user.name || user.email.split('@')[0];
        const changeDetails = {
            ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
            userAgent: req.get('user-agent') || 'Unknown device'
        };

        
        emailService.sendPasswordChangeEmail(user.email, userName, changeDetails)
            .catch(err => console.error('Failed to send password change email:', err));

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


