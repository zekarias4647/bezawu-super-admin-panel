const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// GET /api/vendors - Get all vendors with basic stats
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                v.*,
                COUNT(DISTINCT b.id) as branch_count,
                COALESCE(SUM(o.total_price), 0) as total_revenue,
                COUNT(DISTINCT o.customer_id) as total_customers
            FROM vendors v
            LEFT JOIN branches b ON v.id = b.vendor_id
            LEFT JOIN orders o ON b.id = o.branch_id AND o.status NOT ILIKE 'CANCELLED'
            GROUP BY v.id
            ORDER BY v.created_at DESC
        `);

        // Get bank accounts for each vendor to match the UI interface structure
        const vendors = await Promise.all(result.rows.map(async (v) => {
            const bankAccounts = await query('SELECT * FROM bank_accounts WHERE vendor_id = $1', [v.id]);

            // Also need inventory count - summing up products in all categories of this vendor
            const inventoryResult = await query(`
                SELECT COUNT(*) as product_count
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE c.vendor_id = $1
            `, [v.id]);

            return {
                ...v,
                branches: parseInt(v.branch_count),
                total_revenue: parseFloat(v.total_revenue),
                total_customers: parseInt(v.total_customers),
                total_inventory: parseInt(inventoryResult.rows[0].product_count),
                bankAccounts: bankAccounts.rows,
                reg_code: v.id, // Using ID as reg_code for now
                business_type: v.business_type // Ensure this is returned
            };
        }));

        res.json({
            success: true,
            data: vendors
        });

    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vendors'
        });
    }
});

// GET /api/vendors/:id - Get detailed vendor info
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM vendors WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        const vendor = result.rows[0];
        const bankAccounts = await query('SELECT * FROM bank_accounts WHERE vendor_id = $1', [id]);

        // Basic stats
        const statsResult = await query(`
            SELECT 
                COUNT(DISTINCT b.id) as branch_count,
                COALESCE(SUM(o.total_price), 0) as total_revenue,
                COUNT(DISTINCT o.customer_id) as total_customers
            FROM branches b
            LEFT JOIN orders o ON b.id = o.branch_id AND o.status NOT ILIKE 'CANCELLED'
            WHERE b.vendor_id = $1
        `, [id]);

        const inventoryResult = await query(`
            SELECT COUNT(*) as product_count
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE c.vendor_id = $1
        `, [id]);

        res.json({
            success: true,
            data: {
                ...vendor,
                branches: parseInt(statsResult.rows[0].branch_count),
                total_revenue: parseFloat(statsResult.rows[0].total_revenue),
                total_customers: parseInt(statsResult.rows[0].total_customers),
                total_inventory: parseInt(inventoryResult.rows[0].product_count),
                bankAccounts: bankAccounts.rows,
                reg_code: vendor.id,
                business_type: vendor.business_type
            }
        });

    } catch (error) {
        console.error('Error fetching vendor detail:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vendor details'
        });
    }
});

// POST /api/vendors - Create a new vendor
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Extract fields from request body
        const {
            name,
            email,
            phone,
            tin,
            reg_code,
            business_type, // Critical field
            description,
            website,
            logo,
            vat_cert,
            business_license,
            status = 'PENDING'
        } = req.body;

        if (!name || !business_type) {
            return res.status(400).json({ success: false, message: 'Name and Business Type are required' });
        }

        // Insert into vendors table
        // Note: adjust columns based on actual DB schema. Assuming columns match input names.
        const result = await query(`
            INSERT INTO vendors (
                name, email, phone, tin, reg_code, business_type, 
                description, website, logo, vat_cert, business_license, status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
            RETURNING *
        `, [
            name, email, phone, tin, reg_code, business_type,
            description, website, logo, vat_cert, business_license, status
        ]);

        res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create vendor'
        });
    }
});


// PUT /api/vendors/:id - Update vendor details
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, email, phone, tin, business_type,
            description, website, logo, vat_cert, business_license, status
        } = req.body;

        const result = await query(`
            UPDATE vendors SET 
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                phone = COALESCE($3, phone),
                tin = COALESCE($4, tin),
                business_type = COALESCE($5, business_type),
                description = COALESCE($6, description),
                website = COALESCE($7, website),
                logo = COALESCE($8, logo),
                vat_cert = COALESCE($9, vat_cert),
                business_license = COALESCE($10, business_license),
                status = COALESCE($11, status),
                updated_at = NOW()
            WHERE id = $12
            RETURNING *
        `, [
            name, email, phone, tin, business_type,
            description, website, logo, vat_cert, business_license, status, id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.json({
            success: true,
            message: 'Vendor updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vendor'
        });
    }
});

// PATCH /api/vendors/:id/status - Update vendor status
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const result = await query(
            'UPDATE vendors SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vendor status'
        });
    }
});

module.exports = router;
