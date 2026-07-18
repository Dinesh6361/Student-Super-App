const express = require("express");

const {
  createTimetable,
  getAllTimetables,
  getStudentTimetable,
  updateTimetable,
  deleteTimetable,
} = require("../controllers/timetableController");

const router = express.Router();

router.post("/", createTimetable);

router.get("/", getAllTimetables);

router.get("/student", getStudentTimetable);

router.put("/:id", updateTimetable);

router.delete("/:id", deleteTimetable);

module.exports = router;