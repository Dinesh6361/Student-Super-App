
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }
      );

      setMessageType("success");
      setMessage(response.data.message || "Login successful.");

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);

      setMessageType("danger");

      if (error.response) {
        setMessage(
          error.response.data?.message ||
            "Invalid email or password."
        );
      } else if (error.request) {
        setMessage(
          "Cannot connect to the backend. Make sure the backend is running on port 5000."
        );
      } else {
        setMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100 px-3 py-5"
      style={{
        background:
          "linear-gradient(135deg, #0d6efd, #4f46e5, #7c3aed)",
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
              className="rounded-circle bg-primary text-white mx-auto d-flex justify-content-center align-items-center shadow"
              style={{
                width: "80px",
                height: "80px",
              }}
            >
              <i className="bi bi-mortarboard-fill fs-1"></i>
            </div>

            <h2 className="fw-bold mt-3">Student Login</h2>

            <p className="text-muted mb-0">
              Login using your registered email and password.
            </p>
          </div>

          {message && (
            <div
              className={`alert alert-${messageType} alert-dismissible fade show`}
              role="alert"
            >
              <i
                className={`bi ${
                  messageType === "success"
                    ? "bi-check-circle-fill"
                    : "bi-exclamation-triangle-fill"
                } me-2`}
              ></i>

              {message}

              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email Address
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope-fill"></i>
                </span>

                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="Enter your registered email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Password
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control form-control-lg"
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() =>
                    setShowPassword((previousValue) => !previousValue)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
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

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remember"
                />

                <label
                  className="form-check-label"
                  htmlFor="remember"
                >
                  Remember Me
                </label>
              </div>

              <Link to="/forgot-password" className="btn btn-link p-0 text-decoration-none fw-semibold">
                    Forgot Password?
                  </Link>
            </div>

            <button
              className="btn btn-primary btn-lg rounded-pill w-100 shadow"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  Checking account...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </>
              )}
            </button>
          </form>

          <hr className="my-4" />

          <div className="text-center">
            <p className="mb-0">
              Don't have an account?

              <Link
                to="/register"
                className="fw-bold text-decoration-none ms-2"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

