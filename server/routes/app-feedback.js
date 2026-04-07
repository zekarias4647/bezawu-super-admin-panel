const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// GET /api/app-feedback - Get all app feedback
router.get('/', authMiddleware, async (req, res) => {
    try {
        const sql = 'SELECT * FROM app_feedback ORDER BY created_at DESC';
        const result = await query(sql);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching app feedback:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
