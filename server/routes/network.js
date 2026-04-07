const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// GET /api/network/telemetry - Get all nodes and global health
router.get('/telemetry', authMiddleware, async (req, res) => {
    try {
        // Fetch all branches as nodes
        const branchesResult = await query(`
            SELECT b.id, b.name, b.status, b.is_busy, b.latitude, b.longitude, v.name as vendor_name, v.name as supermarket_name
            FROM branches b
            LEFT JOIN vendors v ON b.vendor_id = v.id
        `);

        // Addis bounds for projection (approximate)
        const bounds = {
            lat: { min: 8.85, max: 9.10 },
            lng: { min: 38.65, max: 38.90 }
        };

        const nodes = branchesResult.rows.map((branch, index) => {
            // Project lat/lng to 1000x600 SVG space
            // If lat/lng missing, use a more spread out fallback based on index/random
            let x, y;

            if (branch.latitude && branch.longitude) {
                // Use almost the full width/height with safe margins
                x = ((branch.longitude - bounds.lng.min) / (bounds.lng.max - bounds.lng.min)) * 1200 - 100;
                y = 600 - (((branch.latitude - bounds.lat.min) / (bounds.lat.max - bounds.lat.min)) * 800 - 100);
            } else {
                // Fallback: Use a large spiral or randomized edge distribution
                const angle = (index / (branchesResult.rows.length || 1)) * Math.PI * 2;
                const radius = 350 + Math.random() * 150; // Massively increased radius
                x = 500 + Math.cos(angle) * (radius * 1.8);
                y = 300 + Math.sin(angle) * radius;
            }

            // Clamping for safety
            x = Math.max(50, Math.min(950, x));
            y = Math.max(50, Math.min(550, y));

            let status = 'OPTIMAL';
            if (branch.status.toUpperCase() === 'CLOSED' || branch.status.toUpperCase() === 'SUSPENDED') {
                status = 'KILLED';
            } else if (branch.is_busy) {
                status = 'BUSY';
            }

            return {
                id: branch.id,
                name: branch.name,
                supermarket: branch.vendor_name,
                status,
                x: Math.round(x),
                y: Math.round(y)
            };
        });

        // Recent alerts from audit logs or status changes
        const alertsResult = await query(`
            SELECT action, severity, created_at 
            FROM audit_logs 
            WHERE severity IN ('high', 'critical') 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        // Global health stats (simulated or derived)
        const health = {
            latency: Math.floor(Math.random() * 20) + 10 + 'ms',
            congestion: branchesResult.rows.filter(b => b.is_busy).length > (branchesResult.rows.length / 2) ? 'High' : 'Nominal',
            firewall: 'Optimal',
            flux: '98.5%'
        };

        res.json({
            success: true,
            data: {
                nodes,
                health,
                alerts: alertsResult.rows
            }
        });

    } catch (error) {
        console.error('Error fetching network telemetry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch network telemetry'
        });
    }
});

module.exports = router;
