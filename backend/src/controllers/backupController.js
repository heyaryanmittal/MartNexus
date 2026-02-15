const prisma = require('../utils/prismaClient');
const {
    exportInventoryToExcel,
    exportBillsToExcel,
    exportSalesReportToExcel,
    saveWorkbook
} = require('../utils/excelExport');
const {
    createFullDatabaseBackup,
    saveBackupToFile,
    createBackupArchive,
    restoreBackupFromFile,
    getAvailableBackups,
    cleanupOldBackups
} = require('../utils/backupUtils');
const nodemailer = require('nodemailer');


async function createManualBackup(req, res) {
    const { shopId, type } = req.body;

    try {
        
        const backup = await prisma.backup.create({
            data: {
                shopId: shopId || null,
                type: type || 'FULL_DATABASE',
                fileName: 'pending',
                filePath: 'pending',
                fileSize: 0,
                status: 'IN_PROGRESS',
                isAutomatic: false
            }
        });

        try {
            let fileInfo;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            switch (type) {
                case 'INVENTORY':
                    fileInfo = await exportInventoryBackup(shopId, timestamp);
                    break;
                case 'BILLS':
                    fileInfo = await exportBillsBackup(shopId, timestamp);
                    break;
                case 'REPORTS':
                    fileInfo = await exportReportsBackup(shopId, timestamp);
                    break;
                default:
                    fileInfo = await exportFullDatabaseBackup(shopId, timestamp);
            }

            
            await prisma.backup.update({
                where: { id: backup.id },
                data: {
                    fileName: fileInfo.fileName,
                    filePath: fileInfo.filePath,
                    fileSize: fileInfo.fileSize,
                    status: 'COMPLETED',
                    completedAt: new Date()
                }
            });

            
            await cleanupOldBackups(10);

            res.json({
                success: true,
                message: 'Backup created successfully',
                backup: {
                    id: backup.id,
                    type,
                    fileName: fileInfo.fileName,
                    fileSize: fileInfo.fileSize,
                    createdAt: backup.createdAt
                }
            });
        } catch (error) {
            
            await prisma.backup.update({
                where: { id: backup.id },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message,
                    completedAt: new Date()
                }
            });

            throw error;
        }
    } catch (error) {
        console.error('Backup creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create backup',
            error: error.message
        });
    }
}


async function exportInventory(req, res) {
    const { shopId } = req.query;

    try {
        if (!shopId) {
            return res.status(400).json({
                success: false,
                message: 'Shop ID is required'
            });
        }

        const shop = await prisma.shop.findUnique({
            where: { id: shopId }
        });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const products = await prisma.product.findMany({
            where: { shopId },
            include: {
                category: true
            },
            orderBy: { name: 'asc' }
        });

        const workbook = await exportInventoryToExcel(products, shop.name);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `inventory-${shop.name.replace(/\s+/g, '-')}-${timestamp}.xlsx`;

        const fileInfo = await saveWorkbook(workbook, fileName);

        
        await prisma.backup.create({
            data: {
                shopId,
                type: 'INVENTORY',
                fileName: fileInfo.fileName,
                filePath: fileInfo.filePath,
                fileSize: fileInfo.fileSize,
                status: 'COMPLETED',
                isAutomatic: false,
                completedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Inventory exported successfully',
            file: {
                fileName: fileInfo.fileName,
                fileSize: fileInfo.fileSize,
                downloadUrl: `/api/backup/download/${fileInfo.fileName}`
            }
        });
    } catch (error) {
        console.error('Inventory export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export inventory',
            error: error.message
        });
    }
}


async function exportBills(req, res) {
    const { shopId, startDate, endDate } = req.query;

    try {
        if (!shopId) {
            return res.status(400).json({
                success: false,
                message: 'Shop ID is required'
            });
        }

        const shop = await prisma.shop.findUnique({
            where: { id: shopId }
        });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        const whereClause = { shopId };

        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt.gte = new Date(startDate);
            if (endDate) whereClause.createdAt.lte = new Date(endDate);
        }

        const bills = await prisma.bill.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        const workbook = await exportBillsToExcel(bills, shop.name);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `bills-${shop.name.replace(/\s+/g, '-')}-${timestamp}.xlsx`;

        const fileInfo = await saveWorkbook(workbook, fileName);

        
        await prisma.backup.create({
            data: {
                shopId,
                type: 'BILLS',
                fileName: fileInfo.fileName,
                filePath: fileInfo.filePath,
                fileSize: fileInfo.fileSize,
                status: 'COMPLETED',
                isAutomatic: false,
                completedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Bills exported successfully',
            file: {
                fileName: fileInfo.fileName,
                fileSize: fileInfo.fileSize,
                downloadUrl: `/api/backup/download/${fileInfo.fileName}`
            }
        });
    } catch (error) {
        console.error('Bills export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export bills',
            error: error.message
        });
    }
}


