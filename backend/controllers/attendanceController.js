
const mongoose = require("mongoose");

const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");

// Escape special characters before using user input in RegExp
const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Convert a date into the start of the selected day
const normalizeDate = (dateValue) => {
  const attendanceDate = new Date(dateValue);

  if (Number.isNaN(attendanceDate.getTime())) {
    return null;
  }

  attendanceDate.setHours(0, 0, 0, 0);

  return attendanceDate;
};

// ======================================================
// GET STUDENTS BY SEMESTER AND SECTION
// GET /api/attendance/students
// ======================================================
const getStudents = async (req, res) => {
  try {
    const { semester, section } = req.query;

    if (!semester || !section) {
      return res.status(400).json({
        success: false,
        message: "Semester and section are required.",
      });
    }

    const semesterNumber = Number(semester);
    const normalizedSection = section.trim().toUpperCase();

    if (
      Number.isNaN(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid semester between 1 and 8.",
      });
    }

    const students = await User.find({
      role: "student",
      semester: semesterNumber,
      section: {
        $regex: `^${escapeRegex(normalizedSection)}$`,
        $options: "i",
      },
    })
      .select(
        "_id name email college course semester section role"
      )
      .sort({
        name: 1,
      });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch students.",
      error: error.message,
    });
  }
};

// ======================================================
// GET SUBJECT ID AND STUDENTS AUTOMATICALLY
// GET /api/attendance/class-details
// ======================================================
const getClassDetails = async (req, res) => {
  try {
    const {
      subjectName,
      subjectCode,
      semester,
      section,
    } = req.query;

    if (
      !subjectName ||
      !subjectCode ||
      !semester ||
      !section
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Subject name, subject code, semester and section are required.",
      });
    }

    const normalizedSubjectName = subjectName.trim();
    const normalizedSubjectCode = subjectCode
      .trim()
      .toUpperCase();

    const semesterNumber = Number(semester);
    const normalizedSection = section
      .trim()
      .toUpperCase();

    if (
      Number.isNaN(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid semester.",
      });
    }

    const subject = await Subject.findOne({
      subjectName: {
        $regex: `^${escapeRegex(
          normalizedSubjectName
        )}$`,
        $options: "i",
      },

      subjectCode: {
        $regex: `^${escapeRegex(
          normalizedSubjectCode
        )}$`,
        $options: "i",
      },

      semester: semesterNumber,

      section: {
        $regex: `^${escapeRegex(
          normalizedSection
        )}$`,
        $options: "i",
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message:
          "Subject not found for the entered subject code, semester and section.",
      });
    }

    const students = await User.find({
      role: "student",
      semester: semesterNumber,

      section: {
        $regex: `^${escapeRegex(
          normalizedSection
        )}$`,
        $options: "i",
      },
    })
      .select(
        "_id name email college course semester section role"
      )
      .sort({
        name: 1,
      });

    return res.status(200).json({
      success: true,

      message:
        students.length > 0
          ? `${students.length} students loaded successfully.`
          : "Subject found, but no students are registered for this class.",

      subjectId: subject._id,

      subject: {
        id: subject._id,
        _id: subject._id,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        semester: subject.semester,
        section: subject.section,
      },

      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get class details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load class details.",
      error: error.message,
    });
  }
};

// ======================================================
// SAVE CLASS ATTENDANCE
// POST /api/attendance
// ======================================================
const saveAttendance = async (req, res) => {
  try {
    const {
      teacher,
      subject,
      semester,
      section,
      date,
      attendance,
    } = req.body;

    console.log("Received attendance payload:", req.body);

    if (
      !teacher ||
      !subject ||
      !semester ||
      !section ||
      !date ||
      !Array.isArray(attendance) ||
      attendance.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All attendance details are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(teacher)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Teacher ID.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Subject ID.",
      });
    }

    const semesterNumber = Number(semester);
    const normalizedSection = section
      .trim()
      .toUpperCase();

    if (
      Number.isNaN(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester.",
      });
    }

    const attendanceDate = normalizeDate(date);

    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date.",
      });
    }

    const teacherRecord = await Teacher.findById(teacher);

    if (!teacherRecord) {
      return res.status(404).json({
        success: false,
        message: "Teacher account not found.",
      });
    }

    const subjectRecord = await Subject.findById(subject);

    if (!subjectRecord) {
      return res.status(404).json({
        success: false,
        message: "Subject record not found.",
      });
    }

    if (
      Number(subjectRecord.semester) !== semesterNumber ||
      subjectRecord.section?.trim().toUpperCase() !==
        normalizedSection
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The selected subject does not match the entered semester and section.",
      });
    }

    const invalidAttendanceItem = attendance.find(
      (item) =>
        !item.student ||
        !mongoose.Types.ObjectId.isValid(item.student) ||
        !["Present", "Absent", "Late"].includes(
          item.status
        )
    );

    if (invalidAttendanceItem) {
      return res.status(400).json({
        success: false,
        message:
          "Every student must have a valid student ID and status.",
      });
    }

    const studentIds = attendance.map(
      (item) => item.student
    );

    const uniqueStudentIds = [
      ...new Set(
        studentIds.map((studentId) =>
          studentId.toString()
        )
      ),
    ];

    if (uniqueStudentIds.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate students were found in the attendance list.",
      });
    }

    const validStudents = await User.find({
      _id: {
        $in: studentIds,
      },

      role: "student",
      semester: semesterNumber,

      section: {
        $regex: `^${escapeRegex(
          normalizedSection
        )}$`,
        $options: "i",
      },
    }).select("_id");

    if (validStudents.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more students do not belong to the selected semester and section.",
      });
    }

    const existingAttendance =
      await Attendance.findOne({
        subject: subjectRecord._id,
        semester: semesterNumber,
        section: normalizedSection,
        date: attendanceDate,
      });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance is already marked for this subject and date. Use update attendance instead.",
        attendanceId: existingAttendance._id,
      });
    }

    const newAttendance = await Attendance.create({
  teacher: teacherRecord._id,

  teacherId:
    teacherRecord.employeeId ||
    teacherRecord.teacherId ||
    teacherRecord._id.toString(),

  subject: subjectRecord._id,

  subjectCode: subjectRecord.subjectCode
    ?.trim()
    .toUpperCase(),

  semester: semesterNumber,
  section: normalizedSection,
  date: attendanceDate,

  attendance: attendance.map((item) => ({
    student: item.student,
    status: item.status,
  })),
});

    const populatedAttendance =
      await Attendance.findById(newAttendance._id)
        .populate(
          "teacher",
          "name email employeeId department designation"
        )
        .populate(
          "subject",
          "subjectName subjectCode semester section"
        )
        .populate(
          "attendance.student",
          "name email semester section"
        );

    return res.status(201).json({
      success: true,
      message: "Attendance saved successfully.",
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error("Save attendance error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance is already marked for this subject and date.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save attendance.",
      error: error.message,
    });
  }
};

