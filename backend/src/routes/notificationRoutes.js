const express = require('express');
const router = express.Router();
const {
    getNotificationLogs,
    getNotificationStats,
    retryNotification,
    deleteNotification,
    clearOldNotifications
} = require('../controllers/notificationController');


router.get('/logs', getNotificationLogs);


router.get('/stats', getNotificationStats);


router.post('/retry/:notificationId', retryNotification);



router.delete('/:notificationId', deleteNotification);


router.delete('/clear/old', clearOldNotifications);

module.exports = router;
