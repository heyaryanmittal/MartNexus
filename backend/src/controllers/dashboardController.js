const prisma = require('../utils/prismaClient');
const { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } = require('date-fns');


async function getDashboardStats(req, res) {
    const { shopId } = req.query;
    const userId = req.user.id;

    try {
        const today = new Date();
        const yesterday = subDays(today, 1);
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        const last7Days = subDays(today, 6);

        
        const shopFilter = shopId ? { shopId } : { shop: { ownerId: userId } };

        
        const todayBills = await prisma.bill.findMany({
            where: {
                ...shopFilter,
                createdAt: {
                    gte: startOfDay(today),
                    lte: endOfDay(today)
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        
        const yesterdayBills = await prisma.bill.findMany({
            where: {
                ...shopFilter,
                createdAt: {
                    gte: startOfDay(yesterday),
                    lte: endOfDay(yesterday)
                }
            }
        });

        
        const monthBills = await prisma.bill.findMany({
            where: {
                ...shopFilter,
                createdAt: {
                    gte: monthStart,
                    lte: monthEnd
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        
        const trendBills = await prisma.bill.findMany({
            where: {
                ...shopFilter,
                createdAt: {
                    gte: startOfDay(last7Days)
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        
        const lowStockProducts = await prisma.product.findMany({
            where: {
                ...shopFilter,
                isActive: true,
                stock: {
                    lte: 5 
                }
            },
            include: {
                category: true
            },
            orderBy: {
                stock: 'asc'
            },
            take: 10
        });

        
        const allProducts = await prisma.product.findMany({
            where: shopFilter,
            include: {
                category: true
            }
        });

        
        const todayRevenue = todayBills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0);
        const todayTax = todayBills.reduce((sum, bill) => sum + parseFloat(bill.taxAmount || 0), 0);

        let todayCost = 0;
        todayBills.forEach(bill => {
            bill.items.forEach(item => {
                todayCost += parseFloat(item.product.costPrice || 0) * item.quantity;
            });
        });
        const todayProfit = todayRevenue - todayCost - todayTax;

        
        
        
        const todayDiscount = todayBills.reduce((sum, bill) => {
            const billDiscount = (parseFloat(bill.subTotal) + parseFloat(bill.taxAmount || 0)) - parseFloat(bill.grandTotal);
            return sum + (billDiscount > 0 ? billDiscount : 0);
        }, 0);

        
        const yesterdayRevenue = yesterdayBills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0);

        
        const monthRevenue = monthBills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0);
        const monthTax = monthBills.reduce((sum, bill) => sum + parseFloat(bill.taxAmount || 0), 0);

        let monthCost = 0;
        monthBills.forEach(bill => {
            bill.items.forEach(item => {
                monthCost += parseFloat(item.product.costPrice || 0) * item.quantity;
            });
        });
        const monthProfit = monthRevenue - monthCost - monthTax;

        
        const salesChange = yesterdayBills.length > 0
            ? ((todayBills.length - yesterdayBills.length) / yesterdayBills.length) * 100
            : todayBills.length > 0 ? 100 : 0;

        const revenueChange = yesterdayRevenue > 0
            ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
            : todayRevenue > 0 ? 100 : 0;

        
        const salesByDate = new Map();
        trendBills.forEach(bill => {
            const date = format(new Date(bill.createdAt), 'yyyy-MM-dd');
            const existing = salesByDate.get(date) || { revenue: 0, sales: 0, profit: 0, tax: 0 };

            existing.revenue += parseFloat(bill.totalAmount);
            existing.sales += 1;
            existing.tax += parseFloat(bill.taxAmount || 0);

            let cost = 0;
            bill.items.forEach(item => {
                cost += parseFloat(item.product.costPrice || 0) * item.quantity;
            });
            existing.profit += parseFloat(bill.totalAmount) - cost - parseFloat(bill.taxAmount || 0);

            salesByDate.set(date, existing);
        });


        const salesTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = format(subDays(today, i), 'yyyy-MM-dd');
            const data = salesByDate.get(date) || { revenue: 0, sales: 0, profit: 0, tax: 0 };
            salesTrend.push({
                date,
                ...data,
                formattedDate: format(subDays(today, i), 'MMM dd')
            });
        }

        
        const productSales = new Map();
        trendBills.forEach(bill => {
            bill.items.forEach(item => {
                const existing = productSales.get(item.productId) || {
                    name: item.product.name,
                    quantity: 0,
                    revenue: 0
                };
                existing.quantity += item.quantity;
                existing.revenue += parseFloat(item.price) * item.quantity;
                productSales.set(item.productId, existing);
            });
        });

        const topProducts = Array.from(productSales.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        
        const categorySales = new Map();
        trendBills.forEach(bill => {
            bill.items.forEach(item => {
                const categoryName = item.product.category?.name || 'Uncategorized';
                const existing = categorySales.get(categoryName) || { name: categoryName, value: 0, count: 0 };
                existing.value += parseFloat(item.price) * item.quantity;
                existing.count += item.quantity;
                categorySales.set(categoryName, existing);
            });
        });

        const salesByCategory = Array.from(categorySales.values())
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        
        const recentBills = todayBills
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(bill => ({
                id: bill.id,
                billNumber: bill.billNumber,
                customerName: bill.customerName || 'Walk-in Customer',
                totalAmount: parseFloat(bill.totalAmount),
                paymentMode: bill.paymentMode,
                createdAt: bill.createdAt,
                itemCount: bill.items.length
            }));


        
        const avgOrderValue = monthBills.length > 0
            ? monthRevenue / monthBills.length
            : 0;

        
        const paymentModes = {};
        monthBills.forEach(bill => {
            paymentModes[bill.paymentMode] = (paymentModes[bill.paymentMode] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                metrics: {
                    
                    todaySales: todayBills.length,
                    todayRevenue: parseFloat(todayRevenue.toFixed(2)),
                    todayProfit: parseFloat(todayProfit.toFixed(2)),
                    todayTax: parseFloat(todayTax.toFixed(2)),
                    todayDiscount: parseFloat(todayDiscount.toFixed(2)),

                    
                    monthSales: monthBills.length,
                    monthRevenue: parseFloat(monthRevenue.toFixed(2)),
                    monthProfit: parseFloat(monthProfit.toFixed(2)),
                    monthTax: parseFloat(monthTax.toFixed(2)),

                    
                    salesChange: parseFloat(salesChange.toFixed(2)),
                    revenueChange: parseFloat(revenueChange.toFixed(2)),

                    
                    lowStockCount: lowStockProducts.length,
                    totalProducts: allProducts.length,
                    avgOrderValue: parseFloat(avgOrderValue.toFixed(2))
                },
                salesTrend,
                lowStockProducts: lowStockProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    stock: p.stock,
                    reorderLevel: p.reorderLevel,
                    category: p.category?.name || 'Uncategorized',
                    sellingPrice: parseFloat(p.sellingPrice)
                })),
                recentBills,
                topProducts,
                salesByCategory,
                paymentModes
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
}


async function getQuickStats(req, res) {
    const { shopId } = req.query;
    const userId = req.user.id;

    try {
        const today = new Date();
        const shopFilter = shopId ? { shopId } : { shop: { ownerId: userId } };

        const [todaySales, lowStock, totalProducts] = await Promise.all([
            prisma.bill.count({
                where: {
                    ...shopFilter,
                    createdAt: {
                        gte: startOfDay(today),
                        lte: endOfDay(today)
                    }
                }
            }),
            prisma.product.count({
                where: {
                    ...shopFilter,
                    isActive: true,
                    stock: {
                        lte: 5
                    }
                }
            }),

            prisma.product.count({
                where: {
                    ...shopFilter,
                    isActive: true
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                todaySales,
                lowStock,
                totalProducts
            }
        });
    } catch (error) {
        console.error('Quick stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quick statistics',
            error: error.message
        });
    }
}

module.exports = {
    getDashboardStats,
    getQuickStats
};
