const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const assignmentSchema = new mongoose.Schema(
  {
   teacher: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Teacher",
  required: true,
},

    teacherId: {
      type: String,
      required: true,
      trim: true,
    },

    subjectName: {
      type: String,
      required: true,
      trim: true,
    },

    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    questions: {
      type: [questionSchema],
      validate: {
        validator(questions) {
          return questions.length > 0;
        },
        message: "At least one question is required.",
      },
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    assignmentScope: {
      type: String,
      enum: ["specific-section", "all-sections"],
      default: "all-sections",
    },

    section: {
      type: String,
      default: "ALL",
      uppercase: true,
      trim: true,
    },

    submissionDate: {
      type: Date,
      required: true,
    },

    maximumMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    attachment: {
      type: String,
      default: "",
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

assignmentSchema.pre("validate", function () {
  if (this.assignmentScope === "all-sections") {
    this.section = "ALL";
  }
});

module.exports = mongoose.model("Assignment", assignmentSchema);