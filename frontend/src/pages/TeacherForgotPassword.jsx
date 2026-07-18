import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TeacherForgotPassword.css";

function TeacherForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage("");
  };

  const sendOtp = async (event) => {
  event.preventDefault();

  if (!formData.email.trim()) {
    setMessage("Please enter your registered teacher email.");
    setMessageType("danger");
    return;
  }

  try {
    setLoading(true);
    setMessage("");
    setMessageType("");

    const response = await axios.post(
      "http://localhost:5000/api/teacher-auth/forgot-password/send-otp",
      {
        email: formData.email.trim().toLowerCase(),
      }
    );

    setMessage(
      response.data.message ||
        "OTP sent successfully to your registered email."
    );
    setMessageType("success");
    setStep(2);
  } catch (error) {
    console.error("Send OTP frontend error:", error);
    console.error("Backend response:", error.response?.data);

    setMessage(
      error.response?.data?.message ||
        error.message ||
        "Unable to send OTP. Please try again."
    );

    setMessageType("danger");
  } finally {
    setLoading(false);
  }
};
  const verifyOtp = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/teacher-auth/forgot-password/verify-otp",
        {
          email: formData.email.trim().toLowerCase(),
          otp: formData.otp,
        }
      );

      setMessage(response.data.message);
      setMessageType("success");
      setStep(3);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "OTP verification failed."
      );
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("danger");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/teacher-auth/forgot-password/reset",
        {
          email: formData.email.trim().toLowerCase(),
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }
      );

      setMessage(response.data.message);
      setMessageType("success");

      setTimeout(() => {
        navigate("/teacher-login");
      }, 1200);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Password reset failed."
      );
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-forgot-page">
      <div className="forgot-circle forgot-circle-one"></div>
      <div className="forgot-circle forgot-circle-two"></div>

      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100 py-5">
          <div className="col-md-7 col-lg-5">
            <div className="forgot-password-card">
              <div className="text-center mb-4">
                <div className="forgot-icon">
                  {step === 1 && "✉️"}
                  {step === 2 && "🔢"}
                  {step === 3 && "🔐"}
                </div>

                <h2 className="fw-bold mt-3">
                  {step === 1 && "Forgot Password"}
                  {step === 2 && "Verify OTP"}
                  {step === 3 && "Create New Password"}
                </h2>

                <p className="text-muted">
                  {step === 1 &&
                    "Enter your registered teacher email."}

                  {step === 2 &&
                    `Enter the OTP sent to ${formData.email}`}

                  {step === 3 &&
                    "Enter and confirm your new password."}
                </p>
              </div>

              <div className="forgot-progress mb-4">
                <div
                  className={`progress-step ${
                    step >= 1 ? "active" : ""
                  }`}
                >
                  1
                </div>

                <div
                  className={`progress-line ${
                    step >= 2 ? "active" : ""
                  }`}
                ></div>

                <div
                  className={`progress-step ${
                    step >= 2 ? "active" : ""
                  }`}
                >
                  2
                </div>

                <div
                  className={`progress-line ${
                    step >= 3 ? "active" : ""
                  }`}
                ></div>

                <div
                  className={`progress-step ${
                    step >= 3 ? "active" : ""
                  }`}
                >
                  3
                </div>
              </div>

              {message && (
                <div
                  className={`alert alert-${messageType} text-center`}
                >
                  {message}
                </div>
              )}

              {step === 1 && (
                <form onSubmit={sendOtp}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Registered Email
                    </label>

                    <div className="input-group forgot-input">
                      <span className="input-group-text">✉️</span>

                      <input
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

                  <button
                    type="submit"
                    className="btn forgot-button w-100"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={verifyOtp}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Enter 6-digit OTP
                    </label>

                    <input
                      type="text"
                      name="otp"
                      className="form-control otp-input text-center"
                      placeholder="000000"
                      value={formData.otp}
                      onChange={handleChange}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      disabled={loading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn forgot-button w-100"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-link w-100 mt-2"
                    onClick={sendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={resetPassword}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      New Password
                    </label>

                    <div className="input-group forgot-input">
                      <span className="input-group-text">🔒</span>

                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        className="form-control"
                        placeholder="Enter new password"
                        value={formData.newPassword}
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
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Confirm Password
                    </label>

                    <div className="input-group forgot-input">
                      <span className="input-group-text">🔐</span>

                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        minLength={6}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn forgot-button w-100"
                    disabled={loading}
                  >
                    {loading
                      ? "Resetting Password..."
                      : "Reset Password"}
                  </button>
                </form>
              )}

              <div className="text-center mt-4">
                <Link
                  to="/teacher-login"
                  className="text-decoration-none"
                >
                  ← Back to Teacher Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherForgotPassword;