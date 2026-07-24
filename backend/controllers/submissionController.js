const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Assignment = require("../models/Assignment");
const AssignmentSubmission = require(
  "../models/AssignmentSubmission"
);
const User = require("../models/User");
const Teacher = require("../models/Teacher");

// Delete uploaded file when an error occurs
const removeUploadedFile = (filePath) => {
  if (!filePath) {
    return;
  }

  const completePath = path.join(
    __dirname,
    "..",
    filePath.replace(/^\/+/, "")
  );

  if (fs.existsSync(completePath)) {
    fs.unlinkSync(completePath);
  }
};

// ---------------------------------------------------
// 1. Student submits assignment
// POST /api/submissions
// ---------------------------------------------------
const submitAssignment = async (req, res) => {
  try {
    const {
      assignmentId,
      studentId,
    } = req.body;

    if (!assignmentId || !studentId) {
      if (req.file) {
        removeUploadedFile(
          `/uploads/submissions/${req.file.filename}`
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "Assignment ID and student ID are required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        assignmentId
      )
    ) {
      if (req.file) {
        removeUploadedFile(
          `/uploads/submissions/${req.file.filename}`
        );
      }

      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        studentId
      )
    ) {
      if (req.file) {
        removeUploadedFile(
          `/uploads/submissions/${req.file.filename}`
        );
      }

      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload your assignment answer file.",
      });
    }

    const assignment =
      await Assignment.findById(assignmentId);

    if (!assignment) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );

      return res.status(404).json({
        success: false,
        message: "Assignment was not found.",
      });
    }

    if (!assignment.isActive) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );

      return res.status(400).json({
        success: false,
        message:
          "This assignment is no longer active.",
      });
    }

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );

      return res.status(404).json({
        success: false,
        message: "Student was not found.",
      });
    }

    // Check semester
    if (
      Number(student.semester) !==
      Number(assignment.semester)
    ) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );

      return res.status(403).json({
        success: false,
        message:
          "This assignment is not available for your semester.",
      });
    }

    // Check section for specific-section assignments
    if (
      assignment.assignmentScope ===
      "specific-section"
    ) {
      const studentSection =
        student.section
          ?.trim()
          .toUpperCase();

      const assignmentSection =
        assignment.section
          ?.trim()
          .toUpperCase();

      if (
        studentSection !==
        assignmentSection
      ) {
        removeUploadedFile(
          `/uploads/submissions/${req.file.filename}`
        );

        return res.status(403).json({
          success: false,
          message:
            "This assignment is not available for your section.",
        });
      }
    }

    const existingSubmission =
      await AssignmentSubmission.findOne({
        assignment: assignmentId,
        student: studentId,
        isActive: true,
      });

    if (existingSubmission) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );

      return res.status(409).json({
        success: false,
        message:
          "You have already submitted this assignment.",
      });
    }

    const currentDate = new Date();

    const submissionStatus =
      currentDate >
      new Date(assignment.submissionDate)
        ? "late"
        : "submitted";

    const answerFile =
      `/uploads/submissions/${req.file.filename}`;

    const submission =
      await AssignmentSubmission.create({
        assignment: assignment._id,
        student: student._id,

        studentName:
          student.name || "Student",

        studentEmail:
          student.email || "",

        studentSemester:
          Number(student.semester),

        studentSection:
          student.section || "NOT AVAILABLE",

        answerFile,

        originalFileName:
          req.file.originalname,

        fileType:
          req.file.mimetype,

        fileSize:
          req.file.size,

        submittedAt:
          currentDate,

        status:
          submissionStatus,

        isActive:
          true,
      });

    const populatedSubmission =
      await AssignmentSubmission.findById(
        submission._id
      )
        .populate(
          "assignment",
          "title subjectName subjectCode semester section submissionDate maximumMarks"
        )
        .populate(
          "student",
          "name email semester section"
        );

    return res.status(201).json({
      success: true,
      message:
        submissionStatus === "late"
          ? "Assignment submitted late."
          : "Assignment submitted successfully.",
      submission:
        populatedSubmission,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "You have already submitted this assignment.",
      });
    }

    console.error(
      "Submit assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit assignment.",
      error: error.message,
    });
  }
};

