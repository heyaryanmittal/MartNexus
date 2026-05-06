const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();


router.post('/', authenticateToken, async (req, res) => {
    const { name, address, mobile, gstin } = req.body;
    try {
        const shop = await prisma.shop.create({
            data: {
                name,
                address,
                mobile,
                gstin,
                ownerId: req.user.userId
            }
        });
        res.status(201).json(shop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/', authenticateToken, async (req, res) => {
    try {
        const shops = await prisma.shop.findMany({
            where: { ownerId: req.user.userId }
        });
        res.json(shops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, address, mobile, gstin } = req.body;
    try {
        const existingShop = await prisma.shop.findUnique({ where: { id } });
        if (!existingShop) return res.status(404).json({ message: 'Shop not found' });
        if (existingShop.ownerId !== req.user.userId) return res.status(403).json({ message: 'Unauthorized' });

        const shop = await prisma.shop.update({
            where: { id },
            data: { name, address, mobile, gstin }
        });
        res.json(shop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const existingShop = await prisma.shop.findUnique({
            where: { id },
            include: {
                bills: true,
                products: true,
                categories: true,
                customers: true,
                suppliers: true,
                purchaseOrders: true
            }
        });

        if (!existingShop) return res.status(404).json({ message: 'Shop not found' });
        if (existingShop.ownerId !== req.user.userId) return res.status(403).json({ message: 'Unauthorized' });

        
        await prisma.$transaction(async (tx) => {
            

            
            const billIds = existingShop.bills.map(b => b.id);
            if (billIds.length > 0) {
                await tx.billItem.deleteMany({ where: { billId: { in: billIds } } });
            }

            
            const poIds = existingShop.purchaseOrders.map(po => po.id);
            if (poIds.length > 0) {
                await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: { in: poIds } } });
            }

            
            const customerIds = existingShop.customers.map(c => c.id);
            if (customerIds.length > 0) {
                await tx.customerPricing.deleteMany({ where: { customerId: { in: customerIds } } });
            }

            
            const productIds = existingShop.products.map(p => p.id);
            if (productIds.length > 0) {
                await tx.stockMovement.deleteMany({ where: { productId: { in: productIds } } });
            }

            
            if (billIds.length > 0) {
                await tx.bill.deleteMany({ where: { shopId: id } });
            }

            
            if (poIds.length > 0) {
                await tx.purchaseOrder.deleteMany({ where: { shopId: id } });
            }

            
            await tx.product.deleteMany({ where: { shopId: id } });

            
            await tx.category.deleteMany({ where: { shopId: id } });

            
            await tx.customer.deleteMany({ where: { shopId: id } });

            
            await tx.supplier.deleteMany({ where: { shopId: id } });

            
            await tx.shop.delete({ where: { id } });
        });

        res.json({ message: 'Shop and all related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting shop:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
