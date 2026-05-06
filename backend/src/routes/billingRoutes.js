const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();



router.post('/', authenticateToken, async (req, res) => {
    const { shopId, customerId, customerName, customerMobile, paymentMode, items } = req.body;

    console.log("Create Bill Payload:", JSON.stringify(req.body, null, 2));

    if (!shopId || !items || items.length === 0) {
        return res.status(400).json({ error: "Missing required fields or empty items" });
    }

    try {

        const shop = await prisma.shop.findUnique({ where: { id: shopId } });
        if (!shop) {
            console.error(`Shop not found: ${shopId}`);
            return res.status(404).json({ error: "Shop not found" });
        }


        if (customerId) {
            const customer = await prisma.customer.findUnique({ where: { id: customerId } });
            if (!customer) {
                console.error(`Customer not found: ${customerId}`);



                return res.status(400).json({ error: `Customer with ID ${customerId} not found` });
            }
        }

        const result = await prisma.$transaction(async (prisma) => {
            let subTotal = 0;
            let totalTax = 0;
            let grandTotal = 0;
            let totalCgst = 0;
            let totalSgst = 0;
            let totalIgst = 0;

            const billItemsData = [];

            for (const item of items) {
                const product = await prisma.product.findUnique({ where: { id: item.productId } });
                if (!product) throw new Error(`Product ${item.productId} not found`);


                const qty = Number(item.quantity);
                if (isNaN(qty) || qty <= 0) throw new Error(`Invalid quantity for product ${product.name}`);


                if (product.stock < qty) throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${qty}`);


                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: product.stock - qty }
                });


                const price = Number(item.price);
                const taxRate = item.taxRate ? Number(item.taxRate) / 100 : 0.18;

                const itemBaseTotal = price * qty;
                const itemTax = itemBaseTotal * taxRate;
                const itemTotal = itemBaseTotal + itemTax;

                const cgst = itemTax / 2;
                const sgst = itemTax / 2;
                const igst = 0;

                subTotal += itemBaseTotal;
                totalTax += itemTax;
                totalCgst += cgst;
                totalSgst += sgst;
                totalIgst += igst;
                grandTotal += itemTotal;

                billItemsData.push({
                    productId: item.productId,
                    quantity: qty,
                    price: price,
                    taxAmount: itemTax
                });
            }


            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const count = await prisma.bill.count({ where: { shopId } });
            const billNumber = `INV-${shopStr(shopId)}-${dateStr}-${String(count + 1).padStart(4, '0')}`;

            function shopStr(id) {
                return id ? id.slice(-4).toUpperCase() : 'SHOP';
            }

            const billData = {
                shopId,
                billNumber,
                customerName: customerName || "Walk-in Customer",
                customerMobile: customerMobile || "",
                paymentMode: paymentMode || 'CASH',
                status: 'PAID',
                subTotal,
                taxAmount: totalTax,
                cgst: totalCgst,
                sgst: totalSgst,
                igst: totalIgst,
                grandTotal: grandTotal,
                totalAmount: grandTotal,
                items: {
                    create: billItemsData
                }
            };

            if (customerId) {
                billData.customerId = customerId;
            }

            const bill = await prisma.bill.create({
                data: billData,
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            return bill;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error("Create Bill Internal Error:", error);
        res.status(500).json({ error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
    }
});


router.post('/:id/cancel', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const bill = await prisma.bill.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!bill) throw new Error("Bill not found");
            if (bill.status === 'CANCELLED') throw new Error("Bill already cancelled");


            for (const item of bill.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }


            const updatedBill = await prisma.bill.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });

            return updatedBill;
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/', authenticateToken, async (req, res) => {
    const { shopId, search, startDate, endDate, paymentMode } = req.query;


    const where = { shopId };

    if (search) {
        where.OR = [
            { billNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerMobile: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (startDate && startDate !== 'undefined') {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
            where.createdAt = { ...where.createdAt, gte: start };
        }
    }

    if (endDate && endDate !== 'undefined') {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
            where.createdAt = { ...where.createdAt, lte: end };
        }
    }

    if (paymentMode && paymentMode !== 'all' && paymentMode !== 'ALL') {
        const modeMap = {
            'cash': 'CASH',
            'card': 'NET_BANKING',
            'mobile': 'UPI',
            'other': 'CASH'
        };
        where.paymentMode = modeMap[paymentMode.toLowerCase()] || paymentMode.toUpperCase();
    }

    try {
        const bills = await prisma.bill.findMany({
            where,
            include: {
                items: {
                    include: { product: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const bill = await prisma.bill.findUnique({
            where: { id },
            include: { items: { include: { product: true } } }
        });
        if (!bill) return res.status(404).json({ error: "Bill not found" });
        res.json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
