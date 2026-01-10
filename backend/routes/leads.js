import express from "express";
import { body, validationResult } from "express-validator";
import { db } from "../db.js";

const router = express.Router();

/* ============================================
   CREATE LEAD (Public - No Auth Required)
   POST /api/leads
============================================ */
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("company").optional().trim(),
    body("need").trim().notEmpty().withMessage("Please select your need"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, company, need } = req.body;

    db.query(
      `INSERT INTO leads (name, email, phone, company, need, status)
       VALUES (?, ?, ?, ?, ?, 'new')`,
      [name, email || null, phone, company || null, need],
      (err, result) => {
        if (err) {
          console.error("Lead creation error:", err);
          return res.status(500).json({ error: "Failed to submit. Please try again." });
        }

        res.status(201).json({
          message: "Thank you! We'll contact you soon.",
          lead_id: result.insertId,
        });
      }
    );
  }
);

export default router;
