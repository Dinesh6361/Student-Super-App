const mongoose = require("mongoose");

const assignmentSubmissionSchema =
  new mongoose.Schema(
    {
      assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true,
      },

      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      studentName: {
        type: String,
        required: true,
        trim: true,
      },

      studentEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      studentSemester: {
        type: Number,
        required: true,
        min: 1,
        max: 8,
      },

      studentSection: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },

      answerFile: {
        type: String,
        required: true,
      },

      originalFileName: {
        type: String,
        required: true,
      },

      fileType: {
        type: String,
        default: "",
      },

      fileSize: {
        type: Number,
        default: 0,
      },

      submittedAt: {
        type: Date,
        default: Date.now,
      },

      status: {
        type: String,
        enum: [
          "submitted",
          "late",
          "evaluated",
        ],
        default: "submitted",
      },

      marksObtained: {
        type: Number,
        default: null,
        min: 0,
      },

      feedback: {
        type: String,
        default: "",
        trim: true,
      },

      evaluatedAt: {
        type: Date,
        default: null,
      },

      evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        default: null,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

// One student can submit only once
// for one assignment.
assignmentSubmissionSchema.index(
  {
    assignment: 1,
    student: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);