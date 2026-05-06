const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');


const toNum = (val) => parseFloat(val || 0);


router.get('/sales', auth, async (req, res) => {
  try {
    const { startDate, endDate, period, shopId } = req.query;

    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    
    const dateFilter = { shopId };
    if (startDate && startDate !== 'undefined' && endDate && endDate !== 'undefined') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        dateFilter.createdAt = {
          gte: start,
          lte: end
        };
      }
    } else if (period) {
      const now = new Date();
      let fromDate;

      switch (period) {
        case '7days':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '15days':
          fromDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      dateFilter.createdAt = {
        gte: fromDate,
        lte: now
      };
    }

    
    const sales = await prisma.bill.findMany({
      where: {
        ...dateFilter,
        status: 'PAID'
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    
    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + toNum(sale.totalAmount), 0),
      totalCost: 0,
      totalProfit: 0,
      averageOrderValue: 0,
      itemsSold: 0
    };

    const productStats = new Map();
    const categoryStats = new Map();
    const dailySalesMap = new Map();

    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        summary.itemsSold += item.quantity;
        const cost = toNum(item.product.costPrice);
        const itemCost = cost * item.quantity;
        const itemRevenue = toNum(item.price) * item.quantity;
        const itemProfit = itemRevenue - itemCost;

        summary.totalCost += itemCost;

        
        const prodId = item.productId;
        const existing = productStats.get(prodId) || {
          product_id: prodId,
          product_name: item.product.name,
          product_sku: item.product.sku,
          category_name: item.product.category?.name || 'Uncategorized',
          total_quantity: 0,
          total_revenue: 0,
          total_cost: 0,
          total_profit: 0
        };

        existing.total_quantity += item.quantity;
        existing.total_revenue += itemRevenue;
        existing.total_cost += itemCost;
        existing.total_profit += itemProfit;
        productStats.set(prodId, existing);

        
        const categoryName = item.product.category?.name || 'Uncategorized';
        const catExisting = categoryStats.get(categoryName) || {
          category: categoryName,
          revenue: 0,
          cost: 0,
          profit: 0
        };

        catExisting.revenue += itemRevenue;
        catExisting.cost += itemCost;
        catExisting.profit += itemProfit;
        categoryStats.set(categoryName, catExisting);
      });

      
      const date = sale.createdAt.toISOString().split('T')[0];
      const existing = dailySalesMap.get(date) || {
        date,
        revenue: 0,
        cost: 0,
        sales_count: 0
      };

      existing.revenue += toNum(sale.totalAmount);
      
      sale.items.forEach(item => {
        existing.cost += toNum(item.product.costPrice) * item.quantity;
      });
      existing.sales_count += 1;
      dailySalesMap.set(date, existing);
    });

    summary.totalProfit = summary.totalRevenue - summary.totalCost;
    summary.averageOrderValue = summary.totalSales > 0 ? summary.totalRevenue / summary.totalSales : 0;
    summary.profitMargin = summary.totalRevenue > 0 ? (summary.totalProfit / summary.totalRevenue) * 100 : 0;

    const dailySales = Array.from(dailySalesMap.values()).map(day => ({
      ...day,
      profit: day.revenue - day.cost
    }));

    const topProducts = Array.from(productStats.values())
      .map(p => ({
        ...p,
        profit_margin: p.total_revenue > 0 ? (p.total_profit / p.total_revenue) * 100 : 0
      }))
      .sort((a, b) => b.total_quantity - a.total_quantity);

    const profitAnalysis = {
      totalRevenue: summary.totalRevenue,
      totalCost: summary.totalCost,
      totalProfit: summary.totalProfit,
      profitMargin: summary.profitMargin,
      byCategory: Array.from(categoryStats.values()).map(cat => ({
        ...cat,
        margin: cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0
      }))
    };

    res.json({
      summary,
      dailySales,
      topProducts,
      profitAnalysis
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ error: 'Failed to fetch sales report: ' + error.message });
  }
});



