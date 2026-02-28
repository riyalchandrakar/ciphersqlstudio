const express = require("express");
const {
  executeQuery,
  getSampleData,
} = require("../controllers/queryController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/execute", optionalAuth, executeQuery);
router.get("/sample-data/:tableName", getSampleData);

module.exports = router;
