const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// GET /api/business-types - Get all business types
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await query('SELECT * FROM business_types ORDER BY name ASC');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching business types:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/business-types - Create a new business type
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, config } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        // Validate JSON config if provided
        let configJson = config || {};
        if (typeof config === 'string') {
            try {
                configJson = JSON.parse(config);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid JSON configuration' });
            }
        }

        const result = await query(
            'INSERT INTO business_types (name, description, config) VALUES ($1, $2, $3) RETURNING *',
            [name, description || '', configJson]
        );

        res.json({
            success: true,
            message: 'Business type created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating business type:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// PUT /api/business-types/:id - Update a business type
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, config } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        // Validate JSON config if provided
        let configJson = config || {};
        if (typeof config === 'string') {
            try {
                configJson = JSON.parse(config);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid JSON configuration' });
            }
        }

        const result = await query(
            'UPDATE business_types SET name = $1, description = $2, config = $3 WHERE id = $4 RETURNING *',
            [name, description || '', configJson, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Business type not found' });
        }

        res.json({
            success: true,
            message: 'Business type updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating business type:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// DELETE /api/business-types/:id - Delete a business type
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM business_types WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Business type not found' });
        }

        res.json({
            success: true,
            message: 'Business type deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting business type:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
