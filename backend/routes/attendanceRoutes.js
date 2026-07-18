
const express = require("express");

const {
  getStudents,
  getClassDetails,
  saveAttendance,
  getClassAttendance,
  updateAttendance,
  getStudentAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

// Get students by semester and section
// GET /api/attendance/students?semester=1&section=A
router.get("/students", getStudents);

// Get subject ID and students automatically
// GET /api/attendance/class-details
router.get("/class-details", getClassDetails);

// Get attendance for a selected class and date
// GET /api/attendance/class
router.get("/class", getClassAttendance);

// Get one student's attendance report
// GET /api/attendance/student/:studentId
router.get(
  "/student/:studentId",
  getStudentAttendance
);

// Save attendance
// POST /api/attendance
router.post("/", saveAttendance);

// Update existing attendance
// PUT /api/attendance/:id
router.put("/:id", updateAttendance);

module.exports = router;

