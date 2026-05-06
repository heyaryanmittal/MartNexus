const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();


router.post('/', authenticateToken, async (req, res) => {
    
    const sPrice = parseFloat(req.body.sellingPrice ?? req.body.price ?? 0);
    const cPrice = parseFloat(req.body.costPrice ?? req.body.cost ?? 0);
    const stockQty = parseFloat(req.body.stock ?? 0);
    const rLevel = parseFloat(req.body.reorderLevel ?? req.body.reorder_level ?? 5);

    try {
        const product = await prisma.product.create({
            data: {
                shopId: req.body.shopId,
                name: req.body.name,
                categoryId: req.body.categoryId ?? req.body.category_id,
                quantityType: req.body.quantityType ?? req.body.quantity_type ?? 'PIECES',
                costPrice: cPrice,
                sellingPrice: sPrice,
                stock: stockQty,
                reorderLevel: rLevel,
                sku: req.body.sku,
                barcode: req.body.barcode,
                description: req.body.description,
                isActive: req.body.isActive ?? req.body.is_active ?? true
            }
        });
        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/', authenticateToken, async (req, res) => {
    const { shopId, search, categoryId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    try {
        const whereClause = {
            shopId,
            
            
        };

        
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (categoryId && categoryId !== 'all') {
            whereClause.categoryId = categoryId;
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: { category: true }, 
            orderBy: { name: 'asc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const sPrice = req.body.sellingPrice !== undefined ? parseFloat(req.body.sellingPrice) : (req.body.price !== undefined ? parseFloat(req.body.price) : undefined);
    const cPrice = req.body.costPrice !== undefined ? parseFloat(req.body.costPrice) : (req.body.cost !== undefined ? parseFloat(req.body.cost) : undefined);
    const stockQty = req.body.stock !== undefined ? parseFloat(req.body.stock) : undefined;
    const rLevel = req.body.reorderLevel !== undefined ? parseFloat(req.body.reorderLevel) : (req.body.reorder_level !== undefined ? parseFloat(req.body.reorder_level) : undefined);

    try {
        const product = await prisma.product.update({
            where: { id },
            data: {
                categoryId: req.body.categoryId ?? req.body.category_id,
                name: req.body.name,
                quantityType: req.body.quantityType ?? req.body.quantity_type,
                costPrice: cPrice,
                sellingPrice: sPrice,
                stock: stockQty,
                reorderLevel: rLevel,
                sku: req.body.sku,
                barcode: req.body.barcode,
                description: req.body.description,
                isActive: req.body.isActive ?? req.body.is_active
            }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/low-stock', authenticateToken, async (req, res) => {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    try {
        const products = await prisma.product.findMany({
            where: {
                shopId,
                isActive: true
            },
            include: { category: true }
        });

        
        const lowStockProducts = products.filter(p => p.stock <= (p.reorderLevel || 5));
        lowStockProducts.sort((a, b) => a.stock - b.stock);

        res.json(lowStockProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

