// Simplified Dashboard API routes - works with current database schema
const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');
const { getCommissionRate } = require('../utils/systemConfig');

// GET /api/dashboard/stats - Get main KPI statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Get total revenue from orders
        const revenueResult = await query(`
      SELECT COALESCE(SUM(total_price), 0) as total_revenue
      FROM orders
      WHERE status NOT ILIKE 'CANCELLED'
    `);

        const totalRevenue = parseFloat(revenueResult.rows[0].total_revenue);
        const commissionRate = await getCommissionRate();
        const platformCommission = totalRevenue * commissionRate;

        // Get total users
        const usersResult = await query(`
      SELECT COUNT(*) as total_users
      FROM customers
    `);

        const branchesResult = await query(`
      SELECT COUNT(*) as total_branches
      FROM branches
      WHERE status ILIKE 'ACTIVE'
    `);

        // Get recent revenue (last 30 days)
        const recentRevenueResult = await query(`
      SELECT COALESCE(SUM(total_price), 0) as recent_revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND status NOT ILIKE 'CANCELLED'
    `);

        res.json({
            success: true,
            stats: {
                totalRevenue: totalRevenue.toFixed(2),
                platformCommission: platformCommission.toFixed(2),
                totalUsers: parseInt(usersResult.rows[0].total_users),
                totalBranches: parseInt(branchesResult.rows[0].total_branches),
                recentRevenue: parseFloat(recentRevenueResult.rows[0].recent_revenue).toFixed(2),
                revenueGrowth: '+18.4%', // Placeholder - can be calculated with more data
                commissionGrowth: '+12.2%', // Placeholder
                userGrowth: '+4.8%' // Placeholder
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
});

// GET /api/dashboard/revenue-chart - Get monthly revenue data for chart
router.get('/revenue-chart', authMiddleware, async (req, res) => {
    try {
        const result = await query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        EXTRACT(MONTH FROM created_at) as month_num,
        COALESCE(SUM(total_price), 0) as revenue,
        COALESCE(SUM(total_price * (SELECT value::numeric / 100 FROM system WHERE name = 'commission_rate')), 0) as commission,
        COUNT(*) as order_count
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '7 months'
        AND status NOT ILIKE 'CANCELLED'
      GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
      ORDER BY month_num
    `);

        const avgRevenue = result.rows.length > 0
            ? result.rows.reduce((sum, row) => sum + parseFloat(row.revenue), 0) / result.rows.length
            : 0;
        const expectedBase = avgRevenue * 1.1;

        const chartData = result.rows.map(row => ({
            month: row.month,
            revenue: parseFloat(row.revenue).toFixed(0),
            expected: expectedBase.toFixed(0),
            commission: parseFloat(row.commission).toFixed(0),
            orders: parseInt(row.order_count)
        }));

        res.json({
            success: true,
            data: chartData
        });

    } catch (error) {
        console.error('Revenue chart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue chart data'
        });
    }
});

// GET /api/dashboard/top-vendors - Get top performing vendors (formerly supermarkets)
router.get('/top-supermarkets', authMiddleware, async (req, res) => {
    try {
        const result = await query(`
      SELECT 
        s.id,
        s.name,
        s.logo,
        COUNT(DISTINCT b.id) as branch_count,
        COALESCE(SUM(o.total_price), 0) as total_revenue,
        COUNT(o.id) as order_count
      FROM vendors s
      LEFT JOIN branches b ON s.id = b.vendor_id AND b.status ILIKE 'ACTIVE'
      LEFT JOIN orders o ON b.id = o.branch_id AND o.status NOT ILIKE 'CANCELLED'
      WHERE s.status ILIKE 'ACTIVE'
      GROUP BY s.id, s.name, s.logo
      ORDER BY total_revenue DESC, s.name ASC
      LIMIT 5
    `);

        const totalRevenue = result.rows.reduce((sum, s) => sum + parseFloat(s.total_revenue), 0);

        const vendorsData = result.rows.map((vendor, index) => {
            const revenue = parseFloat(vendor.total_revenue);
            const impactPercentage = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(0) : '0';

            return {
                name: vendor.name,
                revenue: revenue.toFixed(2),
                branches: parseInt(vendor.branch_count),
                growth: index === 0 ? '+14.2%' : index === 1 ? '+11.8%' : index === 2 ? '-2.4%' : '+22.1%', // Placeholder
                impact: parseInt(impactPercentage),
                orders: parseInt(vendor.order_count),
                color: getColorForIndex(index)
            };
        });

        res.json({
            success: true,
            data: vendorsData
        });

    } catch (error) {
        console.error('Top vendors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top vendors'
        });
    }
});

// GET /api/dashboard/top-products - Get top product categories
router.get('/top-products', authMiddleware, async (req, res) => {
    try {
        const result = await query(`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT p.id) as product_count,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_sales
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT ILIKE 'CANCELLED'
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC
      LIMIT 5
    `);

        const totalSales = result.rows.reduce((sum, row) => sum + parseFloat(row.total_sales), 0);

        const productData = result.rows.map((row, index) => ({
            name: row.name,
            value: totalSales > 0 ? ((parseFloat(row.total_sales) / totalSales) * 100).toFixed(0) : '0',
            sales: parseFloat(row.total_sales).toFixed(2),
            productCount: parseInt(row.product_count),
            color: getColorForIndex(index)
        }));

        res.json({
            success: true,
            data: productData
        });

    } catch (error) {
        console.error('Top products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top products'
        });
    }
});

// Helper function to get consistent colors
function getColorForIndex(index) {
    const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#06b6d4', '#f43f5e'];
    return colors[index % colors.length];
}

module.exports = router;
