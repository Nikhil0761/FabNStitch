/* ============================================
   Authentication Routes (MySQL + ES Modules)
============================================ */

import express from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { db } from "../db.js";
import { generateToken, authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/* ============================================
   POST /api/auth/login
============================================ */
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "DB error" });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const isValid = bcrypt.compareSync(password, user.password);

        if (!isValid) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = generateToken({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        res.json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        });
      }
    );
  }
);

/* ============================================
   POST /api/auth/register
============================================ */
router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("name").notEmpty(),
    body("phone").notEmpty(),
    body("role").isIn(["customer", "tailor"]),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, phone, role } = req.body;

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      (err, existing) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "DB error" });
        }

        if (existing.length > 0) {
          return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        db.query(
          `INSERT INTO users (email, password, name, phone, role)
           VALUES (?, ?, ?, ?, ?)`,
          [email, hashedPassword, name, phone, role],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "Insert failed" });
            }

            const token = generateToken({
              id: result.insertId,
              email,
              role,
            });

            res.status(201).json({
              message: "Registration successful",
              token,
              user: {
                id: result.insertId,
                name,
                email,
                phone,
                role,
              },
            });
          }
        );
      }
    );
  }
);

/* ============================================
   GET /api/auth/me
============================================ */
router.get("/me", authenticateToken, (req, res) => {
  db.query(
    `SELECT id, name, email, phone, role, created_at
     FROM users WHERE id = ?`,
    [req.user.id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user: results[0] });
    }
  );
});

/* ============================================
   PUT /api/auth/password
============================================ */
router.put(
  "/password",
  authenticateToken,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    db.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "DB error" });
        }

        const user = results[0];

        if (!bcrypt.compareSync(currentPassword, user.password)) {
          return res.status(401).json({ error: "Current password incorrect" });
        }

        const hashed = bcrypt.hashSync(newPassword, 10);

        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashed, req.user.id],
          () => res.json({ message: "Password updated successfully" })
        );
      }
    );
  }
);

export default router;
