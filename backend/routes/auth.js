/* ============================================
   Authentication Routes
   ============================================
   
   📚 LEARNING: Express Routes
   
   Routes define the API endpoints:
   - POST /api/auth/login - User login
   - POST /api/auth/register - User registration
   - GET /api/auth/me - Get current user
   
   ============================================ */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { generateToken, authenticateToken } = require('../middleware/auth');

// ============================================
// POST /api/auth/login
// ============================================
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user info (without password)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// POST /api/auth/register (Admin creates customers)
// ============================================
router.post('/register', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name required'),
  body('phone').notEmpty().withMessage('Phone required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, phone, role = 'customer', address, city } = req.body;

  try {
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const result = db.prepare(`
      INSERT INTO users (email, password, name, phone, role, address, city)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(email, hashedPassword, name, phone, role, address || null, city || null);

    // Generate token
    const user = { id: result.lastInsertRowid, email, name, role };
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        name,
        role,
        phone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// GET /api/auth/me - Get current user
// ============================================
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, name, phone, role, address, city, created_at 
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PUT /api/auth/password - Change password
// ============================================
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Get user with password
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);

    // Verify current password
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, req.user.id);

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

