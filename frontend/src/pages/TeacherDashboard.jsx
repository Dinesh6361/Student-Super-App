import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("teacherToken") ||
    sessionStorage.getItem("teacherToken");

  const teacher = useMemo(() => {
    const savedTeacher =
      localStorage.getItem("teacher") ||
      sessionStorage.getItem("teacher");

    if (!savedTeacher) {
      return null;
    }

    try {
      return JSON.parse(savedTeacher);
    } catch (error) {
      console.error("Unable to read teacher data:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token || !teacher) {
      navigate("/teacher-login", {
        replace: true,
      });
    }
  }, [token, teacher, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacher");

    sessionStorage.removeItem("teacherToken");
    sessionStorage.removeItem("teacher");

    navigate("/teacher-login", {
      replace: true,
    });
  };

  if (!token || !teacher) {
    return null;
  }

  const teacherInitial =
    teacher.name?.charAt(0)?.toUpperCase() || "T";

  return (
    <div className="teacher-dashboard-page">
      {/* Animated background shapes */}
      <div className="dashboard-shape dashboard-shape-one"></div>
      <div className="dashboard-shape dashboard-shape-two"></div>
      <div className="dashboard-shape dashboard-shape-three"></div>

      <div className="container-fluid px-3 px-md-4 px-xl-5 py-4 position-relative">
        {/* Top header */}
        <div className="dashboard-header mb-4">
          <div className="row align-items-center g-3">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3">
                <div className="teacher-avatar">
                  {teacherInitial}
                </div>

                <div>
                  <p className="dashboard-welcome-text mb-1">
                    Welcome back,
                  </p>

                  <h2 className="fw-bold mb-1 text-white">
                    {teacher.name || "Teacher"}
                  </h2>

                  <p className="mb-0 dashboard-subtitle">
                    Manage your classes, students and attendance
                    from one place.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="d-flex justify-content-lg-end gap-2">
                <button
                  type="button"
                  className="btn dashboard-notification-button"
                  aria-label="Notifications"
                >
                  🔔
                </button>

                <button
                  type="button"
                  className="btn dashboard-logout-button"
                  onClick={handleLogout}
                >
                  <span className="me-2">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="row g-4 mb-4">
          <div className="col-sm-6 col-xl-3">
            <div className="dashboard-stat-card stat-blue h-100">
              <div className="stat-icon-wrapper">👨‍🎓</div>

              <div>
                <p className="stat-label mb-1">
                  My Students
                </p>

                <h3 className="fw-bold mb-0">
                  Semester {teacher.semester || "-"}
                </h3>

                <small>
                  Section {teacher.section || "-"}
                </small>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="dashboard-stat-card stat-green h-100">
              <div className="stat-icon-wrapper">📋</div>

              <div>
                <p className="stat-label mb-1">
                  Attendance
                </p>

                <h3 className="fw-bold mb-0">Manage</h3>

                <small>Mark daily attendance</small>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="dashboard-stat-card stat-orange h-100">
              <div className="stat-icon-wrapper">📚</div>

              <div>
                <p className="stat-label mb-1">
                  Assigned Subject
                </p>

                <h5 className="fw-bold mb-0">
                  {teacher.subject || "Not assigned"}
                </h5>

                <small>
                  {teacher.department || "Department"}
                </small>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="dashboard-stat-card stat-purple h-100">
              <div className="stat-icon-wrapper">🏫</div>

              <div>
                <p className="stat-label mb-1">
                  Designation
                </p>

                <h5 className="fw-bold mb-0">
                  {teacher.designation || "Teacher"}
                </h5>

                <small>
                  ID: {teacher.employeeId || "-"}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left content */}
          <div className="col-xl-8">
            {/* Quick actions */}
            <div className="dashboard-card mb-4">
              <div className="dashboard-card-header">
                <div>
                  <h4 className="fw-bold mb-1">
                    Quick Actions
                  </h4>

                  <p className="text-muted mb-0">
                    Access frequently used teacher features
                  </p>
                </div>
              </div>

              <div className="dashboard-card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <Link
                      to="/teacher/attendance"
                      className="text-decoration-none"
                    >
                      <div className="quick-action-card action-blue">
                        <div className="quick-action-icon">
                          📋
                        </div>

                        <div>
                          <h5 className="fw-bold mb-1">
                            Mark Attendance
                          </h5>

                          <p className="mb-0">
                            View students and record attendance.
                          </p>
                        </div>

                        <span className="quick-action-arrow">
                          →
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className="col-md-6">
                    <Link
                      to="/assignments"
                      className="text-decoration-none"
                    >
                      <div className="quick-action-card action-orange">
                        <div className="quick-action-icon">
                          📝
                        </div>

                        <div>
                          <h5 className="fw-bold mb-1">
                            Assignments
                          </h5>

                          <p className="mb-0">
                            Create and manage assignments.
                          </p>
                        </div>

                        <span className="quick-action-arrow">
                          →
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className="col-md-6">
                    <Link
                      to="/notes"
                      className="text-decoration-none"
                    >
                      <div className="quick-action-card action-green">
                        <div className="quick-action-icon">
                          📒
                        </div>

                        <div>
                          <h5 className="fw-bold mb-1">
                            Study Notes
                          </h5>

                          <p className="mb-0">
                            Upload and share class materials.
                          </p>
                        </div>

                        <span className="quick-action-arrow">
                          →
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className="col-md-6">
                    <Link
                      to="/teacher-timetable"
                      className="text-decoration-none"
                    >
                      <div className="quick-action-card action-purple">
                        <div className="quick-action-icon">
                          🕒
                        </div>

                        <div>
                          <h5 className="fw-bold mb-1">
                            Timetable
                          </h5>

                          <p className="mb-0">
                            Check daily and weekly schedules.
                          </p>
                        </div>

                        <span className="quick-action-arrow">
                          →
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher information */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h4 className="fw-bold mb-1">
                    Teacher Information
                  </h4>

                  <p className="text-muted mb-0">
                    Your registered academic information
                  </p>
                </div>

                <span className="profile-status">
                  ● Active
                </span>
              </div>

              <div className="dashboard-card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="teacher-info-item">
                      <div className="teacher-info-icon">
                        👤
                      </div>

                      <div>
                        <span>Full Name</span>
                        <strong>
                          {teacher.name || "Not available"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="teacher-info-item">
                      <div className="teacher-info-icon">
                        ✉️
                      </div>

                      <div>
                        <span>Email Address</span>
                        <strong>
                          {teacher.email || "Not available"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="teacher-info-item">
                      <div className="teacher-info-icon">
                        🪪
                      </div>

                      <div>
                        <span>Employee ID</span>
                        <strong>
                          {teacher.employeeId ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="teacher-info-item">
                      <div className="teacher-info-icon">
                        🏢
                      </div>

                      <div>
                        <span>Department</span>
                        <strong>
                          {teacher.department ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="teacher-info-item">
                      <div className="teacher-info-icon">
                        🎓
                      </div>

                      <div>
                        <span>Designation</span>
                        <strong>
                          {teacher.designation ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="teacher-info-item">
                      <div className="teacher-info-icon">
                        📚
                      </div>

                      <div>
                        <span>Subject</span>
                        <strong>
                          {teacher.subject ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="teacher-info-item">
                      <div className="teacher-info-icon">
                        🔢
                      </div>

                      <div>
                        <span>Semester</span>
                        <strong>
                          Semester{" "}
                          {teacher.semester || "-"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="teacher-info-item">
                      <div className="teacher-info-icon">
                        🏫
                      </div>

                      <div>
                        <span>Section</span>
                        <strong>
                          Section {teacher.section || "-"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-xl-4">
            <div className="dashboard-card profile-card mb-4">
              <div className="profile-cover"></div>

              <div className="profile-content text-center">
                <div className="profile-avatar">
                  {teacherInitial}
                </div>

                <h4 className="fw-bold mt-3 mb-1">
                  {teacher.name || "Teacher"}
                </h4>

                <p className="text-muted mb-1">
                  {teacher.designation || "Teacher"}
                </p>

                <span className="department-badge">
                  {teacher.department || "Department"}
                </span>

                <hr className="my-4" />

                <div className="row">
                  <div className="col-6 border-end">
                    <h5 className="fw-bold mb-1">
                      {teacher.semester || "-"}
                    </h5>

                    <small className="text-muted">
                      Semester
                    </small>
                  </div>

                  <div className="col-6">
                    <h5 className="fw-bold mb-1">
                      {teacher.section || "-"}
                    </h5>

                    <small className="text-muted">
                      Section
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h5 className="fw-bold mb-1">
                    Class Overview
                  </h5>

                  <p className="text-muted mb-0 small">
                    Current teaching assignment
                  </p>
                </div>
              </div>

              <div className="dashboard-card-body">
                <div className="overview-item">
                  <span className="overview-icon">
                    📚
                  </span>

                  <div>
                    <small>Subject</small>
                    <strong>
                      {teacher.subject || "Not assigned"}
                    </strong>
                  </div>
                </div>

                <div className="overview-item">
                  <span className="overview-icon">
                    🎓
                  </span>

                  <div>
                    <small>Semester</small>
                    <strong>
                      Semester {teacher.semester || "-"}
                    </strong>
                  </div>
                </div>

                <div className="overview-item">
                  <span className="overview-icon">
                    🏫
                  </span>

                  <div>
                    <small>Section</small>
                    <strong>
                      Section {teacher.section || "-"}
                    </strong>
                  </div>
                </div>

                <div className="overview-item">
                  <span className="overview-icon">
                    🏢
                  </span>

                  <div>
                    <small>Department</small>
                    <strong>
                      {teacher.department || "-"}
                    </strong>
                  </div>
                </div>

                <Link
                  to="/teacher/attendance"
                  className="btn btn-primary w-100 rounded-3 mt-3"
                >
                  Open Attendance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;

