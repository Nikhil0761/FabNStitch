import express from "express";
import { db } from "../db.js";

const router = express.Router();

/* ============================================
   Public Order Tracking
   GET /api/orders/track/:orderId
============================================ */
router.get("/track/:orderId", (req, res) => {
  const { orderId } = req.params;

  // 1️⃣ Get order details
  db.query(
    `
    SELECT 
      o.id,
      o.order_id,
      o.style,
      o.status,
      o.created_at,
      o.estimated_delivery,
      f.name AS fabric_name,
      f.color AS fabric_color,
      u.name AS customer_name
    FROM orders o
    LEFT JOIN fabrics f ON o.fabric_id = f.id
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.order_id = ?
    `,
    [orderId],
    (err, orders) => {
      if (err) {
        console.error("Order fetch error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (!orders.length) {
        return res.status(404).json({ error: "Order not found" });
      }

      const order = orders[0];

      // 2️⃣ Get order status history
      db.query(
        `
        SELECT 
          h.status,
          h.notes,
          h.created_at
        FROM order_status_history h
        WHERE h.order_id = ?
        ORDER BY h.created_at ASC
        `,
        [order.id],
        (err, history) => {
          if (err) {
            console.error("History fetch error:", err);
            return res.status(500).json({ error: "Server error" });
          }

          res.json({
            order: {
              orderId: order.order_id,
              style: order.style,
              status: order.status,
              fabricName: order.fabric_name,
              fabricColor: order.fabric_color,
              customerName: order.customer_name,
              createdAt: order.created_at,
              estimatedDelivery: order.estimated_delivery,
            },
            history: history.map((h) => ({
              status: h.status,
              notes: h.notes,
              date: h.created_at,
            })),
          });
        }
      );
    }
  );
});

export default router;
