/* ============================================
   FabNStitch Backend Server
============================================ */

import "dotenv/config"; // ✅ MUST be first

import express from "express";
import cors from "cors";

// Routes
import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customer.js";
import tailorRoutes from "./routes/tailor.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import leadsRoutes from "./routes/leads.js";

import { initializeDatabase } from "./database/init.js";

// Create app
const app = express();

/* ============================================
   MIDDLEWARE
============================================ */

// CORS Configuration - Update with your production URLs
const allowedOrigins = [
    "http://localhost:5173",      // Local development
    "http://localhost:5174",      // Alternate local port
    "http://localhost:3000",      // Alternate local port
    "https://fabnstitch.com",     // Production domain (if you have one)
    "https://www.fabnstitch.com", // Production www domain
    // Add your Render frontend URL here after deployment:
    // "https://your-frontend-name.onrender.com"
];

// If FRONTEND_URL environment variable is set, add it to allowed origins
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

/* ============================================
   ROUTES
============================================ */

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FabNStitch API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      customer: '/api/customer',
      tailor: '/api/tailor',
      orders: '/api/orders',
      admin: '/api/admin',
      leads: '/api/leads'
    },
    documentation: 'API routes are prefixed with /api'
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "FabNStitch API is running 🚀",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/tailor", tailorRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leads", leadsRoutes);

/* ============================================
   ERROR HANDLING
============================================ */

app.use((req, res) => {
  console.error(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.path,
    availableRoutes: {
      auth: ['/api/auth/login', '/api/auth/register', '/api/auth/me', '/api/auth/password'],
      customer: ['/api/customer/dashboard', '/api/customer/profile', '/api/customer/orders', '/api/customer/measurements', '/api/customer/tickets'],
      tailor: ['/api/tailor/dashboard', '/api/tailor/orders', '/api/tailor/orders/:id', '/api/tailor/orders/:id/status', '/api/tailor/profile'],
      orders: ['/api/orders/track/:orderId'],
      admin: ['/api/admin/dashboard', '/api/admin/customers', '/api/admin/tailors', '/api/admin/orders', '/api/admin/tickets', '/api/admin/leads'],
      leads: ['/api/leads'],
      health: ['/api/health']
    }
  });
});

app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
});

/* ============================================
   START SERVER
============================================ */

const PORT = process.env.PORT || 5001;

initializeDatabase()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`
╔═══════════════════════════════════════════╗
║       FabNStitch Backend Server           ║
╠═══════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}        ║
║  🔧 Environment: ${process.env.NODE_ENV || 'development'}  ║
╚═══════════════════════════════════════════╝
      `);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize database:", err);
        process.exit(1);
    });
