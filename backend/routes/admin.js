import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

/* ============================================
   GET DASHBOARD STATS
============================================ */
router.get("/dashboard", authenticateToken, adminOnly, (req, res) => {
  // Get counts for various entities
  db.query("SELECT COUNT(*) as total FROM users WHERE role = 'customer'", [], (err, customerCount) => {
    if (err) return res.status(500).json({ error: "Database error" });

    db.query("SELECT COUNT(*) as total FROM users WHERE role = 'tailor'", [], (err, tailorCount) => {
      if (err) return res.status(500).json({ error: "Database error" });

      db.query("SELECT COUNT(*) as total FROM orders", [], (err, orderCount) => {
        if (err) return res.status(500).json({ error: "Database error" });

        db.query(`
          SELECT 
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
            SUM(CASE WHEN status = 'stitching' THEN 1 ELSE 0 END) as stitching,
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
            SUM(price) as totalRevenue
          FROM orders
        `, [], (err, orderStats) => {
          if (err) return res.status(500).json({ error: "Database error" });

          db.query("SELECT COUNT(*) as total FROM tickets WHERE status = 'open'", [], (err, ticketCount) => {
            if (err) return res.status(500).json({ error: "Database error" });

            res.json({
              customers: customerCount[0].total,
              tailors: tailorCount[0].total,
              orders: orderCount[0].total,
              openTickets: ticketCount[0].total,
              orderStats: orderStats[0],
            });
          });
        });
      });
    });
  });
});

/* ============================================
   GET ALL CUSTOMERS
============================================ */
router.get("/customers", authenticateToken, adminOnly, (req, res) => {
  db.query(
    `SELECT id, name, email, phone, city, created_at 
     FROM users 
     WHERE role = 'customer' 
     ORDER BY created_at DESC`,
    [],
    (err, customers) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ customers });
    }
  );
});

/* ============================================
   GET ALL TAILORS
============================================ */
router.get("/tailors", authenticateToken, adminOnly, (req, res) => {
  db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.city, u.created_at,
            COUNT(o.id) as total_orders
     FROM users u
     LEFT JOIN orders o ON u.id = o.tailor_id
     WHERE u.role = 'tailor'
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    [],
    (err, tailors) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ tailors });
    }
  );
});

/* ============================================
   GET ALL ORDERS
============================================ */
router.get("/orders", authenticateToken, adminOnly, (req, res) => {
  db.query(
    `SELECT 
      o.id,
      o.order_id,
      o.style,
      o.status,
      o.price,
      o.created_at,
      o.estimated_delivery,
      u.name as customer_name,
      u.email as customer_email,
      t.name as tailor_name,
      f.name as fabric_name,
      f.color as fabric_color
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN users t ON o.tailor_id = t.id
    LEFT JOIN fabrics f ON o.fabric_id = f.id
    ORDER BY o.created_at DESC`,
    [],
    (err, orders) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ orders });
    }
  );
});

/* ============================================
   ASSIGN TAILOR TO ORDER
============================================ */
router.put("/orders/:orderId/assign-tailor", authenticateToken, adminOnly, (req, res) => {
  const { orderId } = req.params;
  const { tailorId } = req.body;

  // First get the order database ID
  db.query(
    "SELECT id FROM orders WHERE order_id = ?",
    [orderId],
    (err, orders) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!orders.length) return res.status(404).json({ error: "Order not found" });

      const order = orders[0];

      db.query(
        "UPDATE orders SET tailor_id = ?, status = 'confirmed' WHERE id = ?",
        [tailorId, order.id],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Database error" });

          // Add history entry
          db.query(
            "INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, 'confirmed', 'Order confirmed and assigned to tailor', ?)",
            [order.id, req.user.id],
            (err) => {
              if (err) console.error("History log failed", err);
              res.json({ message: "Tailor assigned successfully" });
            }
          );
        }
      );
    }
  );
});

/* ============================================
   UPDATE ORDER STATUS
============================================ */
router.put("/orders/:orderId/status", authenticateToken, adminOnly, (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;

  db.query(
    "SELECT id FROM orders WHERE order_id = ?",
    [orderId],
    (err, orders) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!orders.length) return res.status(404).json({ error: "Order not found" });

      const order = orders[0];

      db.query(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, order.id],
        (err) => {
          if (err) return res.status(500).json({ error: "Update failed" });

          // Add history entry
          db.query(
            "INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, ?, ?, ?)",
            [order.id, status, notes || `Status updated to ${status} by admin`, req.user.id],
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
   GET ALL SUPPORT TICKETS
============================================ */
router.get("/tickets", authenticateToken, adminOnly, (req, res) => {
  db.query(
    `SELECT 
      t.id,
      t.subject,
      t.message,
      t.status,
      t.priority,
      t.created_at,
      u.name as user_name,
      u.email as user_email
    FROM tickets t
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC`,
    [],
    (err, tickets) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ tickets });
    }
  );
});

/* ============================================
   GET ALL LEADS
============================================ */
router.get("/leads", authenticateToken, adminOnly, (req, res) => {
  db.query(
    `SELECT 
      id,
      name,
      email,
      phone,
      company,
      need,
      status,
      notes,
      created_at
    FROM leads
    ORDER BY created_at DESC`,
    [],
    (err, leads) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ leads });
    }
  );
});

