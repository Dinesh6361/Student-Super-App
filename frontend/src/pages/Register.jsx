import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    course: "",
    semester: "",
    section: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

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
        "http://localhost:5000/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          college: formData.college,
          course: formData.course,
          semester: Number(formData.semester),
          section: formData.section,
        }
      );

      setMessageType("success");
      setMessage(response.data.message || "Registration successful.");

      setFormData({
        name: "",
        email: "",
        password: "",
        college: "",
        course: "",
        semester: "",
        section: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessageType("danger");

      setMessage(
        error.response?.data?.message ||
          "Registration failed. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3"
      style={{
        background: "linear-gradient(135deg, #0d6efd, #6610f2)",
      }}
    >
      <div
        className="card border-0 shadow-lg rounded-4"
        style={{ width: "100%", maxWidth: "650px" }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="display-4 text-primary mb-2">
              <i className="bi bi-person-plus-fill"></i>
            </div>

            <h2 className="fw-bold">Student Registration</h2>

            <p className="text-muted mb-0">
              Create your Student Super App account
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
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Full Name
                </label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-person-fill"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="col-12">
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Password
                </label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock-fill"></i>
                  </span>

                  <input
                    type="password"
                    className="form-control form-control-lg"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    minLength={6}
                    required
                  />
                </div>

                <small className="text-muted">
                  Password must contain at least 6 characters.
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  College
                </label>

                <input
                  type="text"
                  className="form-control form-control-lg"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Enter your college"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Course
                </label>

                <input
                  type="text"
                  className="form-control form-control-lg"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="Example: AIML"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Semester
                </label>

                <select
                  className="form-select form-select-lg"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select semester</option>
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

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Section
                </label>

                <select
                  name="section"
                  className="form-select form-select-lg"
                  value={formData.section}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div className="col-12 mt-4">
                <button
                  className="btn btn-primary btn-lg rounded-pill w-100 shadow-sm"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      ></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-check-fill me-2"></i>
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          <hr className="my-4" />

          <p className="text-center mb-0">
            Already have an account?{" "}
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

export default Register;

