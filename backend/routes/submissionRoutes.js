const express = require("express");

const {
  submitAssignment,
  getStudentSubmissions,
  getStudentAssignmentSubmission,
  getAssignmentSubmissions,
  evaluateSubmission,
  resubmitAssignment,
} = require("../controllers/submissionController");

const submissionUpload = require(
  "../middleware/submissionUpload"
);

const router = express.Router();

// Student submits an assignment
router.post(
  "/",
  submissionUpload.single("answerFile"),
  submitAssignment
);

// Get all submissions of one student
router.get(
  "/student/:studentId",
  getStudentSubmissions
);

// Get one student's submission for one assignment
router.get(
  "/student/:studentId/assignment/:assignmentId",
  getStudentAssignmentSubmission
);

// Teacher views all submissions for one assignment
router.get(
  "/assignment/:assignmentId",
  getAssignmentSubmissions
);

// Teacher gives marks and feedback
router.put(
  "/:submissionId/evaluate",
  evaluateSubmission
);

// Student replaces submitted answer file
router.put(
  "/:submissionId/resubmit",
  submissionUpload.single("answerFile"),
  resubmitAssignment
);

module.exports = router;