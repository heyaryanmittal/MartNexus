const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();


router.post('/', authenticateToken, async (req, res) => {
    const { shopId, name } = req.body;
    try {
        const category = await prisma.category.create({
            data: {
                shopId,
                name
            }
        });

        await prisma.auditLog.create({
            data: {
                table_name: 'Category',
                action: 'INSERT',
                user_id: req.user.userId,
                record_id: category.id,
                new_values: category
            }
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/', authenticateToken, async (req, res) => {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    try {
        const categories = await prisma.category.findMany({
            where: { shopId },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const existingCategory = await prisma.category.findUnique({ where: { id } });
        if (!existingCategory) return res.status(404).json({ message: 'Category not found' });

        const category = await prisma.category.update({
            where: { id },
            data: { name }
        });

        await prisma.auditLog.create({
            data: {
                table_name: 'Category',
                action: 'UPDATE',
                user_id: req.user.userId,
                record_id: id,
                old_values: existingCategory,
                new_values: category
            }
        });

        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const existingCategory = await prisma.category.findUnique({ where: { id } });
        if (!existingCategory) return res.status(404).json({ message: 'Category not found' });

        await prisma.category.delete({ where: { id } });

        await prisma.auditLog.create({
            data: {
                table_name: 'Category',
                action: 'DELETE',
                user_id: req.user.userId,
                record_id: id,
                old_values: existingCategory
            }
        });

        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
