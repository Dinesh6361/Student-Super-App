const Timetable = require("../models/Timetable");

// Add a new timetable class
const createTimetable = async (req, res) => {
  try {
    const {
      semester,
      section,
      day,
      subjectName,
      subjectCode,
      teacherName,
      startTime,
      endTime,
      room,
      classType,
    } = req.body;

    if (
      !semester ||
      !section ||
      !day ||
      !subjectName ||
      !subjectCode ||
      !teacherName ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required timetable details.",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be later than start time.",
      });
    }

    const existingClass = await Timetable.findOne({
      semester: Number(semester),
      section: section.toUpperCase(),
      day,
      startTime,
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message:
          "A class already exists for this semester, section, day and time.",
      });
    }

    const timetable = await Timetable.create({
      semester: Number(semester),
      section: section.toUpperCase(),
      day,
      subjectName,
      subjectCode,
      teacherName,
      startTime,
      endTime,
      room,
      classType,
    });

    res.status(201).json({
      success: true,
      message: "Timetable class added successfully.",
      timetable,
    });
  } catch (error) {
    console.error("Create timetable error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add timetable class.",
      error: error.message,
    });
  }
};

// Get all timetable classes
const getAllTimetables = async (req, res) => {
  try {
    const { semester, section, day } = req.query;

    const filter = {};

    if (semester) {
      filter.semester = Number(semester);
    }

    if (section) {
      filter.section = section.toUpperCase();
    }

    if (day) {
      filter.day = day;
    }

    const timetables = await Timetable.find(filter).sort({
      day: 1,
      startTime: 1,
    });

    res.status(200).json({
      success: true,
      count: timetables.length,
      timetables,
    });
  } catch (error) {
    console.error("Get timetable error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch timetable.",
      error: error.message,
    });
  }
};

// Get timetable for logged-in student
const getStudentTimetable = async (req, res) => {
  try {
    const { semester, section } = req.query;

    if (!semester || !section) {
      return res.status(400).json({
        success: false,
        message: "Semester and section are required.",
      });
    }

    const timetables = await Timetable.find({
      semester: Number(semester),
      section: section.toUpperCase(),
    }).sort({
      startTime: 1,
    });

    res.status(200).json({
      success: true,
      count: timetables.length,
      timetables,
    });
  } catch (error) {
    console.error("Student timetable error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch student timetable.",
      error: error.message,
    });
  }
};

// Update timetable class
const updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable class not found.",
      });
    }

    const updatedTimetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        section: req.body.section
          ? req.body.section.toUpperCase()
          : timetable.section,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Timetable updated successfully.",
      timetable: updatedTimetable,
    });
  } catch (error) {
    console.error("Update timetable error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update timetable.",
      error: error.message,
    });
  }
};

// Delete timetable class
const deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable class not found.",
      });
    }

    await Timetable.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Timetable class deleted successfully.",
    });
  } catch (error) {
    console.error("Delete timetable error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete timetable.",
      error: error.message,
    });
  }
};

module.exports = {
  createTimetable,
  getAllTimetables,
  getStudentTimetable,
  updateTimetable,
  deleteTimetable,
};