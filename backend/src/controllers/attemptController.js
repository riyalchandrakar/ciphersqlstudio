const Attempt = require("../models/Attempt");

// @GET /api/attempts/my
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate("assignment", "title difficulty category")
      .sort({ updatedAt: -1 });
    res.json({ success: true, attempts });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching attempts." });
  }
};

// @GET /api/attempts/:assignmentId
const getAttemptByAssignment = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({
      user: req.user._id,
      assignment: req.params.assignmentId,
    });
    res.json({ success: true, attempt: attempt || null });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching attempt." });
  }
};

// @PATCH /api/attempts/:assignmentId/save
const saveQuery = async (req, res) => {
  const { savedQuery } = req.body;
  if (!savedQuery) {
    return res
      .status(400)
      .json({ success: false, message: "savedQuery is required." });
  }

  try {
    const attempt = await Attempt.findOneAndUpdate(
      { user: req.user._id, assignment: req.params.assignmentId },
      { $set: { savedQuery } },
      { upsert: true, new: true },
    );
    res.json({ success: true, attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving query." });
  }
};

module.exports = { getMyAttempts, getAttemptByAssignment, saveQuery };
