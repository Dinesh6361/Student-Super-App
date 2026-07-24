const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const User = require("../models/User");
const Teacher = require("../models/Teacher");

// Convert questions into proper format
// Convert questions into proper format
const formatQuestions = (questions) => {
  let parsedQuestions = questions;

  // If questions come from FormData, they will be a JSON string
  if (typeof questions === "string") {
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (error) {
      return [];
    }
  }

  if (!Array.isArray(parsedQuestions)) {
    return [];
  }

  return parsedQuestions
    .map((question) => {
      if (typeof question === "string") {
        return {
          questionText: question.trim(),
        };
      }

      return {
        questionText: question.questionText?.trim() || "",
      };
    })
    .filter((question) => question.questionText !== "");
};
// Check MongoDB ID
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ----------------------------------------------------
// CREATE ASSIGNMENT
// POST /api/assignments
// ----------------------------------------------------
const createAssignment = async (req, res) => {
  try {
    const {
      teacherId,
      subjectName,
      subjectCode,
      title,
      description,
      questions,
      semester,
      assignmentScope,
      section,
      submissionDate,
      maximumMarks,
    } = req.body;

    // Check required fields
    if (
      !teacherId ||
      !subjectName ||
      !subjectCode ||
      !title ||
      !semester ||
      !submissionDate ||
      !maximumMarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required assignment details.",
      });
    }

    const originalTeacherId = teacherId.trim();

    const formattedTeacherId =
      mongoose.Types.ObjectId.isValid(originalTeacherId)
        ? originalTeacherId
        : originalTeacherId.toUpperCase();

    const formattedSubjectName =
      subjectName.trim();

    const formattedSubjectCode =
      subjectCode.trim().toUpperCase();

    const formattedTitle =
      title.trim();

    // Search teacher using _id, teacherId or employeeId
    const teacherSearchConditions = [
      {
        teacherId: formattedTeacherId,
      },
      {
        employeeId: formattedTeacherId,
      },
    ];

    if (
      mongoose.Types.ObjectId.isValid(originalTeacherId)
    ) {
      teacherSearchConditions.push({
        _id: originalTeacherId,
      });
    }

    const teacher = await Teacher.findOne({
      $or: teacherSearchConditions,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: `Teacher was not found with ID ${originalTeacherId}.`,
      });
    }

    // Convert questions from FormData string to array
    let parsedQuestions = questions;

    if (typeof questions === "string") {
      try {
        parsedQuestions = JSON.parse(questions);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid questions format.",
        });
      }
    }

    if (
      !Array.isArray(parsedQuestions) ||
      parsedQuestions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least one assignment question.",
      });
    }

    const formattedQuestions = parsedQuestions
      .map((question) => {
        if (typeof question === "string") {
          return {
            questionText: question.trim(),
          };
        }

        return {
          questionText:
            question.questionText?.trim() || "",
        };
      })
      .filter(
        (question) =>
          question.questionText !== ""
      );

    if (formattedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least one valid assignment question.",
      });
    }

    const numericSemester = Number(semester);
    const numericMaximumMarks =
      Number(maximumMarks);

    if (
      Number.isNaN(numericSemester) ||
      numericSemester < 1 ||
      numericSemester > 8
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Semester must be between 1 and 8.",
      });
    }

    if (
      Number.isNaN(numericMaximumMarks) ||
      numericMaximumMarks < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum marks must be greater than zero.",
      });
    }

    const scope =
      assignmentScope === "specific-section"
        ? "specific-section"
        : "all-sections";

    let formattedSection = "ALL";

    if (scope === "specific-section") {
      if (!section || section.trim() === "") {
        return res.status(400).json({
          success: false,
          message:
            "Section is required for a specific-section assignment.",
        });
      }

      formattedSection =
        section.trim().toUpperCase();
    }

    const deadline = new Date(submissionDate);

    if (Number.isNaN(deadline.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission date.",
      });
    }

    if (deadline <= new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Submission date must be in the future.",
      });
    }

    // Prevent duplicate assignment
    const duplicateAssignment =
      await Assignment.findOne({
        teacher: teacher._id,
        subjectCode: formattedSubjectCode,
        title: {
          $regex: `^${formattedTitle}$`,
          $options: "i",
        },
        semester: numericSemester,
        section: formattedSection,
        submissionDate: deadline,
        isActive: true,
      });

    if (duplicateAssignment) {
      return res.status(409).json({
        success: false,
        message:
          "The same assignment already exists.",
      });
    }

    let attachment = "";

    if (req.file) {
      attachment =
        `/uploads/assignments/${req.file.filename}`;
    }

    const savedTeacherId =
      teacher.teacherId ||
      teacher.employeeId ||
      teacher._id.toString();

    const assignment =
      await Assignment.create({
        teacher: teacher._id,
        teacherId: savedTeacherId,

        subjectName: formattedSubjectName,
        subjectCode: formattedSubjectCode,

        title: formattedTitle,
        description:
          description?.trim() || "",

        questions: formattedQuestions,

        semester: numericSemester,
        assignmentScope: scope,
        section: formattedSection,

        submissionDate: deadline,
        maximumMarks: numericMaximumMarks,

        attachment,
        isActive: true,
      });

    const populatedAssignment =
      await Assignment.findById(
        assignment._id
      ).populate(
        "teacher",
        "name email teacherId employeeId department designation subject subjectName"
      );

    return res.status(201).json({
      success: true,
      message:
        "Assignment created successfully.",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error(
      "Create assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create assignment.",
      error: error.message,
    });
  }
};
// ----------------------------------------------------
// GET ALL ASSIGNMENTS CREATED BY ONE TEACHER
// GET /api/assignments/teacher/:teacherId
// ----------------------------------------------------
const getTeacherAssignments = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required.",
      });
    }

    const originalTeacherId = teacherId.trim();

    const teacherSearchConditions = [];

    // Search using MongoDB _id
    if (mongoose.Types.ObjectId.isValid(originalTeacherId)) {
      teacherSearchConditions.push({
        _id: originalTeacherId,
      });
    }

    // Search using teacherId or employeeId
    teacherSearchConditions.push(
      {
        teacherId: originalTeacherId.toUpperCase(),
      },
      {
        employeeId: originalTeacherId.toUpperCase(),
      }
    );

    const teacher = await Teacher.findOne({
      $or: teacherSearchConditions,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher was not found.",
      });
    }

    const assignments = await Assignment.find({
      teacher: teacher._id,
      isActive: true,
    })
      .populate(
        "teacher",
        "name email teacherId employeeId department designation subject subjectName"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get teacher assignments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch teacher assignments.",
      error: error.message,
    });
  }
};
// ----------------------------------------------------
// GET ONE ASSIGNMENT
// GET /api/assignments/:assignmentId
// ----------------------------------------------------
const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!isValidObjectId(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isActive: true,
    }).populate("teacher","name email teacherId employeeId department designation subject subjectName");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment was not found.",
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch assignment.",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// UPDATE ASSIGNMENT
// PUT /api/assignments/:assignmentId
// ----------------------------------------------------
const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!isValidObjectId(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment was not found.",
      });
    }

    const {
      teacherId,
      subjectName,
      subjectCode,
      title,
      description,
      questions,
      semester,
      assignmentScope,
      section,
      submissionDate,
      maximumMarks,
    } = req.body;

    if (
      teacherId &&
      assignment.teacherId !== teacherId.trim().toUpperCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify another teacher's assignment.",
      });
    }

    if (subjectName !== undefined) {
      assignment.subjectName = subjectName.trim();
    }

    if (subjectCode !== undefined) {
      assignment.subjectCode = subjectCode.trim().toUpperCase();
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Assignment title cannot be empty.",
        });
      }

      assignment.title = title.trim();
    }

    if (description !== undefined) {
      assignment.description = description.trim();
    }

    if (questions !== undefined) {
      const formattedQuestions = formatQuestions(questions);

      if (formattedQuestions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Add at least one assignment question.",
        });
      }

      assignment.questions = formattedQuestions;
    }

    if (semester !== undefined) {
      const numericSemester = Number(semester);

      if (
        Number.isNaN(numericSemester) ||
        numericSemester < 1 ||
        numericSemester > 8
      ) {
        return res.status(400).json({
          success: false,
          message: "Semester must be between 1 and 8.",
        });
      }

      assignment.semester = numericSemester;
    }

    if (maximumMarks !== undefined) {
      const numericMaximumMarks = Number(maximumMarks);

      if (
        Number.isNaN(numericMaximumMarks) ||
        numericMaximumMarks < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Maximum marks must be greater than zero.",
        });
      }

      assignment.maximumMarks = numericMaximumMarks;
    }

    if (submissionDate !== undefined) {
      const deadline = new Date(submissionDate);

      if (Number.isNaN(deadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid submission date.",
        });
      }

      if (deadline <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Submission date must be in the future.",
        });
      }

      assignment.submissionDate = deadline;
    }

    if (assignmentScope !== undefined) {
      assignment.assignmentScope =
        assignmentScope === "specific-section"
          ? "specific-section"
          : "all-sections";
    }

    if (assignment.assignmentScope === "all-sections") {
      assignment.section = "ALL";
    } else {
      const newSection =
        section !== undefined ? section : assignment.section;

      if (!newSection || newSection.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Section is required.",
        });
      }

      assignment.section = newSection.trim().toUpperCase();
    }

    if (req.file) {
      assignment.attachment =
        `/uploads/assignments/${req.file.filename}`;
    }

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully.",
      assignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update assignment.",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// DELETE ASSIGNMENT