router.get('/stock', auth, async (req, res) => {
  try {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    const products = await prisma.product.findMany({
      where: { shopId },
      include: { category: true }
    });

    const stockData = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku || 'N/A',
      category: product.category ? product.category.name : 'Uncategorized',
      currentStock: product.stock,
      minStock: product.reorderLevel || 5,
      maxStock: (product.reorderLevel || 5) * 5, 
      unitPrice: toNum(product.sellingPrice),
      cost: toNum(product.costPrice),
      lastRestocked: product.updatedAt,
    }));

    
    const summary = {
      totalProducts: stockData.length,
      lowStockItems: stockData.filter(p => p.currentStock <= p.minStock).length,
      outOfStockItems: stockData.filter(p => p.currentStock === 0).length,
      overstockItems: stockData.filter(p => p.currentStock >= p.maxStock).length,
      totalStockValue: stockData.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0),
      totalCostValue: stockData.reduce((sum, p) => sum + (p.currentStock * p.cost), 0)
    };

    summary.potentialProfit = summary.totalStockValue - summary.totalCostValue;

    res.json({
      stockData,
      summary
    });
  } catch (error) {
    console.error('Error fetching stock report:', error);
    res.status(500).json({ error: 'Failed to fetch stock report: ' + error.message });
  }
});


router.get('/profit', auth, async (req, res) => {
  try {
    const { startDate, endDate, shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    const dateFilter = { shopId, status: 'PAID' };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const sales = await prisma.bill.findMany({
      where: dateFilter,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const profitData = {
      summary: {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitMargin: 0,
        grossMargin: 0,
        netMargin: 0,
        operatingExpenses: 0
      },
      categoryBreakdown: [],
      productProfitability: [],
      monthlyTrend: []
    };

    const categoryMap = new Map();
    const productMap = new Map();
    const monthlyMap = new Map();

    sales.forEach(sale => {
      const monthYear = sale.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      const monthData = monthlyMap.get(monthYear) || { month: monthYear, revenue: 0, cost: 0, profit: 0, margin: 0 };

      const saleRevenue = toNum(sale.totalAmount);
      let saleCost = 0;

      sale.items.forEach(item => {
        const cost = toNum(item.product.costPrice);
        const itemCost = cost * item.quantity;
        const itemRevenue = toNum(item.price) * item.quantity;
        const itemProfit = itemRevenue - itemCost;

        saleCost += itemCost;
        profitData.summary.totalCost += itemCost;

        
        const categoryName = item.product.category?.name || 'Uncategorized';
        const catData = categoryMap.get(categoryName) || {
          category: categoryName,
          revenue: 0,
          cost: 0,
          profit: 0,
          itemsSold: 0
        };
        catData.revenue += itemRevenue;
        catData.cost += itemCost;
        catData.profit += itemProfit;
        catData.itemsSold += item.quantity;
        categoryMap.set(categoryName, catData);

        
        const prodData = productMap.get(item.productId) || {
          name: item.product.name,
          sku: item.product.sku,
          revenue: 0,
          cost: 0,
          profit: 0,
          quantity: 0
        };
        prodData.revenue += itemRevenue;
        prodData.cost += itemCost;
        prodData.profit += itemProfit;
        prodData.quantity += item.quantity;
        productMap.set(item.productId, prodData);
      });

      profitData.summary.totalRevenue += saleRevenue;

      monthData.revenue += saleRevenue;
      monthData.cost += saleCost;
      monthData.profit += (saleRevenue - saleCost);
      monthlyMap.set(monthYear, monthData);
    });

    profitData.summary.totalProfit = profitData.summary.totalRevenue - profitData.summary.totalCost;
    profitData.summary.profitMargin = profitData.summary.totalRevenue > 0 ?
      (profitData.summary.totalProfit / profitData.summary.totalRevenue) * 100 : 0;
    profitData.summary.grossMargin = profitData.summary.profitMargin * 1.1; 
    profitData.summary.netMargin = profitData.summary.profitMargin * 0.9; 

    profitData.categoryBreakdown = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      margin: cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0
    }));

    profitData.productProfitability = Array.from(productMap.values()).map(prod => ({
      ...prod,
      margin: prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0
    }));

    profitData.monthlyTrend = Array.from(monthlyMap.values()).map(m => ({
      ...m,
      margin: m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0
    }));

    res.json(profitData);
  } catch (error) {
    console.error('Error fetching profit report:', error);
    res.status(500).json({ error: 'Failed to fetch profit report: ' + error.message });
  }
});


