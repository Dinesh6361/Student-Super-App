import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TeacherLogin.css";

function TeacherLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberTeacher, setRememberTeacher] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * When a teacher is already logged in,
   * redirect directly to the teacher dashboard.
   */
  useEffect(() => {
    const localToken = localStorage.getItem("teacherToken");
    const sessionToken = sessionStorage.getItem("teacherToken");

    if (localToken || sessionToken) {
      navigate("/teacher-dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

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

    const normalizedEmail = formData.email
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !formData.password) {
      setMessage("Please enter email and password.");
      setMessageType("danger");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/teacher-auth/login",
        {
          email: normalizedEmail,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data?.success) {
        setMessage(
          response.data?.message ||
            "Teacher login failed."
        );
        setMessageType("danger");
        return;
      }

      const { token, teacher } = response.data;

      if (!token || !teacher) {
        setMessage(
          "Login succeeded, but teacher information was not received."
        );
        setMessageType("danger");
        return;
      }

      /*
       * Clear any previous teacher login information.
       */
      localStorage.removeItem("teacherToken");
      localStorage.removeItem("teacher");
      sessionStorage.removeItem("teacherToken");
      sessionStorage.removeItem("teacher");

      /*
       * Remember me checked:
       * Login remains after closing the browser.
       *
       * Remember me not checked:
       * Login remains only for the current browser session.
       */
      if (rememberTeacher) {
        localStorage.setItem("teacherToken", token);
        localStorage.setItem(
          "teacher",
          JSON.stringify(teacher)
        );
      } else {
        sessionStorage.setItem("teacherToken", token);
        sessionStorage.setItem(
          "teacher",
          JSON.stringify(teacher)
        );
      }

      setMessage(
        response.data.message ||
          "Teacher login successful."
      );
      setMessageType("success");

      navigate("/teacher-dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Teacher login error:", error);

      if (!error.response) {
        setMessage(
          "Cannot connect to the backend. Make sure the backend is running on port 5000."
        );
      } else if (error.response.status === 404) {
        setMessage(
          error.response.data?.message ||
            "Email not found. Please register as a teacher first."
        );
      } else if (error.response.status === 401) {
        setMessage(
          error.response.data?.message ||
            "Incorrect password."
        );
      } else if (error.response.status === 400) {
        setMessage(
          error.response.data?.message ||
            "Please enter valid login details."
        );
      } else {
        setMessage(
          error.response.data?.message ||
            "Unable to login. Please try again."
        );
      }

      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-login-page">
      {/* Animated background shapes */}
      <div className="login-circle login-circle-one"></div>
      <div className="login-circle login-circle-two"></div>
      <div className="login-circle login-circle-three"></div>

      <div className="container position-relative">
        <div className="row justify-content-center align-items-center min-vh-100 py-5">
          <div className="col-lg-9 col-xl-8">
            <div className="teacher-login-card">
              <div className="row g-0">
                {/* Left side */}
                <div className="col-lg-5 login-info-section">
                  <div className="login-info-content">
                    <div className="login-teacher-icon">
                      <span>👨‍🏫</span>
                    </div>

                    <h2 className="fw-bold mt-4">
                      Welcome Back
                    </h2>

                    <p className="login-description">
                      Login to access your teacher dashboard
                      and manage academic activities.
                    </p>

                    <div className="login-feature">
                      <span>✓</span>
                      Manage attendance
                    </div>

                    <div className="login-feature">
                      <span>✓</span>
                      View assigned subjects
                    </div>

                    <div className="login-feature">
                      <span>✓</span>
                      Manage students
                    </div>

                    <div className="login-feature">
                      <span>✓</span>
                      Access teacher dashboard
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="col-lg-7">
                  <div className="login-form-section">
                    <div className="text-center mb-4">
                      <div className="small-login-icon mb-3">
                        🔐
                      </div>

                      <h2 className="fw-bold login-title">
                        Teacher Login
                      </h2>

                      <p className="text-muted mb-0">
                        Only registered teachers can login
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
                      <div className="mb-4">
                        <label
                          htmlFor="teacherLoginEmail"
                          className="form-label fw-semibold"
                        >
                          Email Address
                        </label>

                        <div className="input-group login-input-group">
                          <span className="input-group-text">
                            ✉️
                          </span>

                          <input
                            id="teacherLoginEmail"
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Enter registered teacher email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="teacherLoginPassword"
                          className="form-label fw-semibold"
                        >
                          Password
                        </label>

                        <div className="input-group login-input-group">
                          <span className="input-group-text">
                            🔒
                          </span>

                          <input
                            id="teacherLoginPassword"
                            type={
                              showPassword
                                ? "text"
                                : "password"
                            }
                            name="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            disabled={loading}
                            required
                          />

                          <button
                            type="button"
                            className="input-group-text password-toggle"
                            onClick={() =>
                              setShowPassword(
                                (previousValue) =>
                                  !previousValue
                              )
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

                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="rememberTeacher"
                            checked={rememberTeacher}
                            onChange={(event) =>
                              setRememberTeacher(
                                event.target.checked
                              )
                            }
                            disabled={loading}
                          />

                          <label
                            className="form-check-label text-muted"
                            htmlFor="rememberTeacher"
                          >
                            Remember me
                          </label>
                        </div>

                        <Link
                          to="/teacher-forgot-password"
                          className="forgot-password-link"
                        >
                          Forgot Password?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        className="btn teacher-login-button w-100"
                        disabled={loading}
                      >
                        <span>
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Checking Account...
                            </>
                          ) : (
                            "Login to Teacher Portal"
                          )}
                        </span>
                      </button>
                    </form>

                    <div className="login-divider">
                      <span>OR</span>
                    </div>

                    <div className="text-center">
                      <p className="text-muted mb-3">
                        Not registered as a teacher?
                      </p>

                      <Link
                        to="/teacher-register"
                        className="btn teacher-register-link-button w-100"
                      >
                        Create Teacher Account
                      </Link>
                    </div>

                    <div className="text-center mt-4">
                      <Link
                        to="/"
                        className="back-home-link"
                      >
                        ← Back to Home
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-muted mt-4 login-footer-text">
              Student Super App Teacher Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLogin;

