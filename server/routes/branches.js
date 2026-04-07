const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// GET /api/branches - Get all branches with parent vendor and stats
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                b.*,
                v.name as vendor_name,
                v.name as supermarket_name, -- Keep legacy alias
                COALESCE(SUM(o.total_price), 0) as total_revenue,
                COUNT(DISTINCT o.customer_id) as total_customers
            FROM branches b
            LEFT JOIN vendors v ON b.vendor_id = v.id
            LEFT JOIN orders o ON b.id = o.branch_id AND o.status NOT ILIKE 'CANCELLED'
            GROUP BY b.id, v.name
            ORDER BY b.created_at DESC
        `);

        const branches = await Promise.all(result.rows.map(async (branch) => {
            // Get manager
            const managerResult = await query('SELECT id, name, email, phone, role, status FROM managers WHERE branch_id = $1 LIMIT 1', [branch.id]);

            // Get product count
            const inventoryResult = await query('SELECT COUNT(*) as product_count FROM products WHERE branch_id = $1', [branch.id]);

            return {
                ...branch,
                supermarket_id: branch.vendor_id, // Legacy compatibility
                total_revenue: parseFloat(branch.total_revenue),
                total_customers: parseInt(branch.total_customers),
                product_count: parseInt(inventoryResult.rows[0].product_count),
                manager: managerResult.rows[0] || null,
                products: [],
                opening_hours: branch.opening_hours,
                closing_hours: branch.closing_hours
            };
        }));

        res.json({
            success: true,
            data: branches
        });

    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch branches'
        });
    }
});

// GET /api/branches/:id/products - Get products for a specific branch
router.get('/:id/products', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.branch_id = $1
            LIMIT 50
        `, [id]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching branch products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
});

// PATCH /api/branches/:id/busy - Toggle busy mode
router.patch('/:id/busy', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { is_busy } = req.body;

        const result = await query(
            'UPDATE branches SET is_busy = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [is_busy, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        res.json({
            success: true,
            message: `Busy mode ${is_busy ? 'activated' : 'deactivated'}`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating busy mode:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update busy mode'
        });
    }
});

// PATCH /api/branches/:id/status - Update branch status
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await query(
            'UPDATE branches SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        res.json({
            success: true,
            message: 'Branch status updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating branch status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status'
        });
    }
});

module.exports = router;
