const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const teacherAuthRoutes = require("./routes/teacherAuthRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const path = require("path");
const submissionRoutes = require("./routes/submissionRoutes");


const app = express();

/*
  IMPORTANT:
  CORS middleware must come before all API routes.
*/
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());
app.use("/api/timetable", timetableRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions",submissionRoutes);

// Parse form data if needed
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))

);

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Super App API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Attendance routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/teacher-auth", teacherAuthRoutes);



// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });