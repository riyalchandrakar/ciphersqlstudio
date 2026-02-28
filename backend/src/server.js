require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
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

// ─── Middleware ────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Global rate limit: 200 requests per 15 minutes per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
      success: false,
      message: "Too many requests. Please slow down.",
    },
  }),
);

// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/hints", hintRoutes);
app.use("/api/attempts", attemptRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CipherSQLStudio API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ─── Start Server ─────────────────────────────────────────
const start = async () => {
  await connectMongoDB();
  await connectPostgres();
  app.listen(PORT, () => {
    console.log(
      `\n🚀 CipherSQLStudio backend running on http://localhost:${PORT}`,
    );
    console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
  });
};

start();
