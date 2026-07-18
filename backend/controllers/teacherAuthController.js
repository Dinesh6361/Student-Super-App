const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Subject = require("../models/Subject");

// ======================================================
// REGISTER TEACHER
// ======================================================
const registerTeacher = async (req, res) => {
  try {
    const {
      name,
      employeeId,
      email,
      phone,
      department,
      designation,
      semester,
      section,
      subject,
      password,
    } = req.body;

    if (
      !name ||
      !employeeId ||
      !email ||
      !phone ||
      !department ||
      !designation ||
      !semester ||
      !section ||
      !subject ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter all required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEmployeeId = employeeId.trim();

    const existingTeacher = await Teacher.findOne({
      $or: [
        { email: normalizedEmail },
        { employeeId: normalizedEmployeeId },
      ],
    });

    if (existingTeacher) {
      if (existingTeacher.email === normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "This teacher email is already registered.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "This employee ID is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      name: name.trim(),
      employeeId: normalizedEmployeeId,
      email: normalizedEmail,
      phone: phone.trim(),
      department,
      designation,
      semester: Number(semester),
      section: section.trim().toUpperCase(),
      subject,
      password: hashedPassword,
      role: "teacher",
    });

    return res.status(201).json({
      success: true,
      message: "Teacher registration successful. Please login.",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId,
      },
    });
  } catch (error) {
    console.error("Teacher registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register teacher.",
    });
  }
};

// ======================================================
// LOGIN TEACHER
// ======================================================
const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const teacher = await Teacher.findOne({
      email: normalizedEmail,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message:
          "Email not found. Please register as a teacher first.",
      });
    }

    const passwordMatched = await bcrypt.compare(
      password,
      teacher.password
    );

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "JWT_SECRET is missing in the backend .env file.",
      });
    }

    const token = jwt.sign(
      {
        teacherId: teacher._id,
        role: "teacher",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Teacher login successful.",
      token,
      teacher: {
        id: teacher._id,
        teacherId: teacher._id,
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId,
        phone: teacher.phone,
        department: teacher.department,
        designation: teacher.designation,
        semester: teacher.semester,
        section: teacher.section,
        subject: teacher.subject,
        role: "teacher",
      },
    });
  } catch (error) {
    console.error("Teacher login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login teacher.",
    });
  }
};
// ======================================================
// SEND FORGOT PASSWORD OTP
// ======================================================
const sendTeacherForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered teacher email.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const teacher = await Teacher.findOne({
      email: normalizedEmail,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Email not found. Please register as a teacher first.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("EMAIL_USER or EMAIL_PASS is missing.");

      return res.status(500).json({
        success: false,
        message:
          "Email service is not configured. Check EMAIL_USER and EMAIL_PASS.",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Student Super App" <${process.env.EMAIL_USER}>`,
      to: teacher.email,
      subject: "Teacher Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2 style="color: #0d6efd;">
            Teacher Password Reset
          </h2>

          <p>Hello ${teacher.name},</p>

          <p>Your password reset OTP is:</p>

          <div style="
            padding: 16px;
            margin: 20px 0;
            text-align: center;
            border-radius: 10px;
            background: #eef4ff;
            color: #0d6efd;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
          ">
            ${otp}
          </div>

          <p>This OTP is valid for 10 minutes.</p>

          <p>Do not share this OTP with anyone.</p>
        </div>
      `,
    });

    teacher.resetPasswordOtp = hashedOtp;
    teacher.resetPasswordOtpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );
    teacher.resetPasswordVerified = false;

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Send teacher OTP error:", error);

    if (error.code === "EAUTH") {
      return res.status(500).json({
        success: false,
        message:
          "Gmail authentication failed. Check your Gmail App Password.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to send OTP. Please try again.",
    });
  }
};

// ======================================================
// VERIFY FORGOT PASSWORD OTP
// ======================================================
const verifyTeacherForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const teacher = await Teacher.findOne({
      email: normalizedEmail,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher account not found.",
      });
    }

    if (
      !teacher.resetPasswordOtp ||
      !teacher.resetPasswordOtpExpires
    ) {
      return res.status(400).json({
        success: false,
        message: "Please request a new OTP.",
      });
    }

    if (teacher.resetPasswordOtpExpires < new Date()) {
      teacher.resetPasswordOtp = null;
      teacher.resetPasswordOtpExpires = null;
      teacher.resetPasswordVerified = false;

      await teacher.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const otpMatched = await bcrypt.compare(
      otp.toString(),
      teacher.resetPasswordOtp
    );

    if (!otpMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    teacher.resetPasswordVerified = true;

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Verify teacher OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
    });
  }
};

// ======================================================
// RESET TEACHER PASSWORD
// ======================================================
const resetTeacherPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please enter all required fields.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const teacher = await Teacher.findOne({
      email: normalizedEmail,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher account not found.",
      });
    }

    if (!teacher.resetPasswordVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your OTP first.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    teacher.password = hashedPassword;
    teacher.resetPasswordOtp = null;
    teacher.resetPasswordOtpExpires = null;
    teacher.resetPasswordVerified = false;

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login.",
    });
  } catch (error) {
    console.error("Reset teacher password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
};

// ======================================================
// EXPORT ALL CONTROLLERS
// ======================================================
module.exports = {
  registerTeacher,
  loginTeacher,
  sendTeacherForgotPasswordOtp,
  verifyTeacherForgotPasswordOtp,
  resetTeacherPassword,
};