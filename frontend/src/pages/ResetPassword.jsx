import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: sessionStorage.getItem("resetEmail") || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessageType("danger");
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          email: formData.email.trim().toLowerCase(),
          otp: formData.otp.trim(),
          newPassword: formData.newPassword,
        }
      );

      setMessageType("success");
      setMessage(response.data.message);

      sessionStorage.removeItem("resetEmail");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessageType("danger");

      setMessage(
        error.response?.data?.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center px-3 py-5"
      style={{
        background:
          "linear-gradient(135deg, #0d6efd, #6610f2)",
      }}
    >
      <div
        className="card border-0 shadow-lg rounded-4"
        style={{
          width: "100%",
          maxWidth: "470px",
        }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <i className="bi bi-shield-lock-fill display-3 text-primary"></i>

            <h2 className="fw-bold mt-2">
              Reset Password
            </h2>

            <p className="text-muted">
              Enter the OTP sent to your email.
            </p>
          </div>

          {message && (
            <div className={`alert alert-${messageType}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email
              </label>

              <input
                type="email"
                className="form-control form-control-lg"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                OTP
              </label>

              <input
                type="text"
                className="form-control form-control-lg text-center"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                New Password
              </label>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control form-control-lg"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <i
                    className={`bi ${
                      showPassword
                        ? "bi-eye-slash-fill"
                        : "bi-eye-fill"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Confirm Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                className="form-control form-control-lg"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg rounded-pill w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Reset Password
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            <Link
              to="/login"
              className="text-decoration-none fw-bold"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;