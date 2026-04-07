const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');
const { getCommissionRate } = require('../utils/systemConfig');

// GET /api/finance/stats - Get global revenue stats
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const statsResult = await query(`
            SELECT 
                SUM(total_price) as total_revenue
            FROM orders 
            WHERE status != 'CANCELLED' AND status != 'cancelled'
        `);

        const totalRevenue = parseFloat(statsResult.rows[0].total_revenue || 0);
        const commissionRate = await getCommissionRate();
        const platformFee = totalRevenue * commissionRate;
        const merchantYield = totalRevenue * (1 - commissionRate);

        res.json({
            success: true,
            data: {
                totalRevenue,
                platformFee,
                merchantYield
            }
        });
    } catch (error) {
        console.error('Error fetching finance stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET /api/finance/payouts - Get pending payouts per vendor
router.get('/payouts', authMiddleware, async (req, res) => {
    try {
        const payoutsResult = await query(`
            SELECT 
                v.id as vendor_id,
                v.name as vendor_name,
                v.name as supermarket_name,
                SUM(o.total_price) as gross_revenue,
                ba.bank_name,
                ba.account_number
            FROM vendors v
            JOIN branches b ON v.id = b.vendor_id
            JOIN orders o ON b.id = o.branch_id
            LEFT JOIN bank_accounts ba ON v.id = ba.vendor_id AND ba.is_primary = true
            WHERE o.status != 'CANCELLED' AND o.status != 'cancelled'
            GROUP BY v.id, v.name, ba.bank_name, ba.account_number
            ORDER BY gross_revenue DESC
        `);

        const commissionRate = await getCommissionRate();
        const payouts = payoutsResult.rows.map(row => ({
            ...row,
            supermarket_id: row.vendor_id, // Legacy alias
            gross_revenue: parseFloat(row.gross_revenue),
            merchant_payout: parseFloat(row.gross_revenue) * (1 - commissionRate)
        }));

        res.json({
            success: true,
            data: payouts
        });
    } catch (error) {
        console.error('Error fetching payouts:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/finance/settle - Authorize global payout
router.post('/settle', authMiddleware, async (req, res) => {
    try {
        // Log this action in audit_logs
        await query(`
            INSERT INTO audit_logs (admin_id, action, severity, created_at)
            VALUES ($1, $2, $3, NOW())
        `, [req.user.id, 'GLOBAL_SETTLEMENT_AUTHORIZED', 'high']);

        res.json({
            success: true,
            message: 'Global settlement initiated successfully'
        });
    } catch (error) {
        console.error('Error in settlement:', error);
        res.status(500).json({ success: false, message: 'Settlement failed' });
    }
});

module.exports = router;