// DELETE /api/assignments/:assignmentId
// ----------------------------------------------------
const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { teacherId } = req.body;

    if (!isValidObjectId(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment was not found.",
      });
    }

    if (
      teacherId &&
      assignment.teacherId !== teacherId.trim().toUpperCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete another teacher's assignment.",
      });
    }

    const submissionCount =
      await AssignmentSubmission.countDocuments({
        assignment: assignmentId,
      });

    if (submissionCount > 0) {
      assignment.isActive = false;
      await assignment.save();

      return res.status(200).json({
        success: true,
        message:
          "Assignment removed successfully. Existing submissions were preserved.",
      });
    }

    await Assignment.findByIdAndDelete(assignmentId);

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete assignment.",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// ADD ONE NEW QUESTION
// POST /api/assignments/:assignmentId/questions
// ----------------------------------------------------
const addQuestion = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { teacherId, questionText } = req.body;

    if (!isValidObjectId(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    if (!questionText || questionText.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment was not found.",
      });
    }

    if (
      teacherId &&
      assignment.teacherId !== teacherId.trim().toUpperCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify another teacher's assignment.",
      });
    }

    assignment.questions.push({
      questionText: questionText.trim(),
    });

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Question added successfully.",
      assignment,
    });
  } catch (error) {
    console.error("Add assignment question error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add question.",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// UPDATE ONE QUESTION
// PUT /api/assignments/:assignmentId/questions/:questionId
// ----------------------------------------------------
const updateQuestion = async (req, res) => {
  try {
    const { assignmentId, questionId } = req.params;
    const { teacherId, questionText } = req.body;

    if (
      !isValidObjectId(assignmentId) ||
      !isValidObjectId(questionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment or question ID.",
      });
    }

    if (!questionText || questionText.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Question text is required.",
      });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment was not found.",
      });
    }

    if (
      teacherId &&
      assignment.teacherId !== teacherId.trim().toUpperCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify another teacher's assignment.",
      });
    }

    const question = assignment.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question was not found.",
      });
    }

    question.questionText = questionText.trim();

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      assignment,
    });
  } catch (error) {
    console.error("Update assignment question error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update question.",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// DELETE ONE QUESTION
// DELETE /api/assignments/:assignmentId/questions/:questionId
// ----------------------------------------------------
const deleteQuestion = async (req, res) => {
  try {
    const { assignmentId, questionId } = req.params;
    const { teacherId } = req.body;

    if (
      !isValidObjectId(assignmentId) ||
      !isValidObjectId(questionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment or question ID.",
      });
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment was not found.",
      });
    }

    if (
      teacherId &&
      assignment.teacherId !== teacherId.trim().toUpperCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify another teacher's assignment.",
      });
    }

    if (assignment.questions.length <= 1) {
      return res.status(400).json({
        success: false,
        message: "An assignment must contain at least one question.",
      });
    }

    const question = assignment.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question was not found.",
      });
    }

    assignment.questions.pull(questionId);

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully.",
      assignment,
    });
  } catch (error) {
    console.error("Delete assignment question error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete question.",
      error: error.message,
    });
  }
};

const getStudentAssignments = async (
  req,
  res
) => {
  try {
    const {
      semester,
      section,
    } = req.query;

    if (!semester) {
      return res.status(400).json({
        success: false,
        message:
          "Student semester is required.",
      });
    }

    const numericSemester =
      Number(semester);

    if (
      Number.isNaN(numericSemester) ||
      numericSemester < 1 ||
      numericSemester > 8
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student semester.",
      });
    }

    const formattedSection =
      section
        ?.trim()
        .toUpperCase() || "";

    const assignments =
      await Assignment.find({
        semester: numericSemester,
        isActive: true,

        $or: [
          {
            assignmentScope:
              "all-sections",
          },

          {
            section: "ALL",
          },

          {
            assignmentScope:
              "specific-section",

            section:
              formattedSection,
          },
        ],
      })
        .populate(
          "teacher",
          "name department designation subject subjectName"
        )
        .sort({
          submissionDate: 1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get student assignments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch student assignments.",
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getTeacherAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getStudentAssignments,
};