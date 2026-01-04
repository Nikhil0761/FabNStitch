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

import { initializeDatabase } from "./database/init.js";

// Create app
const app = express();

/* ============================================
   MIDDLEWARE
============================================ */

app.use(
    cors({
        origin: [
            "https://fabnstitch.com",
            "https://www.fabnstitch.com",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000"
        ],
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

/* ============================================
   ERROR HANDLING
============================================ */

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
});

/* ============================================
   START SERVER
============================================ */

const PORT = 5001; // process.env.PORT || 5001;

initializeDatabase()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`
╔═══════════════════════════════════════════╗
║       FabNStitch Backend Server           ║
╠═══════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}        ║
║  🔧 Environment: ${process.env.NODE_ENV}  ║
╚═══════════════════════════════════════════╝
      `);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize database:", err);
        process.exit(1);
    });

console.log("JWT:", process.env.JWT_SECRET);
