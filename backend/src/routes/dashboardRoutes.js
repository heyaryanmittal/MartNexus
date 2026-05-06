const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getQuickStats
} = require('../controllers/dashboardController');

const authenticateToken = require('../middleware/authMiddleware');


router.get('/stats', authenticateToken, getDashboardStats);


router.get('/quick-stats', authenticateToken, getQuickStats);

module.exports = router;
