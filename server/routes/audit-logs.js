const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// GET /api/audit-logs - Fetch all audit logs
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { search, severity } = req.query;
        let sql = `
            SELECT 
                al.id, al.action, al.severity, al.created_at, 
                COALESCE(a.full_name, m.name) as admin_name,
                v.name as vendor_name,
                v.name as supermarket_name, -- Alias
                b.name as branch_name
            FROM audit_logs al
            LEFT JOIN admins a ON al.admin_id::text = a.id::text
            LEFT JOIN managers m ON al.admin_id::text = m.id::text
            LEFT JOIN vendors v ON al.vendor_id::text = v.id::text -- Changed supermarket_id to vendor_id
            LEFT JOIN branches b ON al.branch_id::text = b.id::text
        `;
        // Note: Assuming audit_logs table column was also renamed from supermarket_id to vendor_id? 
        // The user said "change the column supermarket_id to vendor_id in every table in the database".

        const params = [];
        const conditions = [];

        if (search) {
            conditions.push(`(al.action ILIKE $${params.length + 1} OR a.full_name ILIKE $${params.length + 1} OR al.id::text ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }

        if (severity && severity !== 'ALL') {
            conditions.push(`al.severity = $${params.length + 1}`);
            params.push(severity);
        }

        if (conditions.length > 0) {
            sql += ` WHERE ` + conditions.join(' AND ');
        }

        sql += ` ORDER BY al.created_at DESC`;

        const result = await query(sql, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
