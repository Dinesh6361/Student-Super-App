const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    college: {
      type: String,
      default: "",
    },

    course: {
      type: String,
      default: "",
    },

    semester: {
      type: Number,
      default: 1,
    },

  role: {
  type: String,
  enum: ["student"],
  default: "student",
},
    resetPasswordOtp: {
  type: String,
  default: null,
},

resetPasswordOtpExpires: {
  type: Date,
  default: null,
},
teacherId: {
  type: String,
  trim: true,
  uppercase: true,
  unique: true,
  sparse: true,
},
section: {
  type: String,
  required: true,
  trim: true,
  uppercase: true,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);