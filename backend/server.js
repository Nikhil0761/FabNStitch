/* ============================================
   FabNStitch Backend Server
   ============================================
   
   📚 LEARNING: Express.js Server Setup
   
   Express is a minimal web framework for Node.js
   that makes building APIs simple.
   
   Key concepts:
   - app.use() - Add middleware (code that runs on every request)
   - app.get/post/put/delete() - Define API routes
   - res.json() - Send JSON response
   - req.body - Access request data
   
   ============================================ */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const tailorRoutes = require('./routes/tailor');
const orderRoutes = require('./routes/orders');

// Import database initialization
const { initializeDatabase } = require('./database/init');

// Create Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS (allows frontend to call backend)
app.use(cors({
  origin: 'http://localhost:5173', // React frontend URL
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging (for development)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FabNStitch API is running!' });
});

// Auth routes (login, register, etc.)
app.use('/api/auth', authRoutes);

// Customer routes (profile, dashboard data)
app.use('/api/customer', customerRoutes);

// Tailor routes (orders, status updates)
app.use('/api/tailor', tailorRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

// Initialize database then start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════╗
║       FabNStitch Backend Server           ║
╠═══════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}            ║
║  📡 API URL: http://localhost:${PORT}/api    ║
║  🔧 Environment: ${process.env.NODE_ENV || 'development'}            ║
╚═══════════════════════════════════════════╝
      `);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

