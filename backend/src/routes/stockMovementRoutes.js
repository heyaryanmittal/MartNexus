const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();


router.post('/', authenticateToken, async (req, res) => {
    const {
        productId,
        type,
        quantity,
        batchNumber,
        expiryDate,
        referenceNumber,
        notes
    } = req.body;

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
        return res.status(400).json({ error: 'Invalid movement type' });
    }

    try {
        const result = await prisma.$transaction(async (prisma) => {
            
            const movement = await prisma.stockMovement.create({
                data: {
                    productId,
                    type,
                    quantity: parseFloat(quantity),
                    batchNumber,
                    expiryDate: expiryDate ? new Date(expiryDate) : null,
                    referenceNumber,
                    notes,
                    createdBy: req.user.userId
                }
            });

            
            const product = await prisma.product.findUnique({ where: { id: productId } });
            if (!product) throw new Error("Product not found");

            let newStock = parseFloat(product.stock);
            const qty = parseFloat(quantity);

            if (type === 'IN') {
                newStock += qty;
            } else if (type === 'OUT') {
                newStock -= qty;
                if (newStock < 0) {
                    
                    
                    
                    
                    throw new Error("Insufficient stock");
                }
            } else if (type === 'ADJUSTMENT') {
                
                
                
                
                
                
                
                
                
                
                
                
                if (qty > 0) newStock += qty;
                else newStock += qty; 
            }

            await prisma.product.update({
                where: { id: productId },
                data: { stock: newStock }
            });

            return movement;
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.get('/', authenticateToken, async (req, res) => {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });

    try {
        const movements = await prisma.stockMovement.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(movements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
