import express from "express";
import { db } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

/* GET all customers */
router.get("/customers", authenticateToken, adminOnly, (req, res) => {
  const customers = db
    .prepare("SELECT id, name, email FROM users WHERE role = 'customer'")
    .all();
  res.json(customers);
});

/* CREATE ORDER */
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

  db.prepare(`
    INSERT INTO orders
    (order_id, customer_id, style, fabric_name, fabric_color, price, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(orderId, customer_id, style, fabric_name, fabric_color, price);

  db.prepare(`
    INSERT INTO measurements
    (customer_id, chest, waist, shoulders, arm_length, jacket_length, neck)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(customer_id, chest, waist, shoulders, arm_length, jacket_length, neck);

  res.json({ message: "Order created", order_id: orderId });
});

export default router;
