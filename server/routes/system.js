const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// GET /api/system/config - Get all system configurations
router.get('/config', authMiddleware, async (req, res) => {
    try {
        const result = await query('SELECT name, value FROM system');
        const config = {};
        result.rows.forEach(row => {
            config[row.name] = row.value;
        });

        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Error fetching system config:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/system/update - Update a system configuration key
router.post('/update', authMiddleware, async (req, res) => {
    try {
        const { id, name, value } = req.body;

        if ((!id && !name) || value === undefined) {
            return res.status(400).json({ success: false, message: 'ID or Name and value are required' });
        }

        if (id) {
            // Update by ID
            const result = await query(
                'UPDATE system SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [value.toString(), id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: `System configuration with ID ${id} not found` });
            }

            return res.json({ success: true, message: `System configuration ID ${id} updated successfully` });
        }

        // Check if the key exists by name
        const checkResult = await query('SELECT name FROM system WHERE name = $1', [name]);

        if (checkResult.rows.length === 0) {
            // Insert if not exists
            await query(
                'INSERT INTO system (name, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
                [name, value.toString()]
            );
        } else {
            // Update if exists
            await query(
                'UPDATE system SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE name = $2',
                [value.toString(), name]
            );
        }

        res.json({ success: true, message: `System configuration '${name}' updated successfully` });
    } catch (error) {
        console.error('Error updating system config:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
