const mongoose = require("mongoose");

const tableSchemaSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true },
      constraints: { type: String, default: "" },
    },
  ],
  description: { type: String, default: "" },
});

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "SELECT",
        "JOIN",
        "Aggregation",
        "Subquery",
        "Window Functions",
        "DML",
      ],
      default: "SELECT",
    },
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    hints: [
      {
        type: String,
      },
    ],
    // Tables involved in this assignment (references PostgreSQL tables)
    tables: [tableSchemaSchema],
    // Expected output description (not the actual answer)
    expectedOutputDescription: {
      type: String,
      default: "",
    },
    tags: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assignment", assignmentSchema);
