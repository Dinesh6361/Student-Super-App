const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },

    section: {
      type: String,
      required: [true, "Section is required"],
      enum: ["A", "B", "C"],
      uppercase: true,
      trim: true,
    },

    day: {
      type: String,
      required: [true, "Day is required"],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },

    subjectName: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },

    subjectCode: {
      type: String,
      required: [true, "Subject code is required"],
      uppercase: true,
      trim: true,
    },

    teacherName: {
      type: String,
      required: [true, "Teacher name is required"],
      trim: true,
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
    },

    room: {
      type: String,
      default: "Not assigned",
      trim: true,
    },

    classType: {
      type: String,
      enum: ["Theory", "Lab", "Tutorial"],
      default: "Theory",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate classes in the same time slot
timetableSchema.index(
  {
    semester: 1,
    section: 1,
    day: 1,
    startTime: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Timetable", timetableSchema);