async function exportReports(req, res) {
    const { shopId, startDate, endDate } = req.query;

    try {
        if (!shopId) {
            return res.status(400).json({
                success: false,
                message: 'Shop ID is required'
            });
        }

        const shop = await prisma.shop.findUnique({
            where: { id: shopId }
        });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found'
            });
        }

        
        const whereClause = { shopId };
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt.gte = new Date(startDate);
            if (endDate) whereClause.createdAt.lte = new Date(endDate);
        }

        const bills = await prisma.bill.findMany({
            where: whereClause,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        const reportData = {
            totalBills: bills.length,
            totalRevenue: bills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0),
            totalTax: bills.reduce((sum, bill) => sum + parseFloat(bill.taxAmount), 0),
            totalProfit: 0,
            productSales: []
        };

        
        const productSalesMap = new Map();

        bills.forEach(bill => {
            bill.items.forEach(item => {
                const productId = item.productId;
                const productName = item.product.name;
                const quantity = item.quantity;
                const revenue = parseFloat(item.price) * quantity;
                const cost = parseFloat(item.product.costPrice) * quantity;
                const profit = revenue - cost;

                if (productSalesMap.has(productId)) {
                    const existing = productSalesMap.get(productId);
                    existing.quantitySold += quantity;
                    existing.revenue += revenue;
                    existing.profit += profit;
                } else {
                    productSalesMap.set(productId, {
                        productName,
                        quantitySold: quantity,
                        revenue,
                        profit
                    });
                }
            });
        });

        reportData.productSales = Array.from(productSalesMap.values());
        reportData.totalProfit = reportData.productSales.reduce((sum, item) => sum + item.profit, 0);

        const dateRange = `${startDate || 'Beginning'} to ${endDate || 'Now'}`;
        const workbook = await exportSalesReportToExcel(reportData, shop.name, dateRange);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `report-${shop.name.replace(/\s+/g, '-')}-${timestamp}.xlsx`;

        const fileInfo = await saveWorkbook(workbook, fileName);

        
        await prisma.backup.create({
            data: {
                shopId,
                type: 'REPORTS',
                fileName: fileInfo.fileName,
                filePath: fileInfo.filePath,
                fileSize: fileInfo.fileSize,
                status: 'COMPLETED',
                isAutomatic: false,
                completedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Report exported successfully',
            file: {
                fileName: fileInfo.fileName,
                fileSize: fileInfo.fileSize,
                downloadUrl: `/api/backup/download/${fileInfo.fileName}`
            }
        });
    } catch (error) {
        console.error('Report export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export report',
            error: error.message
        });
    }
}


async function getBackupHistory(req, res) {
    const { shopId, type, limit = 20 } = req.query;

    try {
        const whereClause = {};
        if (shopId) whereClause.shopId = shopId;
        if (type) whereClause.type = type;

        const backups = await prisma.backup.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
        });

        res.json({
            success: true,
            backups
        });
    } catch (error) {
        console.error('Get backup history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch backup history',
            error: error.message
        });
    }
}


async function downloadBackup(req, res) {
    const { fileName } = req.params;

    try {
        const backup = await prisma.backup.findFirst({
            where: { fileName }
        });

        if (!backup) {
            return res.status(404).json({
                success: false,
                message: 'Backup not found'
            });
        }

        res.download(backup.filePath, fileName);
    } catch (error) {
        console.error('Download backup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download backup',
            error: error.message
        });
    }
}


async function restoreBackup(req, res) {
    const { backupId } = req.body;

    try {
        const backup = await prisma.backup.findUnique({
            where: { id: backupId }
        });

        if (!backup) {
            return res.status(404).json({
                success: false,
                message: 'Backup not found'
            });
        }

        if (backup.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot restore incomplete backup'
            });
        }

        const result = await restoreBackupFromFile(backup.filePath);

        res.json({
            success: true,
            message: 'Backup restored successfully',
            result
        });
    } catch (error) {
        console.error('Restore backup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore backup',
            error: error.message
        });
    }
}


