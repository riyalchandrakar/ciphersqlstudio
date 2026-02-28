const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL pool connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err.message);
});

const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");
    client.release();
  } catch (error) {
    console.error("❌ PostgreSQL connection error:", error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectPostgres };
