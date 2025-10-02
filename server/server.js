import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

// Import routes
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";
import analyticsRoutes from "./routes/analytics.js";
import aiRoutes from "./routes/ai.js";
import billingRoutes from "./routes/billing.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize error tracking
import { initErrorTracking } from "./utils/errorTracking.js";
initErrorTracking(app);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Import rate limiters
import {
  apiLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter,
} from "./middleware/rateLimiter.js";

// Apply rate limiting to specific routes
app.use("/api/auth", authLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api/data/upload", uploadLimiter);
app.use("/api", apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/smart-saas-dashboard"
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/user", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Smart SaaS Dashboard API is running" });
});

import { errorHandler } from "./middleware/errorHandler.js";

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

const startServer = (port) => {
  const server = app
    .listen(port)
    .on("listening", () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Dashboard API available at http://localhost:${port}/api`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error("❌ Server error:", err);
      }
    });
};

startServer(PORT);
