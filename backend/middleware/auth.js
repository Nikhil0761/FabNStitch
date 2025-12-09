/* ============================================
   Authentication Middleware
   ============================================
   
   📚 LEARNING: JWT Authentication
   
   JWT (JSON Web Token) is a way to securely transmit
   information between parties as a JSON object.
   
   Flow:
   1. User logs in with email/password
   2. Server creates JWT token with user info
   3. Client stores token and sends it with each request
   4. Server verifies token on protected routes
   
   ============================================ */

const jwt = require('jsonwebtoken');

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'fabnstitch-secret-key-change-in-production';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Middleware to check if user is tailor
const requireTailor = (req, res, next) => {
  if (req.user.role !== 'tailor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Tailor only.' });
  }
  next();
};

// Middleware to check if user is customer
const requireCustomer = (req, res, next) => {
  if (req.user.role !== 'customer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Customer only.' });
  }
  next();
};

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
  requireTailor,
  requireCustomer,
  JWT_SECRET
};

