const express = require("express");
const {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
} = require("../controllers/assignmentController");
const { protect, adminOnly, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", optionalAuth, getAllAssignments);
router.get("/:id", optionalAuth, getAssignmentById);
router.post("/", protect, adminOnly, createAssignment);
router.put("/:id", protect, adminOnly, updateAssignment);

module.exports = router;
