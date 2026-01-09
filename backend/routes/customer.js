import express from "express";
import { body, validationResult } from "express-validator";
import { db } from "../db.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.js";

const router = express.Router();

/* ============================================
   AUTH + CUSTOMER ROLE ONLY
============================================ */
router.use(authenticateToken);
router.use(authorizeRoles("customer"));

/* ============================================
   DASHBOARD
   GET /api/customer/dashboard
============================================ */
router.get("/dashboard", (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT 
      COUNT(*) AS totalOrders,
      SUM(status IN ('pending','confirmed','stitching','finishing','quality_check')) AS activeOrders,
      SUM(status = 'delivered') AS completedOrders
    FROM orders
    WHERE user_id = ?
    `,
    [userId],
    (err, stats) => {
      if (err) return res.status(500).json({ error: "Stats error" });

      db.query(
        `
        SELECT id, name, email, phone, city, role
        FROM users
        WHERE id = ?
        `,
        [userId],
        (err, users) => {
          if (err || !users.length)
            return res.status(404).json({ error: "User not found" });

          db.query(
            `
            SELECT 
              o.order_id,
              o.style,
              o.status,
              o.price,
              f.name AS fabric_name,
              f.color AS fabric_color
            FROM orders o
            LEFT JOIN fabrics f ON o.fabric_id = f.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
            LIMIT 5
            `,
            [userId],
            (err, recentOrders) => {
              if (err)
                return res.status(500).json({ error: "Orders error" });

              res.json({
                user: users[0],
                stats: stats[0],
                recentOrders,
              });
            }
          );
        }
      );
    }
  );
});

/* ============================================
   CUSTOMER ORDERS
   GET /api/customer/orders
============================================ */
router.get("/orders", (req, res) => {
  db.query(
    `
    SELECT 
      o.*,
      f.name AS fabric_table_name,
      f.color AS fabric_table_color
    FROM orders o
    LEFT JOIN fabrics f ON o.fabric_id = f.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
    `,
    [req.user.id],
    (err, orders) => {
      if (err) return res.status(500).json({ error: "Orders fetch error" });
      res.json({ orders });
    }
  );
});

/* ============================================
   ORDER DETAILS + TIMELINE
   GET /api/customer/orders/:orderId
============================================ */
router.get("/orders/:orderId", (req, res) => {
  const { orderId } = req.params;

  db.query(
    `
    SELECT 
      o.*,
      f.name AS fabric_name,
      f.color AS fabric_color
    FROM orders o
    LEFT JOIN fabrics f ON o.fabric_id = f.id
    WHERE o.order_id = ? AND o.user_id = ?
    `,
    [orderId, req.user.id],
    (err, orders) => {
      if (err) return res.status(500).json({ error: "Order fetch error" });
      if (!orders.length)
        return res.status(404).json({ error: "Order not found" });

      const order = orders[0];

      db.query(
        `
        SELECT status, created_at
        FROM order_status_history
        WHERE order_id = ?
        ORDER BY created_at ASC
        `,
        [order.id],
        (err, history) => {
          if (err)
            return res.status(500).json({ error: "Timeline error" });

          res.json({ order, history });
        }
      );
    }
  );
});

/* ============================================
   MEASUREMENTS (WITH UPDATED DATE)
   GET /api/customer/measurements
============================================ */
router.get("/measurements", (req, res) => {
  db.query(
    "SELECT * FROM measurements WHERE user_id = ?",
    [req.user.id],
    (err, rows) => {
      if (err)
        return res.status(500).json({ error: "Measurements error" });

      if (!rows.length) {
        return res.json({
          measurements: null,
          updated_at: null,
        });
      }

      res.json({
        measurements: rows[0],
        updated_at: rows[0].updated_at,
      });
    }
  );
});

/* ============================================
   PROFILE
   GET /api/customer/profile
============================================ */
router.get("/profile", (req, res) => {
  db.query(
    "SELECT * FROM users WHERE id = ?",
    [req.user.id],
    (err, users) => {
      if (err)
        return res.status(500).json({ error: "Profile error" });
      if (!users.length)
        return res.status(404).json({ error: "User not found" });

      res.json({ user: users[0] });
    }
  );
});

/* ============================================
   UPDATE PROFILE
   PUT /api/customer/profile
============================================ */
router.put("/profile", (req, res) => {
  const { name, phone, address, city } = req.body;

  db.query(
    `
    UPDATE users
    SET name = ?, phone = ?, address = ?, city = ?
    WHERE id = ?
    `,
    [name, phone, address, city, req.user.id],
    (err) => {
      if (err)
        return res.status(500).json({ error: "Update failed" });

      db.query(
        "SELECT * FROM users WHERE id = ?",
        [req.user.id],
        (err, users) => {
          if (err)
            return res.status(500).json({ error: "Fetch error" });
          res.json({ user: users[0] });
        }
      );
    }
  );
});

/* ============================================
   SUPPORT TICKETS
   GET /api/customer/tickets
============================================ */
router.get("/tickets", (req, res) => {
  db.query(
    `
    SELECT *
    FROM tickets
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [req.user.id],
    (err, tickets) => {
      if (err)
        return res.status(500).json({ error: "Tickets fetch error" });
      res.json({ tickets });
    }
  );
});

/* ============================================
   CREATE SUPPORT TICKET
   POST /api/customer/tickets
============================================ */
router.post(
  "/tickets",
  [
    body("subject").notEmpty(),
    body("message").notEmpty(),
    body("priority").isIn(["low", "medium", "high", "urgent"]),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { subject, message, priority } = req.body;

    db.query(
      `
      INSERT INTO tickets (user_id, subject, message, priority)
      VALUES (?, ?, ?, ?)
      `,
      [req.user.id, subject, message, priority],
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Ticket creation failed" });

        db.query(
          "SELECT * FROM tickets WHERE id = ?",
          [result.insertId],
          (err, tickets) => {
            if (err)
              return res.status(500).json({ error: "Fetch error" });
            res.status(201).json({ ticket: tickets[0] });
          }
        );
      }
    );
  }
);

export default router;
