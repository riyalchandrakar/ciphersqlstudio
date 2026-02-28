const Assignment = require("../models/Assignment");

// @GET /api/assignments
const getAllAssignments = async (req, res) => {
  try {
    const { difficulty, category, search } = req.query;
    const filter = { isActive: true };

    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const assignments = await Assignment.find(filter)
      .select("-hints")
      .sort({ order: 1, createdAt: 1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching assignments." });
  }
};

// @GET /api/assignments/:id
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment || !assignment.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found." });
    }
    res.json({ success: true, assignment });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching assignment." });
  }
};

// @POST /api/assignments (admin only)
const createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @PUT /api/assignments/:id (admin only)
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found." });
    }
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
};
