const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();


router.get('/', authenticateToken, async (req, res) => {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    try {
        const suppliers = await prisma.supplier.findMany({
            where: { shopId },
            orderBy: { name: 'asc' }
        });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/', authenticateToken, async (req, res) => {
    const { shopId, name, code, contact_person, email, phone, address, city, payment_terms, notes, is_active } = req.body;
    if (!shopId || !name) return res.status(400).json({ error: 'Shop ID and Name are required' });
    try {
        const supplier = await prisma.supplier.create({
            data: { shopId, name, code, contact_person, email, phone, address, city, payment_terms, notes, is_active }
        });

        await prisma.auditLog.create({
            data: {
                table_name: 'Supplier',
                action: 'INSERT',
                user_id: req.user.userId,
                record_id: supplier.id,
                new_values: supplier
            }
        });

        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, code, contact_person, email, phone, address, city, payment_terms, notes, is_active } = req.body;
    try {
        const existingSupplier = await prisma.supplier.findUnique({ where: { id } });
        if (!existingSupplier) return res.status(404).json({ message: 'Supplier not found' });

        const supplier = await prisma.supplier.update({
            where: { id },
            data: { name, code, contact_person, email, phone, address, city, payment_terms, notes, is_active }
        });

        await prisma.auditLog.create({
            data: {
                table_name: 'Supplier',
                action: 'UPDATE',
                user_id: req.user.userId,
                record_id: id,
                old_values: existingSupplier,
                new_values: supplier
            }
        });

        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const existingSupplier = await prisma.supplier.findUnique({ where: { id } });
        if (!existingSupplier) return res.status(404).json({ message: 'Supplier not found' });

        await prisma.supplier.delete({ where: { id } });

        await prisma.auditLog.create({
            data: {
                table_name: 'Supplier',
                action: 'DELETE',
                user_id: req.user.userId,
                record_id: id,
                old_values: existingSupplier
            }
        });

        res.json({ message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




router.get('/:id/products', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const supplierProducts = await prisma.supplierProduct.findMany({
            where: { supplierId: id },
            include: { product: true }
        });
        res.json(supplierProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/:id/products', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { productId, costPrice, supplierSku, isPreferred } = req.body;

    if (!productId || !costPrice) {
        return res.status(400).json({ error: 'Product ID and Cost Price are required' });
    }

    try {
        
        const existing = await prisma.supplierProduct.findUnique({
            where: {
                supplierId_productId: {
                    supplierId: id,
                    productId
                }
            }
        });

        if (existing) {
            
            const updated = await prisma.supplierProduct.update({
                where: { id: existing.id },
                data: { costPrice, supplierSku, isPreferred }
            });
            return res.json(updated);
        }

        const linked = await prisma.supplierProduct.create({
            data: {
                supplierId: id,
                productId,
                costPrice,
                supplierSku,
                isPreferred
            }
        });
        res.status(201).json(linked);
    } catch (error) {
        console.error("Link product error:", error);
        res.status(500).json({ error: error.message });
    }
});


router.delete('/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; 
    try {
        await prisma.supplierProduct.delete({ where: { id } });
        res.json({ message: 'Product unlinked successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
