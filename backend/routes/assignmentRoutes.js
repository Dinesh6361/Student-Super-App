const express = require("express");

const {
  createAssignment,
  getTeacherAssignments,
  getStudentAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/assignmentController");

const assignmentUpload = require(
  "../middleware/assignmentUpload"
);

const router = express.Router();

// Teacher creates an assignment
router.post(
  "/",
  assignmentUpload.single("attachment"),
  createAssignment
);

// Teacher views their assignments
router.get(
  "/teacher/:teacherId",
  getTeacherAssignments
);
router.get(
  "/student",
  getStudentAssignments
);

// View one assignment
router.get(
  "/:assignmentId",
  getAssignmentById
);

// Teacher updates an assignment
router.put(
  "/:assignmentId",
  assignmentUpload.single("attachment"),
  updateAssignment
);

// Teacher deletes an assignment
router.delete(
  "/:assignmentId",
  deleteAssignment
);

// Add a new question
router.post(
  "/:assignmentId/questions",
  addQuestion
);

// Edit one question
router.put(
  "/:assignmentId/questions/:questionId",
  updateQuestion
);

// Delete one question
router.delete(
  "/:assignmentId/questions/:questionId",
  deleteQuestion
);

module.exports = router;