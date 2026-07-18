import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        {
          email: email.trim().toLowerCase(),
        }
      );

      sessionStorage.setItem(
        "resetEmail",
        email.trim().toLowerCase()
      );

      setMessageType("success");
      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/reset-password");
      }, 1200);
    } catch (error) {
      setMessageType("danger");

      setMessage(
        error.response?.data?.message ||
          "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center px-3"
      style={{
        background:
          "linear-gradient(135deg, #0d6efd, #6610f2)",
      }}
    >
      <div
        className="card border-0 shadow-lg rounded-4"
        style={{
          width: "100%",
          maxWidth: "430px",
        }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto shadow"
              style={{
                width: "75px",
                height: "75px",
              }}
            >
              <i className="bi bi-key-fill fs-1"></i>
            </div>

            <h2 className="fw-bold mt-3">
              Forgot Password
            </h2>

            <p className="text-muted">
              Enter your registered email to receive an OTP.
            </p>
          </div>

          {message && (
            <div className={`alert alert-${messageType}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Registered Email
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope-fill"></i>
                </span>

                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg rounded-pill w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Sending OTP...
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill me-2"></i>
                  Send OTP
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Remember your password?{" "}

            <Link
              to="/login"
              className="fw-bold text-decoration-none"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;