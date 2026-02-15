const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const prisma = require('./prismaClient');


async function createFullDatabaseBackup(shopId = null) {
    try {
        const backupData = {};

        if (shopId) {
            
            const shop = await prisma.shop.findUnique({
                where: { id: shopId },
                include: {
                    products: {
                        include: {
                            category: true,
                            stockMovements: true
                        }
                    },
                    categories: true,
                    bills: {
                        include: {
                            items: {
                                include: {
                                    product: true
                                }
                            }
                        }
                    }
                }
            });

            backupData.shop = shop;
        } else {
            
            backupData.users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            backupData.shops = await prisma.shop.findMany({
                include: {
                    products: {
                        include: {
                            category: true,
                            stockMovements: true
                        }
                    },
                    categories: true,
                    bills: {
                        include: {
                            items: {
                                include: {
                                    product: true
                                }
                            }
                        }
                    }
                }
            });
        }

        backupData.metadata = {
            backupDate: new Date().toISOString(),
            version: '1.0',
            shopId: shopId || 'all',
            recordCounts: {
                users: backupData.users?.length || 0,
                shops: shopId ? 1 : backupData.shops?.length || 0,
                products: shopId
                    ? backupData.shop?.products?.length || 0
                    : backupData.shops?.reduce((sum, shop) => sum + shop.products.length, 0) || 0,
                bills: shopId
                    ? backupData.shop?.bills?.length || 0
                    : backupData.shops?.reduce((sum, shop) => sum + shop.bills.length, 0) || 0
            }
        };

        return backupData;
    } catch (error) {
        throw new Error(`Database backup failed: ${error.message}`);
    }
}


async function saveBackupToFile(backupData, fileName) {
    const backupDir = path.join(__dirname, '../../backups');

    
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const filePath = path.join(backupDir, fileName);

    
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');

    const stats = fs.statSync(filePath);

    return {
        filePath,
        fileName,
        fileSize: stats.size
    };
}


async function createBackupArchive(files, archiveName) {
    return new Promise((resolve, reject) => {
        const backupDir = path.join(__dirname, '../../backups');
        const archivePath = path.join(backupDir, archiveName);

        const output = fs.createWriteStream(archivePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } 
        });

        output.on('close', () => {
            const stats = fs.statSync(archivePath);
            resolve({
                filePath: archivePath,
                fileName: archiveName,
                fileSize: stats.size
            });
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                archive.file(file.path, { name: file.name });
            }
        });

        archive.finalize();
    });
}


async function restoreBackupFromFile(filePath) {
    try {
        const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        
        if (!backupData.metadata) {
            throw new Error('Invalid backup file: missing metadata');
        }

        
        
        
        
        

        const restoredCounts = {
            products: 0,
            categories: 0,
            bills: 0
        };

        if (backupData.shop) {
            
            const shop = backupData.shop;

            
            for (const category of shop.categories) {
                await prisma.category.upsert({
                    where: { id: category.id },
                    update: {
                        name: category.name
                    },
                    create: {
                        id: category.id,
                        shopId: shop.id,
                        name: category.name
                    }
                });
                restoredCounts.categories++;
            }

            
            for (const product of shop.products) {
                await prisma.product.upsert({
                    where: { id: product.id },
                    update: {
                        name: product.name,
                        quantityType: product.quantityType,
                        costPrice: product.costPrice,
                        sellingPrice: product.sellingPrice,
                        stock: product.stock,
                        reorderLevel: product.reorderLevel,
                        isActive: product.isActive
                    },
                    create: {
                        id: product.id,
                        shopId: shop.id,
                        categoryId: product.categoryId,
                        name: product.name,
                        quantityType: product.quantityType,
                        costPrice: product.costPrice,
                        sellingPrice: product.sellingPrice,
                        stock: product.stock,
                        reorderLevel: product.reorderLevel,
                        isActive: product.isActive
                    }
                });
                restoredCounts.products++;
            }
        }

        return {
            success: true,
            metadata: backupData.metadata,
            restoredCounts
        };
    } catch (error) {
        throw new Error(`Backup restoration failed: ${error.message}`);
    }
}


async function getAvailableBackups() {
    const backupDir = path.join(__dirname, '../../backups');

    if (!fs.existsSync(backupDir)) {
        return [];
    }

    const files = fs.readdirSync(backupDir);
    const backups = [];

    for (const file of files) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);

        backups.push({
            fileName: file,
            filePath,
            fileSize: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
        });
    }

    return backups.sort((a, b) => b.createdAt - a.createdAt);
}


async function cleanupOldBackups(keepCount = 10) {
    const backups = await getAvailableBackups();

    if (backups.length <= keepCount) {
        return { deleted: 0 };
    }

    const toDelete = backups.slice(keepCount);
    let deletedCount = 0;

    for (const backup of toDelete) {
        try {
            fs.unlinkSync(backup.filePath);
            deletedCount++;
        } catch (error) {
            console.error(`Failed to delete backup ${backup.fileName}:`, error.message);
        }
    }

    return { deleted: deletedCount };
}

module.exports = {
    createFullDatabaseBackup,
    saveBackupToFile,
    createBackupArchive,
    restoreBackupFromFile,
    getAvailableBackups,
    cleanupOldBackups
};
