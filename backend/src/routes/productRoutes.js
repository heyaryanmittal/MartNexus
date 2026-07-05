const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();


router.post('/', authenticateToken, async (req, res) => {
    const body = req.body || {};
    const sPrice = parseFloat(body.sellingPrice ?? body.price ?? 0);
    const cPrice = parseFloat(body.costPrice ?? body.cost ?? 0);
    const stockQty = parseFloat(body.stock ?? 0);
    const rLevel = parseFloat(body.reorderLevel ?? body.reorder_level ?? 5);
    try {
        const product = await prisma.product.create({
            data: {
                shopId: body.shopId,
                name: body.name,
                categoryId: body.categoryId ?? body.category_id,
                quantityType: body.quantityType ?? body.quantity_type ?? 'PIECES',
                costPrice: cPrice,
                sellingPrice: sPrice,
                stock: stockQty,
                reorderLevel: rLevel,
                sku: body.sku,
                barcode: body.barcode,
                description: body.description,
                isActive: body.isActive ?? body.is_active ?? true
            }
        });

        await prisma.auditLog.create({
            data: {
                table_name: 'Product',
                action: 'INSERT',
                user_id: req.user.userId,
                record_id: product.id,
                new_values: product
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
            select: {
                id: true,
                name: true,
                sellingPrice: true,
                costPrice: true,
                stock: true,
                reorderLevel: true,
                sku: true,
                barcode: true,
                isActive: true,
                categoryId: true,
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const body = req.body || {};
    const sPrice = body.sellingPrice !== undefined ? parseFloat(body.sellingPrice) : (body.price !== undefined ? parseFloat(body.price) : undefined);
    const cPrice = body.costPrice !== undefined ? parseFloat(body.costPrice) : (body.cost !== undefined ? parseFloat(body.cost) : undefined);
    const stockQty = body.stock !== undefined ? parseFloat(body.stock) : undefined;
    const rLevel = body.reorderLevel !== undefined ? parseFloat(body.reorderLevel) : (body.reorder_level !== undefined ? parseFloat(body.reorder_level) : undefined);

    try {
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

        const product = await prisma.product.update({
            where: { id },
            data: {
                categoryId: body.categoryId ?? body.category_id,
                name: body.name,
                quantityType: body.quantityType ?? body.quantity_type,
                costPrice: cPrice,
                sellingPrice: sPrice,
                stock: stockQty,
                reorderLevel: rLevel,
                sku: body.sku,
                barcode: body.barcode,
                description: body.description,
                isActive: body.isActive ?? body.is_active
            }
        });

        await prisma.auditLog.create({
            data: {
                table_name: 'Product',
                action: 'UPDATE',
                user_id: req.user.userId,
                record_id: id,
                old_values: existingProduct,
                new_values: product
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
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

        await prisma.product.delete({ where: { id } });

        await prisma.auditLog.create({
            data: {
                table_name: 'Product',
                action: 'DELETE',
                user_id: req.user.userId,
                record_id: id,
                old_values: existingProduct
            }
        });

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

