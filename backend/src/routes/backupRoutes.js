const express = require('express');
const router = express.Router();
const {
    createManualBackup,
    exportInventory,
    exportBills,
    exportReports,
    getBackupHistory,
    downloadBackup,
    restoreBackup,
    deleteBackup
} = require('../controllers/backupController');


router.post('/create', createManualBackup);


router.get('/export/inventory', exportInventory);
router.get('/export/bills', exportBills);
router.get('/export/reports', exportReports);


router.get('/history', getBackupHistory);
router.get('/download/:fileName', downloadBackup);
router.post('/restore', restoreBackup);
router.delete('/:backupId', deleteBackup);

module.exports = router;
