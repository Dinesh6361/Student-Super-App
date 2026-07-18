
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TeacherRegister.css";

function TeacherRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    semester: "",
    section: "",
    subject: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Password and confirm password do not match.");
      setMessageType("danger");
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      setMessageType("danger");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setMessage("Phone number must contain exactly 10 digits.");
      setMessageType("danger");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/teacher-auth/register",
        {
          name: formData.name.trim(),
          employeeId: formData.employeeId.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          department: formData.department,
          designation: formData.designation,
          semester: Number(formData.semester),
          section: formData.section,
          subject: formData.subject,
          password: formData.password,
        }
      );

      setMessage(
        response.data.message ||
          "Teacher registration successful. Please login."
      );
      setMessageType("success");

      setFormData({
        name: "",
        employeeId: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        semester: "",
        section: "",
        subject: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/teacher-login");
      }, 1500);
    } catch (error) {
      console.error("Teacher registration error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to register teacher. Please try again."
      );

      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-register-page">
      {/* Animated background circles */}
      <div className="animated-circle circle-one"></div>
      <div className="animated-circle circle-two"></div>
      <div className="animated-circle circle-three"></div>

      <div className="container py-5 position-relative">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-10">
            <div className="teacher-register-card">
              <div className="row g-0">
                {/* Left information section */}
                <div className="col-lg-4 teacher-info-section">
                  <div className="teacher-info-content">
                    <div className="teacher-icon-wrapper">
                      <span className="teacher-icon">👨‍🏫</span>
                    </div>

                    <h2 className="fw-bold mt-4 text-center">
                      Teacher Portal
                    </h2>

                    <p className="teacher-description">
                      Create your teacher account and manage students,
                      subjects, attendance, assignments and academic
                      activities.
                    </p>

                    <div className="teacher-feature">
                      <span>✓</span>
                      Manage student attendance
                    </div>

                    <div className="teacher-feature">
                      <span>✓</span>
                      Handle assigned subjects
                    </div>

                    <div className="teacher-feature">
                      <span>✓</span>
                      View semester and section
                    </div>

                    <div className="teacher-feature">
                      <span>✓</span>
                      Access teacher dashboard
                    </div>
                  </div>
                </div>

                {/* Registration form section */}
                <div className="col-lg-8">
                  <div className="teacher-form-section">
                    <div className="text-center mb-4">
                      <h2 className="fw-bold register-title">
                        Teacher Registration
                      </h2>

                      <p className="text-muted mb-0">
                        Enter your details to create a teacher account
                      </p>
                    </div>

                    {message && (
                      <div
                        className={`alert alert-${messageType} text-center`}
                        role="alert"
                      >
                        {message}
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      {/* Name and employee ID */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="teacherName"
                            className="form-label fw-semibold"
                          >
                            Full Name
                          </label>

                          <div className="input-group custom-input-group">
                            <span className="input-group-text">👤</span>

                            <input
                              id="teacherName"
                              type="text"
                              name="name"
                              className="form-control"
                              placeholder="Enter full name"
                              value={formData.name}
                              onChange={handleChange}
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="employeeId"
                            className="form-label fw-semibold"
                          >
                            Employee ID
                          </label>

                          <div className="input-group custom-input-group">
                            <span className="input-group-text">🪪</span>

                            <input
                              id="employeeId"
                              type="text"
                              name="employeeId"
                              className="form-control"
                              placeholder="Example: CBIT101"
                              value={formData.employeeId}
                              onChange={handleChange}
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email and phone */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="teacherEmail"
                            className="form-label fw-semibold"
                          >
                            Email Address
                          </label>

                          <div className="input-group custom-input-group">
                            <span className="input-group-text">✉️</span>

                            <input
                              id="teacherEmail"
                              type="email"
                              name="email"
                              className="form-control"
                              placeholder="Enter teacher email"
                              value={formData.email}
                              onChange={handleChange}
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="teacherPhone"
                            className="form-label fw-semibold"
                          >
                            Phone Number
                          </label>

                          <div className="input-group custom-input-group">
                            <span className="input-group-text">📞</span>

                            <input
                              id="teacherPhone"
                              type="tel"
                              name="phone"
                              className="form-control"
                              placeholder="Enter 10-digit phone number"
                              value={formData.phone}
                              onChange={handleChange}
                              maxLength={10}
                              pattern="[0-9]{10}"
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Department and designation */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="teacherDepartment"
                            className="form-label fw-semibold"
                          >
                            Department
                          </label>

                          <select
                            id="teacherDepartment"
                            name="department"
                            className="form-select custom-select"
                            value={formData.department}
                            onChange={handleChange}
                            disabled={loading}
                            required
                          >
                            <option value="">Select Department</option>
                            <option value="AIML">
                              Artificial Intelligence & Machine Learning
                            </option>
                            <option value="CSE">
                              Computer Science & Engineering
                            </option>
                            <option value="ISE">
                              Information Science & Engineering
                            </option>
                            <option value="ECE">
                              Electronics & Communication Engineering
                            </option>
                            <option value="EEE">
                              Electrical & Electronics Engineering
                            </option>
                            <option value="ME">
                              Mechanical Engineering
                            </option>
                            <option value="CIVIL">
                              Civil Engineering
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="teacherDesignation"
                            className="form-label fw-semibold"
                          >
                            Designation
                          </label>

                          <select
                            id="teacherDesignation"
                            name="designation"
                            className="form-select custom-select"
                            value={formData.designation}
                            onChange={handleChange}
                            disabled={loading}
                            required
                          >
                            <option value="">Select Designation</option>
                            <option value="Professor">Professor</option>
                            <option value="Associate Professor">
                              Associate Professor
                            </option>
                            <option value="Assistant Professor">
                              Assistant Professor
                            </option>
                            <option value="Lecturer">Lecturer</option>
                          </select>
                        </div>
                      </div>

                      {/* Semester, section and subject */}
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label
                            htmlFor="teacherSemester"
                            className="form-label fw-semibold"
                          >
                            Semester
                          </label>

                          <select
                            id="teacherSemester"
                            name="semester"
                            className="form-select custom-select"
                            value={formData.semester}
                            onChange={handleChange}
                            disabled={loading}
                            required
                          >
                            <option value="">Select Semester</option>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                            <option value="3">Semester 3</option>
                            <option value="4">Semester 4</option>
                            <option value="5">Semester 5</option>
                            <option value="6">Semester 6</option>
                            <option value="7">Semester 7</option>
                            <option value="8">Semester 8</option>
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label
                            htmlFor="teacherSection"
                            className="form-label fw-semibold"
                          >
                            Section
                          </label>

                          <select
                            id="teacherSection"
                            name="section"
                            className="form-select custom-select"
                            value={formData.section}
                            onChange={handleChange}
                            disabled={loading}
                            required
                          >
                            <option value="">Select Section</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label
                            htmlFor="teacherSubject"
                            className="form-label fw-semibold"
                          >
                            Subject
                          </label>

                          <select
                            id="teacherSubject"
                            name="subject"
                            className="form-select custom-select"
                            value={formData.subject}
                            onChange={handleChange}
                            disabled={loading}
                            required
                          >
                            <option value="">Select Subject</option>

                            <option value="Database Management System">
                              Database Management System
                            </option>

                            <option value="Machine Learning">
                              Machine Learning
                            </option>

                            <option value="Artificial Intelligence">
                              Artificial Intelligence
                            </option>

                            <option value="Data Structures">
                              Data Structures
                            </option>

                            <option value="Operating Systems">
                              Operating Systems
                            </option>

                            <option value="Computer Networks">
                              Computer Networks
                            </option>

                            <option value="Web Technologies">
                              Web Technologies
                            </option>

                            <option value="Software Engineering">
                              Software Engineering
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Password fields */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label
                            htmlFor="teacherPassword"
                            className="form-label fw-semibold"
                          >
                            Password
                          </label>

                          <div className="input-group custom-input-group">
                            <span className="input-group-text">🔒</span>

                            <input
                              id="teacherPassword"
                              type={showPassword ? "text" : "password"}
                              name="password"
                              className="form-control"
                              placeholder="Minimum 6 characters"
                              value={formData.password}
                              onChange={handleChange}
                              minLength={6}
                              disabled={loading}
                              required
                            />

                            <button
                              type="button"
                              className="input-group-text password-toggle"
                              onClick={() =>
                                setShowPassword((previous) => !previous)
                              }
                              disabled={loading}
                              aria-label={
                                showPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showPassword ? "🙈" : "👁️"}
                            </button>
                          </div>
                        </div>

                        <div className="col-md-6 mb-4">
                          <label
                            htmlFor="teacherConfirmPassword"
                            className="form-label fw-semibold"
                          >
                            Confirm Password
                          </label>

                          <div className="input-group custom-input-group">
                            <span className="input-group-text">🔐</span>

                            <input
                              id="teacherConfirmPassword"
                              type={
                                showConfirmPassword ? "text" : "password"
                              }
                              name="confirmPassword"
                              className="form-control"
                              placeholder="Enter password again"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              minLength={6}
                              disabled={loading}
                              required
                            />

                            <button
                              type="button"
                              className="input-group-text password-toggle"
                              onClick={() =>
                                setShowConfirmPassword(
                                  (previous) => !previous
                                )
                              }
                              disabled={loading}
                              aria-label={
                                showConfirmPassword
                                  ? "Hide confirm password"
                                  : "Show confirm password"
                              }
                            >
                              {showConfirmPassword ? "🙈" : "👁️"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn register-button w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Registering Teacher...
                          </>
                        ) : (
                          "Create Teacher Account"
                        )}
                      </button>
                    </form>

                    <div className="text-center mt-4">
                      <span className="text-muted">
                        Already have a teacher account?{" "}
                      </span>

                      <Link
                        to="/teacher-login"
                        className="login-link fw-semibold"
                      >
                        Teacher Login
                      </Link>
                    </div>

                    <div className="text-center mt-3">
                      <Link
                        to="/"
                        className="text-muted text-decoration-none"
                      >
                        ← Back to Home
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-muted mt-4 mb-0">
              Student Super App Teacher Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherRegister;