// ======================================================
// GET ATTENDANCE FOR CLASS AND DATE
// GET /api/attendance/class
// ======================================================
const getClassAttendance = async (req, res) => {
  try {
    const {
      subjectId,
      semester,
      section,
      date,
    } = req.query;

    if (
      !subjectId ||
      !semester ||
      !section ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Subject ID, semester, section and date are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Subject ID.",
      });
    }

    const attendanceDate = normalizeDate(date);

    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date.",
      });
    }

    const attendanceRecord =
      await Attendance.findOne({
        subject: subjectId,
        semester: Number(semester),
        section: section.trim().toUpperCase(),
        date: attendanceDate,
      })
        .populate(
          "subject",
          "subjectName subjectCode semester section"
        )
        .populate(
          "teacher",
          "name email employeeId department designation"
        )
        .populate(
          "attendance.student",
          "name email semester section"
        );

    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      attendance: attendanceRecord,
    });
  } catch (error) {
    console.error("Get class attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch attendance.",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE ALREADY MARKED ATTENDANCE
// PUT /api/attendance/:id
// ======================================================
const updateAttendance = async (req, res) => {
  try {
    const { attendance } = req.body;

    if (
      !Array.isArray(attendance) ||
      attendance.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Attendance list is required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance record ID.",
      });
    }

    const invalidAttendanceItem = attendance.find(
      (item) =>
        !item.student ||
        !mongoose.Types.ObjectId.isValid(item.student) ||
        !["Present", "Absent", "Late"].includes(
          item.status
        )
    );

    if (invalidAttendanceItem) {
      return res.status(400).json({
        success: false,
        message:
          "Every student must have a valid student ID and status.",
      });
    }

    const updatedAttendance =
      await Attendance.findByIdAndUpdate(
        req.params.id,
        {
          attendance,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "subject",
          "subjectName subjectCode"
        )
        .populate(
          "teacher",
          "name email employeeId"
        )
        .populate(
          "attendance.student",
          "name email semester section"
        );

    if (!updatedAttendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update attendance.",
      error: error.message,
    });
  }
};

// ======================================================
// GET ATTENDANCE REPORT FOR ONE STUDENT
// GET /api/attendance/student/:studentId
// ======================================================
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const records = await Attendance.find({
      "attendance.student": studentId,
    })
      .populate(
        "subject",
        "subjectName subjectCode semester section"
      )
      .populate(
        "teacher",
        "name email employeeId"
      )
      .sort({
        date: -1,
      });

    let totalClasses = 0;
    let presentClasses = 0;
    let absentClasses = 0;
    let lateClasses = 0;

    const attendanceHistory = [];

    records.forEach((record) => {
      const studentAttendance =
        record.attendance.find(
          (item) =>
            item.student.toString() ===
            studentId.toString()
        );

      if (!studentAttendance) {
        return;
      }

      totalClasses += 1;

      if (studentAttendance.status === "Present") {
        presentClasses += 1;
      }

      if (studentAttendance.status === "Absent") {
        absentClasses += 1;
      }

      if (studentAttendance.status === "Late") {
        lateClasses += 1;
      }

      attendanceHistory.push({
        attendanceId: record._id,
        subject: record.subject,
        teacher: record.teacher,
        semester: record.semester,
        section: record.section,
        date: record.date,
        status: studentAttendance.status,
      });
    });

    const attendedClasses =
      presentClasses + lateClasses;

    const percentage =
      totalClasses === 0
        ? 0
        : (attendedClasses / totalClasses) * 100;

    return res.status(200).json({
      success: true,

      summary: {
        totalClasses,
        presentClasses,
        absentClasses,
        lateClasses,
        attendedClasses,
        percentage: Number(
          percentage.toFixed(2)
        ),
      },

      history: attendanceHistory,
    });
  } catch (error) {
    console.error(
      "Get student attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch student attendance.",
      error: error.message,
    });
  }
};

module.exports = {
  getStudents,
  getClassDetails,
  saveAttendance,
  getClassAttendance,
  updateAttendance,
  getStudentAttendance,
};

