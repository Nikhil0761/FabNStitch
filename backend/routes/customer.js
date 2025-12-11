/* ============================================
   Customer Routes
   ============================================
   
   Routes for customer-specific operations:
   - GET /api/customer/dashboard - Dashboard data
   - GET /api/customer/profile - Get profile
   - PUT /api/customer/profile - Update profile
   - GET /api/customer/measurements - Get measurements
   - GET /api/customer/orders - Get customer's orders
   
   ============================================ */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken, requireCustomer } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// GET /api/customer/dashboard - Dashboard summary
// ============================================
router.get('/dashboard', (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const user = db.prepare(`
      SELECT id, name, email, phone, city FROM users WHERE id = ?
    `).get(userId);

    // Get order counts by status
    const orderStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('pending', 'confirmed', 'stitching', 'finishing', 'quality_check') THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('ready', 'shipped') THEN 1 ELSE 0 END) as ready
      FROM orders WHERE user_id = ?
    `).get(userId);

    // Get recent orders
    const recentOrders = db.prepare(`
      SELECT 
        o.id, o.order_id, o.style, o.status, o.price, o.created_at, o.estimated_delivery,
        f.name as fabric_name, f.color as fabric_color
      FROM orders o
      LEFT JOIN fabrics f ON o.fabric_id = f.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT 5
    `).all(userId);

    // Check if measurements exist
    const hasMeasurements = db.prepare(`
      SELECT id FROM measurements WHERE user_id = ?
    `).get(userId);

    // Get open support tickets
    const openTickets = db.prepare(`
      SELECT COUNT(*) as count FROM tickets 
      WHERE user_id = ? AND status IN ('open', 'in_progress')
    `).get(userId);

    res.json({
      user,
      stats: {
        totalOrders: orderStats.total || 0,
        activeOrders: orderStats.active || 0,
        completedOrders: orderStats.completed || 0,
        readyOrders: orderStats.ready || 0,
        openTickets: openTickets.count || 0
      },
      recentOrders,
      hasMeasurements: !!hasMeasurements
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/customer/profile - Get full profile
// ============================================
router.get('/profile', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, name, phone, address, city, created_at 
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PUT /api/customer/profile - Update profile
// ============================================
router.put('/profile', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, phone, address, city } = req.body;

  try {
    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, phone, address, city, req.user.id);

    // Get updated user
    const user = db.prepare(`
      SELECT id, email, name, phone, address, city FROM users WHERE id = ?
    `).get(req.user.id);

    res.json({ message: 'Profile updated', user });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/customer/measurements - Get measurements
// ============================================
router.get('/measurements', (req, res) => {
  try {
    const measurements = db.prepare(`
      SELECT * FROM measurements WHERE user_id = ?
    `).get(req.user.id);

    if (!measurements) {
      return res.json({ measurements: null, message: 'No measurements recorded yet' });
    }

    res.json({ measurements });

  } catch (error) {
    console.error('Measurements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/customer/orders - Get all orders
// ============================================
router.get('/orders', (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        o.id, o.order_id, o.style, o.status, o.price, o.created_at, 
        o.estimated_delivery, o.delivery_address, o.notes,
        f.name as fabric_name, f.color as fabric_color, f.material as fabric_material,
        t.name as tailor_name
      FROM orders o
      LEFT JOIN fabrics f ON o.fabric_id = f.id
      LEFT JOIN users t ON o.tailor_id = t.id
      WHERE o.user_id = ?
    `;

    const params = [req.user.id];

    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = db.prepare(query).all(...params);

    res.json({ orders });

  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/customer/orders/:id - Get single order with history
// ============================================
router.get('/orders/:id', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT 
        o.*,
        f.name as fabric_name, f.color as fabric_color, 
        f.material as fabric_material, f.price as fabric_price,
        t.name as tailor_name, t.phone as tailor_phone,
        m.chest, m.waist, m.shoulders, m.arm_length, m.jacket_length, m.neck
      FROM orders o
      LEFT JOIN fabrics f ON o.fabric_id = f.id
      LEFT JOIN users t ON o.tailor_id = t.id
      LEFT JOIN measurements m ON o.user_id = m.user_id
      WHERE o.order_id = ? AND o.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
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
    console.error('Order detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/customer/tickets - Get support tickets
// ============================================
router.get('/tickets', (req, res) => {
  try {
    const tickets = db.prepare(`
      SELECT * FROM tickets 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ tickets });

  } catch (error) {
    console.error('Tickets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/customer/tickets - Create support ticket
// ============================================
router.post('/tickets', [
  body('subject').notEmpty().withMessage('Subject required'),
  body('message').notEmpty().withMessage('Message required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { subject, message, priority = 'medium' } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO tickets (user_id, subject, message, priority)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, subject, message, priority);

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Ticket created', ticket });

  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

