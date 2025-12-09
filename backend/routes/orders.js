/* ============================================
   Orders Routes
   ============================================
   
   Public and protected order routes:
   - GET /api/orders/track/:orderId - Public order tracking
   
   ============================================ */

const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// ============================================
// GET /api/orders/track/:orderId - Public order tracking
// ============================================
router.get('/track/:orderId', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT 
        o.order_id, o.style, o.status, o.created_at, o.estimated_delivery,
        f.name as fabric_name, f.color as fabric_color,
        u.name as customer_name
      FROM orders o
      LEFT JOIN fabrics f ON o.fabric_id = f.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.order_id = ?
    `).get(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get status history
    const history = db.prepare(`
      SELECT 
        h.status, h.notes, h.created_at
      FROM order_status_history h
      JOIN orders o ON h.order_id = o.id
      WHERE o.order_id = ?
      ORDER BY h.created_at ASC
    `).all(req.params.orderId);

    res.json({ 
      order: {
        orderId: order.order_id,
        style: order.style,
        status: order.status,
        fabricName: order.fabric_name,
        fabricColor: order.fabric_color,
        customerName: order.customer_name,
        createdAt: order.created_at,
        estimatedDelivery: order.estimated_delivery
      },
      history: history.map(h => ({
        status: h.status,
        notes: h.notes,
        date: h.created_at
      }))
    });

  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

