const express = require('express');
const router = express.Router();
const { createAutomaticBackup } = require('../controllers/backupController');
const { checkLowStockAndNotify } = require('../controllers/notificationController');


const verifyCronSecret = (req, res, next) => {
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;

    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid cron secret'
        });
    }

    next();
};


router.post('/trigger-backup', verifyCronSecret, async (req, res) => {
    try {
        console.log('Cron job triggered: Automatic backup');
        await createAutomaticBackup();
        res.json({
            success: true,
            message: 'Backup triggered successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Cron backup error:', error);
        res.status(500).json({
            success: false,
            message: 'Backup failed',
            error: error.message
        });
    }
});


router.post('/check-low-stock', verifyCronSecret, async (req, res) => {
    try {
        console.log('Cron job triggered: Low stock check');
        await checkLowStockAndNotify();
        res.json({
            success: true,
            message: 'Low stock check completed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Cron low stock check error:', error);
        res.status(500).json({
            success: false,
            message: 'Low stock check failed',
            error: error.message
        });
    }
});


router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Cron endpoints are healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
