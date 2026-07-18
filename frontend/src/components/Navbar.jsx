import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const teacherToken =
    localStorage.getItem("teacherToken") ||
    sessionStorage.getItem("teacherToken");

  const studentToken =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const isTeacherPage =
    location.pathname.startsWith("/teacher");

  const isTeacherLoggedIn = Boolean(teacherToken);
  const isStudentLoggedIn = Boolean(studentToken);

  const handleTeacherLogout = () => {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacher");

    sessionStorage.removeItem("teacherToken");
    sessionStorage.removeItem("teacher");

    navigate("/teacher-login", {
      replace: true,
    });
  };

  const handleStudentLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-3 px-md-4">
        <Link
          className="navbar-brand fw-bold"
          to={
            isTeacherLoggedIn
              ? "/teacher-dashboard"
              : isStudentLoggedIn
              ? "/dashboard"
              : "/"
          }
        >
          Student Super App
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="mainNavbar"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {/* Teacher logged-in navbar */}
            {isTeacherLoggedIn && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      location.pathname ===
                      "/teacher-dashboard"
                        ? "active fw-semibold"
                        : ""
                    }`}
                    to="/teacher-dashboard"
                  >
                    Teacher Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      location.pathname ===
                      "/teacher/attendance"
                        ? "active fw-semibold"
                        : ""
                    }`}
                    to="/teacher/attendance"
                  >
                    Attendance
                  </Link>
                </li>

                <li className="nav-item ms-lg-2">
                  <button
                    type="button"
                    className="btn btn-light text-primary fw-semibold px-3"
                    onClick={handleTeacherLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Student logged-in navbar */}
            {!isTeacherLoggedIn && isStudentLoggedIn && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/dashboard"
                        ? "active fw-semibold"
                        : ""
                    }`}
                    to="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      location.pathname === "/attendance"
                        ? "active fw-semibold"
                        : ""
                    }`}
                    to="/attendance"
                  >
                    Attendance
                  </Link>
                </li>

                <li className="nav-item ms-lg-2">
                  <button
                    type="button"
                    className="btn btn-light text-primary fw-semibold px-3"
                    onClick={handleStudentLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Navbar before login */}
            {!isTeacherLoggedIn &&
              !isStudentLoggedIn &&
              !isTeacherPage && (
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${
                        location.pathname === "/"
                          ? "active fw-semibold"
                          : ""
                      }`}
                      to="/"
                    >
                      Home
                    </Link>
                  </li>

                  <li className="nav-item dropdown">
                    <button
                      type="button"
                      className="nav-link dropdown-toggle btn btn-link text-white text-decoration-none"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Login
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                      <li>
                        <Link
                          className="dropdown-item py-2"
                          to="/login"
                        >
                          🎓 Student Login
                        </Link>
                      </li>

                      <li>
                        <Link
                          className="dropdown-item py-2"
                          to="/teacher-login"
                        >
                          👨‍🏫 Teacher Login
                        </Link>
                      </li>
                    </ul>
                  </li>
                </>
              )}

            {/* Teacher login and registration pages */}
            {!isTeacherLoggedIn &&
              isTeacherPage && (
                <>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to="/teacher-login"
                    >
                      Teacher Login
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      className="btn btn-light text-primary fw-semibold px-3"
                      to="/teacher-register"
                    >
                      Teacher Register
                    </Link>
                  </li>
                </>
              )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