async function deleteBackup(req, res) {
    const { backupId } = req.params;

    try {
        const backup = await prisma.backup.findUnique({
            where: { id: backupId }
        });

        if (!backup) {
            return res.status(404).json({
                success: false,
                message: 'Backup not found'
            });
        }

        
        const fs = require('fs');
        if (fs.existsSync(backup.filePath)) {
            fs.unlinkSync(backup.filePath);
        }

        
        await prisma.backup.delete({
            where: { id: backupId }
        });

        res.json({
            success: true,
            message: 'Backup deleted successfully'
        });
    } catch (error) {
        console.error('Delete backup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete backup',
            error: error.message
        });
    }
}


async function exportInventoryBackup(shopId, timestamp) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    const products = await prisma.product.findMany({
        where: { shopId },
        include: { category: true }
    });

    const workbook = await exportInventoryToExcel(products, shop.name);
    const fileName = `inventory-${shop.name.replace(/\s+/g, '-')}-${timestamp}.xlsx`;
    return await saveWorkbook(workbook, fileName);
}

async function exportBillsBackup(shopId, timestamp) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    const bills = await prisma.bill.findMany({ where: { shopId } });

    const workbook = await exportBillsToExcel(bills, shop.name);
    const fileName = `bills-${shop.name.replace(/\s+/g, '-')}-${timestamp}.xlsx`;
    return await saveWorkbook(workbook, fileName);
}

async function exportReportsBackup(shopId, timestamp) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    const bills = await prisma.bill.findMany({
        where: { shopId },
        include: { items: { include: { product: true } } }
    });

    const reportData = {
        totalBills: bills.length,
        totalRevenue: bills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0),
        totalTax: bills.reduce((sum, bill) => sum + parseFloat(bill.taxAmount), 0),
        productSales: []
    };

    const workbook = await exportSalesReportToExcel(reportData, shop.name, 'All Time');
    const fileName = `report-${shop.name.replace(/\s+/g, '-')}-${timestamp}.xlsx`;
    return await saveWorkbook(workbook, fileName);
}

async function exportFullDatabaseBackup(shopId, timestamp) {
    const backupData = await createFullDatabaseBackup(shopId);
    const fileName = shopId
        ? `backup-shop-${timestamp}.json`
        : `backup-full-${timestamp}.json`;
    return await saveBackupToFile(backupData, fileName);
}


async function createAutomaticBackup() {
    console.log('Starting automatic backup...');

    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        
        const backup = await prisma.backup.create({
            data: {
                shopId: null, 
                type: 'FULL_DATABASE',
                fileName: 'pending',
                filePath: 'pending',
                fileSize: 0,
                status: 'IN_PROGRESS',
                isAutomatic: true
            }
        });

        try {
            
            const fileInfo = await exportFullDatabaseBackup(null, timestamp);

            
            await prisma.backup.update({
                where: { id: backup.id },
                data: {
                    fileName: fileInfo.fileName,
                    filePath: fileInfo.filePath,
                    fileSize: fileInfo.fileSize,
                    status: 'COMPLETED',
                    completedAt: new Date()
                }
            });

            
            await cleanupOldBackups(10);

            
            await sendBackupNotification(true, fileInfo.fileName);

            console.log('Automatic backup completed successfully');
            return { success: true, fileName: fileInfo.fileName };
        } catch (error) {
            
            await prisma.backup.update({
                where: { id: backup.id },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message,
                    completedAt: new Date()
                }
            });

            
            await sendBackupNotification(false, null, error.message);

            throw error;
        }
    } catch (error) {
        console.error('Automatic backup error:', error);
        throw error;
    }
}


async function sendBackupNotification(success, fileName, errorMessage) {
    try {
        const transporter = nodemailer.createTransporter({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const subject = success
            ? '✅ Automatic Backup Completed Successfully'
            : '❌ Automatic Backup Failed';

        const body = success
            ? `Your automatic database backup has been completed successfully.\n\nFile: ${fileName}\nTimestamp: ${new Date().toISOString()}`
            : `Automatic backup failed.\n\nError: ${errorMessage}\nTimestamp: ${new Date().toISOString()}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, 
            subject,
            text: body
        });

        console.log('Backup notification sent');
    } catch (error) {
        console.error('Failed to send backup notification:', error);
    }
}

module.exports = {
    createManualBackup,
    exportInventory,
    exportBills,
    exportReports,
    getBackupHistory,
    downloadBackup,
    restoreBackup,
    deleteBackup,
    createAutomaticBackup
};
