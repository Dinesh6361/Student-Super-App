const express = require("express");

const teacherAuthController = require(
  "../controllers/teacherAuthController"
);

const router = express.Router();

const {
  registerTeacher,
  loginTeacher,
  sendTeacherForgotPasswordOtp,
  verifyTeacherForgotPasswordOtp,
  resetTeacherPassword,
} = teacherAuthController;

// Check controller functions before starting the server
const requiredControllers = {
  registerTeacher,
  loginTeacher,
  sendTeacherForgotPasswordOtp,
  verifyTeacherForgotPasswordOtp,
  resetTeacherPassword,
};

for (const [controllerName, controllerFunction] of Object.entries(
  requiredControllers
)) {
  if (typeof controllerFunction !== "function") {
    throw new Error(
      `${controllerName} is not exported correctly from teacherAuthController.js`
    );
  }
}

// Teacher registration
router.post("/register", registerTeacher);

// Teacher login
router.post("/login", loginTeacher);

// Send forgot-password OTP
router.post(
  "/forgot-password/send-otp",
  sendTeacherForgotPasswordOtp
);

// Verify forgot-password OTP
router.post(
  "/forgot-password/verify-otp",
  verifyTeacherForgotPasswordOtp
);

// Reset teacher password
router.post(
  "/forgot-password/reset",
  resetTeacherPassword
);

module.exports = router;