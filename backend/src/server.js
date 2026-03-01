require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");
const morgan = require("morgan");

const connectMongoDB = require("./config/mongodb");
const { connectPostgres } = require("./config/postgres");

// Routes
const authRoutes = require("./routes/auth");
const assignmentRoutes = require("./routes/assignments");
const queryRoutes = require("./routes/query");
const hintRoutes = require("./routes/hints");
const attemptRoutes = require("./routes/attempts");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// ─── Security Middlewares ───────────────────────────────

// Security headers
app.use(helmet());

// Enable compression
app.use(compression());

// Prevent NoSQL Injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Request logging (only in development)
if (!isProduction) {
  app.use(morgan("dev"));
}

// ─── CORS ────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// ─── Body Parser ─────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ───────────────────────────────────────

// Global limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts. Try again later.",
});
app.use("/api/auth", authLimiter);

// ─── Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/hints", hintRoutes);
app.use("/api/attempts", attemptRoutes);

// ─── Health Check (for Render / Railway / AWS) ──────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CipherSQLStudio API is running 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? "Something went wrong." : err.message,
  });
});

// ─── Graceful Shutdown ───────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// ─── Start Server ────────────────────────────────────────
const start = async () => {
  try {
    await connectMongoDB();
    await connectPostgres();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
};

start();
