/* ============================================
   Tailor Routes
   ============================================
   
   Routes for tailor-specific operations:
   - GET /api/tailor/dashboard - Dashboard data
   - GET /api/tailor/orders - Get assigned orders
   - GET /api/tailor/orders/:id - Get single order details
   - PUT /api/tailor/orders/:id/status - Update order status
   
   ============================================ */

const express = require('express');
const router = express.Router();
const { db } = require('../database/init');
const { authenticateToken, requireTailor } = require('../middleware/auth');

// All routes require authentication and tailor role
router.use(authenticateToken);
router.use(requireTailor);

// ============================================
// GET /api/tailor/dashboard - Dashboard summary
// ============================================
router.get('/dashboard', (req, res) => {
  try {
    const tailorId = req.user.id;

    // Get tailor info
    const tailor = db.prepare(`
      SELECT id, name, email, phone, city FROM users WHERE id = ?
    `).get(tailorId);

    // Get order counts by status
    const orderStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'stitching' THEN 1 ELSE 0 END) as stitching,
        SUM(CASE WHEN status = 'finishing' THEN 1 ELSE 0 END) as finishing,
        SUM(CASE WHEN status = 'quality_check' THEN 1 ELSE 0 END) as quality_check,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
      FROM orders WHERE tailor_id = ?
    `).get(tailorId);

    // Get pending orders (assigned but not completed)
    const pendingOrders = db.prepare(`
      SELECT 
        o.id, o.order_id, o.style, o.status, o.price, o.created_at, o.estimated_delivery,
        f.name as fabric_name, f.color as fabric_color, f.material as fabric_material,
        u.name as customer_name, u.phone as customer_phone
      FROM orders o
      LEFT JOIN fabrics f ON o.fabric_id = f.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.tailor_id = ? AND o.status NOT IN ('delivered', 'cancelled')
      ORDER BY 
        CASE o.status 
          WHEN 'confirmed' THEN 1
          WHEN 'stitching' THEN 2
          WHEN 'finishing' THEN 3
          WHEN 'quality_check' THEN 4
          WHEN 'ready' THEN 5
          ELSE 6
        END,
        o.estimated_delivery ASC
      LIMIT 10
    `).all(tailorId);

    // Get today's work count
    const today = new Date().toISOString().split('T')[0];
    const todayStats = db.prepare(`
      SELECT COUNT(*) as count FROM order_status_history 
      WHERE updated_by = ? AND DATE(created_at) = ?
    `).get(tailorId, today);

    res.json({
      tailor,
      stats: {
        totalOrders: orderStats.total || 0,
        confirmed: orderStats.confirmed || 0,
        stitching: orderStats.stitching || 0,
        finishing: orderStats.finishing || 0,
        qualityCheck: orderStats.quality_check || 0,
        ready: orderStats.ready || 0,
        delivered: orderStats.delivered || 0,
        todayUpdates: todayStats.count || 0
      },
      pendingOrders
    });

  } catch (error) {
    console.error('Tailor dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/tailor/orders - Get all assigned orders
// ============================================
router.get('/orders', (req, res) => {
  try {
    const { status } = req.query;
    const tailorId = req.user.id;
    
    let query = `
      SELECT 
        o.id, o.order_id, o.style, o.status, o.price, o.created_at, 
        o.estimated_delivery, o.delivery_address, o.notes,
        f.name as fabric_name, f.color as fabric_color, f.material as fabric_material,
        u.name as customer_name, u.phone as customer_phone, u.email as customer_email
      FROM orders o
      LEFT JOIN fabrics f ON o.fabric_id = f.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.tailor_id = ?
    `;

    const params = [tailorId];

    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ` ORDER BY 
      CASE o.status 
        WHEN 'confirmed' THEN 1
        WHEN 'stitching' THEN 2
        WHEN 'finishing' THEN 3
        WHEN 'quality_check' THEN 4
        WHEN 'ready' THEN 5
        WHEN 'shipped' THEN 6
        ELSE 7
      END,
      o.estimated_delivery ASC`;

    const orders = db.prepare(query).all(...params);

    res.json({ orders });

  } catch (error) {
    console.error('Tailor orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/tailor/orders/:id - Get single order with details
// ============================================
router.get('/orders/:id', (req, res) => {
  try {
    const tailorId = req.user.id;
    
    const order = db.prepare(`
      SELECT 
        o.*,
        f.name as fabric_name, f.color as fabric_color, 
        f.material as fabric_material, f.price as fabric_price,
        u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
        u.address as customer_address, u.city as customer_city,
        m.chest, m.waist, m.shoulders, m.arm_length, m.jacket_length, m.neck, m.notes as measurement_notes
      FROM orders o
      LEFT JOIN fabrics f ON o.fabric_id = f.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN measurements m ON o.user_id = m.user_id
      WHERE o.order_id = ? AND o.tailor_id = ?
    `).get(req.params.id, tailorId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not assigned to you' });
    }

    // Get status history
    const history = db.prepare(`
      SELECT 
        h.status, h.notes, h.created_at,
        u.name as updated_by_name
      FROM order_status_history h
      LEFT JOIN users u ON h.updated_by = u.id
      WHERE h.order_id = ?
      ORDER BY h.created_at DESC
    `).all(order.id);

    res.json({ order, history });

  } catch (error) {
    console.error('Tailor order detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PUT /api/tailor/orders/:id/status - Update order status
// ============================================
router.put('/orders/:id/status', (req, res) => {
  try {
    const tailorId = req.user.id;
    const { status, notes } = req.body;

    // Valid status transitions for tailor
    const validStatuses = ['stitching', 'finishing', 'quality_check', 'ready'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Tailor can only set: stitching, finishing, quality_check, ready' 
      });
    }

    // Check if order exists and is assigned to this tailor
    const order = db.prepare(`
      SELECT id, status FROM orders WHERE order_id = ? AND tailor_id = ?
    `).get(req.params.id, tailorId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not assigned to you' });
    }

    // Update order status
    db.prepare(`
      UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, order.id);

    // Add to status history
    db.prepare(`
      INSERT INTO order_status_history (order_id, status, notes, updated_by)
      VALUES (?, ?, ?, ?)
    `).run(order.id, status, notes || null, tailorId);

    // Get updated order
    const updatedOrder = db.prepare(`
      SELECT 
        o.*, u.name as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(order.id);

    res.json({ 
      message: 'Order status updated successfully',
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/tailor/profile - Get tailor profile
// ============================================
router.get('/profile', (req, res) => {
  try {
    const tailor = db.prepare(`
      SELECT id, email, name, phone, address, city, created_at 
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!tailor) {
      return res.status(404).json({ error: 'Tailor not found' });
    }

    // Get performance stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_completed,
        COUNT(DISTINCT DATE(updated_at)) as active_days
      FROM orders 
      WHERE tailor_id = ? AND status = 'delivered'
    `).get(req.user.id);

    res.json({ tailor, stats });

  } catch (error) {
    console.error('Tailor profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