// ---------------------------------------------------
// 2. Get one student's submissions
// GET /api/submissions/student/:studentId
// ---------------------------------------------------
const getStudentSubmissions = async (
  req,
  res
) => {
  try {
    const { studentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        studentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student was not found.",
      });
    }

    const submissions =
      await AssignmentSubmission.find({
        student: studentId,
        isActive: true,
      })
        .populate(
          "assignment",
          "title description subjectName subjectCode questions semester assignmentScope section submissionDate maximumMarks attachment isActive"
        )
        .populate(
          "evaluatedBy",
          "name teacherId employeeId"
        )
        .sort({
          submittedAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(
      "Get student submissions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch student submissions.",
      error: error.message,
    });
  }
};

// ---------------------------------------------------
// 3. Get student's submission for one assignment
// GET /api/submissions/student/:studentId/assignment/:assignmentId
// ---------------------------------------------------
const getStudentAssignmentSubmission =
  async (req, res) => {
    try {
      const {
        studentId,
        assignmentId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          studentId
        ) ||
        !mongoose.Types.ObjectId.isValid(
          assignmentId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid student or assignment ID.",
        });
      }

      const submission =
        await AssignmentSubmission.findOne({
          student: studentId,
          assignment: assignmentId,
          isActive: true,
        })
          .populate(
            "assignment",
            "title subjectName subjectCode submissionDate maximumMarks"
          )
          .populate(
            "student",
            "name email semester section"
          )
          .populate(
            "evaluatedBy",
            "name teacherId employeeId"
          );

      return res.status(200).json({
        success: true,
        submitted: Boolean(submission),
        submission,
      });
    } catch (error) {
      console.error(
        "Get assignment submission error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch assignment submission.",
        error: error.message,
      });
    }
  };

// ---------------------------------------------------
// 4. Teacher views all submissions for assignment
// GET /api/submissions/assignment/:assignmentId
// ---------------------------------------------------
const getAssignmentSubmissions = async (
  req,
  res
) => {
  try {
    const { assignmentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        assignmentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment =
      await Assignment.findById(
        assignmentId
      ).populate(
        "teacher",
        "name teacherId employeeId email"
      );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment was not found.",
      });
    }

    const submissions =
      await AssignmentSubmission.find({
        assignment: assignmentId,
        isActive: true,
      })
        .populate(
          "student",
          "name email semester section"
        )
        .populate(
          "evaluatedBy",
          "name teacherId employeeId"
        )
        .sort({
          submittedAt: -1,
        });

    const totalStudentsQuery = {
      role: "student",
      semester:
        Number(assignment.semester),
    };

    if (
      assignment.assignmentScope ===
      "specific-section" &&
      assignment.section !== "ALL"
    ) {
      totalStudentsQuery.section = {
        $regex: `^${assignment.section}$`,
        $options: "i",
      };
    }

    const totalStudents =
      await User.countDocuments(
        totalStudentsQuery
      );

    const evaluatedCount =
      submissions.filter(
        (submission) =>
          submission.status ===
          "evaluated"
      ).length;

    const lateCount =
      submissions.filter(
        (submission) =>
          submission.status === "late"
      ).length;

    const submittedCount =
      submissions.length;

    const pendingCount = Math.max(
      totalStudents - submittedCount,
      0
    );

    return res.status(200).json({
      success: true,

      assignment,

      summary: {
        totalStudents,
        submittedCount,
        pendingCount,
        evaluatedCount,
        lateCount,
      },

      submissions,
    });
  } catch (error) {
    console.error(
      "Get assignment submissions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch assignment submissions.",
      error: error.message,
    });
  }
};

