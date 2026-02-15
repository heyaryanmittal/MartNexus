const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();


router.get('/', authenticateToken, async (req, res) => {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    try {
        const customers = await prisma.customer.findMany({
            where: { shopId },
            orderBy: { name: 'asc' }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/', authenticateToken, async (req, res) => {
    const { shopId, name, email, phone, address, discountPercentage } = req.body;
    console.log('=== CREATE CUSTOMER REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Discount value:', discountPercentage);
    console.log('Parsed discount:', parseFloat(discountPercentage) || 0);

    if (!shopId || !name) return res.status(400).json({ error: 'Shop ID and Name are required' });

    try {
        const customer = await prisma.customer.create({
            data: {
                shopId,
                name,
                email,
                phone,
                address,
                discountPercentage: parseFloat(discountPercentage) || 0
            }
        });
        console.log('Created customer:', customer);
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, discountPercentage } = req.body;
    console.log('=== UPDATE CUSTOMER REQUEST ===');
    console.log('Customer ID:', id);
    console.log('Request body:', req.body);
    console.log('Discount value:', discountPercentage);

    try {
        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                address,
                discountPercentage: discountPercentage !== undefined ? parseFloat(discountPercentage) : undefined
            }
        });
        console.log('Updated customer:', customer);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.customer.delete({ where: { id } });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:id/pricing', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const pricing = await prisma.customerPricing.findMany({
            where: { customerId: id },
            include: { product: true }
        });
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/:id/pricing', authenticateToken, async (req, res) => {
    const { id } = req.params;
    // Map snake_case to camelCase
    const productId = req.body.productId || req.body.product_id;
    const customPrice = req.body.customPrice || req.body.custom_price;
    const discountPercentage = req.body.discountPercentage || req.body.discount_percentage;

    try {
        const pricing = await prisma.customerPricing.upsert({
            where: {
                customerId_productId: {
                    customerId: id,
                    productId
                }
            },
            update: {
                customPrice: customPrice ? parseFloat(customPrice) : undefined,
                discountPercentage: discountPercentage ? parseFloat(discountPercentage) : 0
            },
            create: {
                customerId: id,
                productId,
                customPrice: parseFloat(customPrice) || 0,
                discountPercentage: parseFloat(discountPercentage) || 0
            }
        });
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:id/history', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const bills = await prisma.bill.findMany({
            where: { customerId: id },
            include: {
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id/pricing/:pricingId', authenticateToken, async (req, res) => {
    const { pricingId } = req.params;
    try {
        await prisma.customerPricing.delete({ where: { id: pricingId } });
        res.json({ message: 'Pricing deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
