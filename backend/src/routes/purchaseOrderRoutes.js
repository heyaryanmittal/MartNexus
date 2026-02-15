const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();


router.get('/', authenticateToken, async (req, res) => {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    try {
        const pos = await prisma.purchaseOrder.findMany({
            where: { shopId },
            include: {
                supplier: true,
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(pos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/', authenticateToken, async (req, res) => {
    const { shopId, supplier_id, order_date, expected_delivery_date, notes, items } = req.body;
    

    if (!shopId || !supplier_id || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const total_amount = items.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);

        const po = await prisma.purchaseOrder.create({
            data: {
                shopId,
                supplier_id,
                order_date: order_date ? new Date(order_date) : undefined,
                expected_delivery_date: expected_delivery_date ? new Date(expected_delivery_date) : undefined,
                notes,
                total_amount,
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: parseFloat(item.quantity),
                        costPrice: parseFloat(item.costPrice)
                    }))
                }
            },
            include: { items: true }
        });
        res.status(201).json(po);
    } catch (error) {
        console.error("Error creating PO:", error);
        res.status(500).json({ error: error.message });
    }
});


router.patch('/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const po = await prisma.purchaseOrder.update({
            where: { id },
            data: { status }
        });

        
        if (status === 'RECEIVED') {
            const poWithItems = await prisma.purchaseOrder.findUnique({
                where: { id },
                include: { items: true }
            });

            for (const item of poWithItems.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { increment: item.quantity },
                        costPrice: item.costPrice
                    }
                });

                
                await prisma.stockMovement.create({
                    data: {
                        productId: item.productId,
                        quantity: item.quantity,
                        type: 'IN',
                        referenceNumber: poWithItems.id,
                        notes: `Received from Purchase Order ${poWithItems.id}`
                    }
                });
            }
        }

        res.json(po);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
