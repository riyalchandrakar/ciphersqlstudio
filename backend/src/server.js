require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");

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

/* ─────────────────────────────────────────
   TRUST PROXY (IMPORTANT FOR RENDER)
───────────────────────────────────────── */
app.set("trust proxy", 1);

/* ─────────────────────────────────────────
   SECURITY MIDDLEWARE
───────────────────────────────────────── */
app.use(helmet());
app.use(compression());

/* ─────────────────────────────────────────
   CORS
───────────────────────────────────────── */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

/* ─────────────────────────────────────────
   BODY PARSER
───────────────────────────────────────── */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

/* ─────────────────────────────────────────
   RATE LIMITING
───────────────────────────────────────── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/* ─────────────────────────────────────────
   ROUTES
───────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/hints", hintRoutes);
app.use("/api/attempts", attemptRoutes);

/* ─────────────────────────────────────────
   HEALTH CHECK
───────────────────────────────────────── */
app.get("/", (req, res) => {
  res.send("CipherSQLStudio Backend Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CipherSQLStudio API running 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ─────────────────────────────────────────
   404 HANDLER
───────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

/* ─────────────────────────────────────────
   GLOBAL ERROR HANDLER
───────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? "Something went wrong." : err.message,
  });
});

/* ─────────────────────────────────────────
   START SERVER (Render Compatible)
───────────────────────────────────────── */
const start = async () => {
  try {
    await connectMongoDB();
    await connectPostgres();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

start();