router.get('/gst', auth, async (req, res) => {
  try {
    const { startDate, endDate, shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    const dateFilter = { shopId, status: 'PAID' };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const sales = await prisma.bill.findMany({
      where: dateFilter,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const gstData = {
      summary: {
        totalTaxableAmount: 0,
        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 0,
        totalGST: 0,
        exemptedAmount: 0,
        zeroRatedAmount: 0,
        totalInvoices: sales.length
      },
      monthlyBreakdown: [],
      categoryGST: [],
      gstRates: []
    };

    const monthlyMap = new Map();
    const categoryMap = new Map();
    const rateMap = new Map();

    sales.forEach(sale => {
      const monthYear = sale.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      const monthData = monthlyMap.get(monthYear) || {
        month: monthYear,
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalGST: 0,
        invoices: 0,
        exempted: 0,
        zeroRated: 0
      };

      gstData.summary.totalTaxableAmount += toNum(sale.subTotal);
      gstData.summary.totalCGST += toNum(sale.cgst);
      gstData.summary.totalSGST += toNum(sale.sgst);
      gstData.summary.totalIGST += toNum(sale.igst);
      gstData.summary.totalGST += toNum(sale.taxAmount);

      monthData.taxableAmount += toNum(sale.subTotal);
      monthData.cgst += toNum(sale.cgst);
      monthData.sgst += toNum(sale.sgst);
      monthData.igst += toNum(sale.igst);
      monthData.totalGST += toNum(sale.taxAmount);
      monthData.invoices += 1;
      monthlyMap.set(monthYear, monthData);

      sale.items.forEach(item => {
        
        const gstRate = 18;
        const taxable = toNum(item.price) * item.quantity;
        const tax = (taxable * gstRate) / 100;

        
        const categoryName = item.product.categoryId || 'Uncategorized';
        const catData = categoryMap.get(categoryName) || {
          category: categoryName,
          taxableAmount: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalGST: 0,
          gstRate,
          invoices: 0,
          exempted: 0
        };
        catData.taxableAmount += taxable;
        catData.cgst += tax / 2;
        catData.sgst += tax / 2;
        catData.totalGST += tax;
        catData.invoices += 1;
        categoryMap.set(categoryName, catData);

        
        const rData = rateMap.get(gstRate) || { rate: gstRate, taxableAmount: 0, gstAmount: 0, invoices: 0 };
        rData.taxableAmount += taxable;
        rData.gstAmount += tax;
        rData.invoices += 1;
        rateMap.set(gstRate, rData);
      });
    });

    gstData.monthlyBreakdown = Array.from(monthlyMap.values());
    gstData.categoryGST = Array.from(categoryMap.values());
    gstData.gstRates = Array.from(rateMap.values());

    res.json(gstData);
  } catch (error) {
    console.error('Error fetching GST report:', error);
    res.status(500).json({ error: 'Failed to fetch GST report: ' + error.message });
  }
});



router.get('/products', auth, async (req, res) => {
  try {
    const { startDate, endDate, shopId, sortBy = 'revenue' } = req.query;
    if (!shopId) return res.status(400).json({ error: 'Shop ID is required' });

    const dateFilter = { shopId, status: 'PAID' };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const sales = await prisma.bill.findMany({
      where: dateFilter,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const productMap = new Map();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const cost = toNum(item.product.costPrice);
        const itemCost = cost * item.quantity;
        const itemRevenue = toNum(item.price) * item.quantity;
        const itemProfit = itemRevenue - itemCost;

        const prodData = productMap.get(item.productId) || {
          id: item.productId,
          name: item.product.name,
          sku: item.product.sku,
          quantitySold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          currentStock: item.product.stock,
          lastSold: sale.createdAt,
        };

        prodData.quantitySold += item.quantity;
        prodData.revenue += itemRevenue;
        prodData.cost += itemCost;
        prodData.profit += itemProfit;
        prodData.lastSold = sale.createdAt;
        productMap.set(item.productId, prodData);
      });
    });

    const productData = Array.from(productMap.values()).map(prod => ({
      ...prod,
      profitMargin: prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0,
      averagePrice: prod.quantitySold > 0 ? prod.revenue / prod.quantitySold : 0
    }));

    
    productData.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'quantity':
          return b.quantitySold - a.quantitySold;
        case 'profit':
          return b.profit - a.profit;
        default:
          return 0;
      }
    });

    res.json(productData);
  } catch (error) {
    console.error('Error fetching product report:', error);
    res.status(500).json({ error: 'Failed to fetch product report' });
  }
});

module.exports = router;

