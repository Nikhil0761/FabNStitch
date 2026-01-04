import express from "express";
import { db } from "../db.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.js";

const router = express.Router();

/* ============================================
   AUTH + TAILOR ROLE ONLY
============================================ */
router.use(authenticateToken);
router.use(authorizeRoles("tailor"));

/* ============================================
   DASHBOARD
   GET /api/tailor/dashboard
============================================ */
router.get("/dashboard", (req, res) => {
  const tailorId = req.user.id;

  db.query(
    `
    SELECT id, name, email, phone, city, role
    FROM users WHERE id = ?
    `,
    [tailorId],
    (err, tailor) => {
      if (err || !tailor.length)
        return res.status(404).json({ error: "Tailor not found" });

      db.query(
        `
        SELECT
          SUM(status = 'confirmed') AS confirmed,
          SUM(status = 'stitching') AS stitching,
          SUM(status = 'finishing') AS finishing,
          SUM(status = 'quality_check') AS quality_check,
          SUM(status = 'ready') AS ready,
          SUM(status = 'delivered') AS delivered
        FROM orders
        WHERE tailor_id = ?
        `,
        [tailorId],
        (err, stats) => {
          if (err) return res.status(500).json({ error: "Stats error" });

          db.query(
            `
            SELECT 
              o.order_id,
              o.style,
              o.status,
              o.price,
              o.estimated_delivery,
              f.name AS fabric_name,
              f.color AS fabric_color
            FROM orders o
            LEFT JOIN fabrics f ON o.fabric_id = f.id
            WHERE o.tailor_id = ?
              AND o.status NOT IN ('delivered')
            ORDER BY o.estimated_delivery ASC
            `,
            [tailorId],
            (err, pendingOrders) => {
              if (err)
                return res.status(500).json({ error: "Orders error" });

              res.json({
                user: tailor[0],
                stats: stats[0],
                pendingOrders,
              });
            }
          );
        }
      );
    }
  );
});

/* ============================================
   ORDERS (All Active for Tailor)
   GET /api/tailor/orders
============================================ */
router.get("/orders", (req, res) => {
  db.query(
    `
    SELECT 
      o.order_id,
      o.style,
      o.status,
      o.price,
      o.estimated_delivery,
      f.name AS fabric_name,
      f.color AS fabric_color
    FROM orders o
    LEFT JOIN fabrics f ON o.fabric_id = f.id
    WHERE o.tailor_id = ?
    ORDER BY o.estimated_delivery ASC
    `,
    [req.user.id],
    (err, orders) => {
      if (err) return res.status(500).json({ error: "Orders fetch error" });
      res.json({ orders });
    }
  );
});

/* ============================================
   ORDER DETAILS
   GET /api/tailor/orders/:orderId
============================================ */
router.get("/orders/:orderId", (req, res) => {
  const { orderId } = req.params;

  db.query(
    `
    SELECT 
      o.*,
      f.name AS fabric_name,
      f.color AS fabric_color,
      u.name AS customer_name,
      u.phone AS customer_phone
    FROM orders o
    LEFT JOIN fabrics f ON o.fabric_id = f.id
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.order_id = ? AND o.tailor_id = ?
    `,
    [orderId, req.user.id],
    (err, orders) => {
      if (err) return res.status(500).json({ error: "Error fetching order" });
      if (!orders.length) return res.status(404).json({ error: "Order not found" });

      const order = orders[0];

      db.query(
        "SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC",
        [order.id],
        (err, history) => {
          if (err) return res.status(500).json({ error: "Error fetching history" });
          res.json({ order, history });
        }
      );
    }
  );
});

/* ============================================
   UPDATE STATUS
   PUT /api/tailor/orders/:orderId/status
============================================ */
router.put("/orders/:orderId/status", (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;

  // 1. Verify ownership
  db.query(
    "SELECT id, user_id FROM orders WHERE order_id = ? AND tailor_id = ?",
    [orderId, req.user.id],
    (err, orders) => {
      if (err || !orders.length) return res.status(404).json({ error: "Order not found" });
      const order = orders[0];

      // 2. Update status
      db.query(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, order.id],
        (err) => {
          if (err) return res.status(500).json({ error: "Update failed" });

          // 3. Add history entry
          db.query(
            "INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)",
            [order.id, status, notes || `Status updated to ${status}`],
            (err) => {
              if (err) console.error("History log failed", err);
              res.json({ message: "Status updated successfully" });
            }
          );
        }
      );
    }
  );
});

/* ============================================
   PROFILE
   GET /api/tailor/profile
============================================ */
router.get("/profile", (req, res) => {
  db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, users) => {
    if (err) return res.status(500).json({ error: "Profile error" });
    if (!users.length) return res.status(404).json({ error: "User not found" });
    res.json({ user: users[0] });
  });
});

/* ============================================
   UPDATE PROFILE
   PUT /api/tailor/profile
============================================ */
router.put("/profile", (req, res) => {
  const { name, phone, address, city } = req.body;
  db.query(
    "UPDATE users SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?",
    [name, phone, address, city, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });

      // Return updated user
      db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, users) => {
        if (err) return res.status(500).json({ error: "Fetch error" });
        res.json({ user: users[0] });
      });
    }
  );
});

// ============================================
// PUT /api/tailor/profile - Update tailor profile
// ============================================
router.put('/profile', (req, res) => {
  try {
    const { name, phone, address, city } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Update tailor profile
    db.prepare(`
      UPDATE users 
      SET name = ?, phone = ?, address = ?, city = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name.trim(), phone || null, address || null, city || null, req.user.id);

    // Get updated tailor info
    const tailor = db.prepare(`
      SELECT id, email, name, phone, address, city, created_at 
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json({ 
      message: 'Profile updated successfully',
      tailor 
    });

  } catch (error) {
    console.error('Tailor profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


