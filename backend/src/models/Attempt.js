const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    queries: [
      {
        sql: { type: String, required: true },
        executedAt: { type: Date, default: Date.now },
        wasSuccessful: { type: Boolean, default: false },
        errorMessage: { type: String, default: "" },
        rowCount: { type: Number, default: 0 },
      },
    ],
    // The last saved/best query
    savedQuery: {
      type: String,
      default: "",
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
  },
  { timestamps: true },
);

// Compound index - one attempt doc per user per assignment
attemptSchema.index({ user: 1, assignment: 1 }, { unique: true });

module.exports = mongoose.model("Attempt", attemptSchema);