/* ============================================
   UPDATE LEAD STATUS
============================================ */
router.put("/leads/:leadId", authenticateToken, adminOnly, (req, res) => {
  const { leadId } = req.params;
  const { status, notes } = req.body;

  db.query(
    "UPDATE leads SET status = ?, notes = ? WHERE id = ?",
    [status, notes || null, leadId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Lead not found" });

      res.json({ message: "Lead updated successfully" });
    }
  );
});

/* ============================================
   UPDATE TICKET STATUS
============================================ */
router.put("/tickets/:ticketId", authenticateToken, adminOnly, (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body;

  db.query(
    "UPDATE tickets SET status = ? WHERE id = ?",
    [status, ticketId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Ticket not found" });

      res.json({ message: "Ticket updated successfully" });
    }
  );
});

/* ============================================
   CREATE ORDER
============================================ */
router.post("/create-order", authenticateToken, adminOnly, (req, res) => {
  const {
    customer_id,
    style,
    fabric_name,
    fabric_color,
    price,
    chest,
    waist,
    shoulders,
    arm_length,
    jacket_length,
    neck,
  } = req.body;

  const orderId = `ORD-${Date.now()}`;

  db.query(
    `INSERT INTO orders
     (order_id, user_id, style, status, price, fabric_name, fabric_color)
     VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
    [orderId, customer_id, style, price, fabric_name, fabric_color],
    (err, orderResult) => {
      if (err) return res.status(500).json({ error: "Order creation failed" });

      // Insert or update measurements
      db.query(
        `INSERT INTO measurements
         (user_id, chest, waist, shoulders, arm_length, jacket_length, neck)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           chest = ?, waist = ?, shoulders = ?, arm_length = ?, jacket_length = ?, neck = ?`,
        [customer_id, chest, waist, shoulders, arm_length, jacket_length, neck,
         chest, waist, shoulders, arm_length, jacket_length, neck],
        (err) => {
          if (err) console.error("Measurements insert failed", err);

          // Add initial status history
          db.query(
            "INSERT INTO order_status_history (order_id, status, notes, updated_by) VALUES (?, 'pending', 'Order created by admin', ?)",
            [orderResult.insertId, req.user.id],
            (err) => {
              if (err) console.error("History log failed", err);
              res.json({ message: "Order created successfully", order_id: orderId });
            }
          );
        }
      );
    }
  );
});

/* ============================================
   CREATE CUSTOMER
============================================ */
router.post("/create-customer", authenticateToken, adminOnly, (req, res) => {
  const { email, password, name, phone, address, city } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  // Check if email already exists
  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    (err, existing) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create customer
      db.query(
        `INSERT INTO users (email, password, name, phone, address, city, role)
         VALUES (?, ?, ?, ?, ?, ?, 'customer')`,
        [email, hashedPassword, name, phone, address, city],
        (err, result) => {
          if (err) {
            console.error("Customer creation error:", err);
            return res.status(500).json({ error: "Customer creation failed" });
          }

          res.status(201).json({
            message: "Customer created successfully",
            customer: {
              id: result.insertId,
              name,
              email,
              phone,
              address,
              city,
              role: "customer",
            },
          });
        }
      );
    }
  );
});

/* ============================================
   CREATE TAILOR
============================================ */
router.post("/create-tailor", authenticateToken, adminOnly, (req, res) => {
  const { email, password, name, phone, address, city } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  // Check if email already exists
  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    (err, existing) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create tailor
      db.query(
        `INSERT INTO users (email, password, name, phone, address, city, role)
         VALUES (?, ?, ?, ?, ?, ?, 'tailor')`,
        [email, hashedPassword, name, phone, address, city],
        (err, result) => {
          if (err) {
            console.error("Tailor creation error:", err);
            return res.status(500).json({ error: "Tailor creation failed" });
          }

          res.status(201).json({
            message: "Tailor created successfully",
            tailor: {
              id: result.insertId,
              name,
              email,
              phone,
              address,
              city,
              role: "tailor",
            },
          });
        }
      );
    }
  );
});

export default router;