// ---------------------------------------------------
// 5. Teacher evaluates submission
// PUT /api/submissions/:submissionId/evaluate
// ---------------------------------------------------
const evaluateSubmission = async (
  req,
  res
) => {
  try {
    const { submissionId } =
      req.params;

    const {
      teacherId,
      marksObtained,
      feedback,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        submissionId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid submission ID.",
      });
    }

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message:
          "Teacher ID is required.",
      });
    }

    if (
      marksObtained === undefined ||
      marksObtained === null ||
      marksObtained === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Marks obtained are required.",
      });
    }

    const originalTeacherId =
      teacherId.trim();

    const teacherConditions = [
      {
        teacherId:
          originalTeacherId.toUpperCase(),
      },
      {
        employeeId:
          originalTeacherId.toUpperCase(),
      },
    ];

    if (
      mongoose.Types.ObjectId.isValid(
        originalTeacherId
      )
    ) {
      teacherConditions.push({
        _id: originalTeacherId,
      });
    }

    const teacher = await Teacher.findOne({
      $or: teacherConditions,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher was not found.",
      });
    }

    const submission =
      await AssignmentSubmission.findById(
        submissionId
      ).populate("assignment");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message:
          "Submission was not found.",
      });
    }

    const numericMarks =
      Number(marksObtained);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Marks must be zero or greater.",
      });
    }

    if (
      numericMarks >
      submission.assignment.maximumMarks
    ) {
      return res.status(400).json({
        success: false,
        message: `Marks cannot exceed ${submission.assignment.maximumMarks}.`,
      });
    }

    // Ensure this assignment belongs to teacher
    if (
      submission.assignment.teacher.toString() !==
      teacher._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot evaluate this assignment submission.",
      });
    }

    submission.marksObtained =
      numericMarks;

    submission.feedback =
      feedback?.trim() || "";

    submission.status =
      "evaluated";

    submission.evaluatedAt =
      new Date();

    submission.evaluatedBy =
      teacher._id;

    await submission.save();

    const evaluatedSubmission =
      await AssignmentSubmission.findById(
        submission._id
      )
        .populate(
          "assignment",
          "title subjectName subjectCode maximumMarks"
        )
        .populate(
          "student",
          "name email semester section"
        )
        .populate(
          "evaluatedBy",
          "name teacherId employeeId"
        );

    return res.status(200).json({
      success: true,
      message:
        "Submission evaluated successfully.",
      submission:
        evaluatedSubmission,
    });
  } catch (error) {
    console.error(
      "Evaluate submission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to evaluate submission.",
      error: error.message,
    });
  }
};

// ---------------------------------------------------
// 6. Student replaces submitted file
// PUT /api/submissions/:submissionId/resubmit
// ---------------------------------------------------
const resubmitAssignment = async (
  req,
  res
) => {
  try {
    const { submissionId } =
      req.params;

    const { studentId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        submissionId
      )
    ) {
      if (req.file) {
        removeUploadedFile(
          `/uploads/submissions/${req.file.filename}`
        );
      }

      return res.status(400).json({
        success: false,
        message:
          "Invalid submission ID.",
      });
    }

    if (
      !studentId ||
      !mongoose.Types.ObjectId.isValid(
        studentId
      )
    ) {
      if (req.file) {
        removeUploadedFile(
          `/uploads/submissions/${req.file.filename}`
        );
      }

      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please choose a new answer file.",
      });
    }

    const submission =
      await AssignmentSubmission.findById(
        submissionId
      ).populate("assignment");

    if (!submission) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );

      return res.status(404).json({
        success: false,
        message:
          "Submission was not found.",
      });
    }

    if (
      submission.student.toString() !==
      studentId
    ) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );

      return res.status(403).json({
        success: false,
        message:
          "You cannot modify this submission.",
      });
    }

    if (
      new Date() >
      new Date(
        submission.assignment.submissionDate
      )
    ) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );

      return res.status(400).json({
        success: false,
        message:
          "The submission deadline has passed.",
      });
    }

    removeUploadedFile(
      submission.answerFile
    );

    submission.answerFile =
      `/uploads/submissions/${req.file.filename}`;

    submission.originalFileName =
      req.file.originalname;

    submission.fileType =
      req.file.mimetype;

    submission.fileSize =
      req.file.size;

    submission.submittedAt =
      new Date();

    submission.status =
      "submitted";

    submission.marksObtained =
      null;

    submission.feedback =
      "";

    submission.evaluatedAt =
      null;

    submission.evaluatedBy =
      null;

    await submission.save();

    return res.status(200).json({
      success: true,
      message:
        "Assignment resubmitted successfully.",
      submission,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(
        `/uploads/submissions/${req.file.filename}`
      );
    }

    console.error(
      "Resubmit assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to resubmit assignment.",
      error: error.message,
    });
  }
};

module.exports = {
  submitAssignment,
  getStudentSubmissions,
  getStudentAssignmentSubmission,
  getAssignmentSubmissions,
  evaluateSubmission,
  resubmitAssignment,
};