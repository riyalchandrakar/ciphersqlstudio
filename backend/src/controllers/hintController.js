const { generateHint } = require("../utils/llmService");
const Assignment = require("../models/Assignment");
const Attempt = require("../models/Attempt");

// @POST /api/hints/get
const getHint = async (req, res) => {
  const { assignmentId, userQuery, hintLevel = 1 } = req.body;

  if (!assignmentId) {
    return res
      .status(400)
      .json({ success: false, message: "Assignment ID is required." });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found." });
    }

    const hint = await generateHint({
      question: assignment.question,
      tableSchemas: assignment.tables,
      userQuery: userQuery || "",
      hintLevel: Math.min(Math.max(parseInt(hintLevel), 1), 3),
    });

    if (req.user && assignmentId) {
      try {
        await Attempt.findOneAndUpdate(
          { user: req.user._id, assignment: assignmentId },
          { $inc: { hintsUsed: 1 } },
          { upsert: true, new: true },
        );
      } catch (e) {
        // non-critical
      }
    }

    res.json({ success: true, hint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHint };
