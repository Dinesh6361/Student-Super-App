import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const student = useMemo(() => {
    const savedStudent =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (!savedStudent) {
      return null;
    }

    try {
      return JSON.parse(savedStudent);
    } catch (error) {
      console.error("Unable to read student data:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token || !student) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [token, student, navigate]);

  if (!token || !student) {
    return null;
  }

  const features = [
    {
      name: "Attendance",
      path: "/attendance",
      color: "primary",
      icon: "📋",
      description: "View attendance percentage and history",
    },
    {
      name: "Timetable",
      path: "/timetable",
      color: "success",
      icon: "🕒",
      description: "View daily and weekly class schedules",
    },
    {
      name: "Assignments",
      path: "/assignments",
      color: "warning",
      icon: "📝",
      description: "Check assignments and submission dates",
    },
    {
      name: "Notes",
      path: "/notes",
      color: "info",
      icon: "📚",
      description: "Access subject notes and study materials",
    },
    {
      name: "AI Tutor",
      path: "/ai-tutor",
      color: "danger",
      icon: "🤖",
      description: "Ask questions and get AI explanations",
    },
    {
      name: "Coding Practice",
      path: "/coding-practice",
      color: "secondary",
      icon: "💻",
      description: "Practice programming questions",
    },
    {
      name: "Placement Preparation",
      path: "/placement",
      color: "dark",
      icon: "🎯",
      description: "Prepare aptitude and interview questions",
    },
    {
      name: "Resume Builder",
      path: "/resume-builder",
      color: "primary",
      icon: "📄",
      description: "Create an ATS-friendly resume",
    },
    {
      name: "Mock Interview",
      path: "/mock-interview",
      color: "success",
      icon: "🎤",
      description: "Practice HR and technical interviews",
    },
    {
      name: "Job Notifications",
      path: "/jobs",
      color: "warning",
      icon: "💼",
      description: "View internships and job opportunities",
    },
  ];

  const studentInitial =
    student.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-lg rounded-4 mb-5 overflow-hidden">
        <div className="card-body p-0">
          <div className="bg-primary text-white p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-white text-primary fw-bold shadow"
                style={{
                  width: "85px",
                  height: "85px",
                  fontSize: "34px",
                  flexShrink: 0,
                }}
              >
                {studentInitial}
              </div>

              <div>
                <p className="mb-1 text-white-50">
                  Welcome back,
                </p>

                <h2 className="fw-bold mb-2">
                  {student.name || "Student"}
                </h2>

                <p className="mb-0">
                  {student.course || "Course"} · Semester{" "}
                  {student.semester || "-"} · Section{" "}
                  {student.section || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="row g-0 text-center">
            <div className="col-6 col-md-3 p-3 border-end border-bottom">
              <small className="text-muted d-block">
                Email
              </small>

              <strong className="text-break">
                {student.email || "Not available"}
              </strong>
            </div>

            <div className="col-6 col-md-3 p-3 border-end border-bottom">
              <small className="text-muted d-block">
                College
              </small>

              <strong>
                {student.college || "Not available"}
              </strong>
            </div>

            <div className="col-6 col-md-3 p-3 border-end">
              <small className="text-muted d-block">
                Semester
              </small>

              <strong>
                {student.semester || "Not available"}
              </strong>
            </div>

            <div className="col-6 col-md-3 p-3">
              <small className="text-muted d-block">
                Section
              </small>

              <strong>
                {student.section || "Not available"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-5">
        <h2 className="fw-bold">Student Dashboard</h2>

        <p className="text-muted mb-0">
          Select a feature to continue.
        </p>
      </div>

      <div className="row g-4">
        {features.map((item) => (
          <div
            className="col-12 col-md-6 col-lg-4"
            key={item.path}
          >
            <Link
              to={item.path}
              className="text-decoration-none"
            >
              <div
                className={`card h-100 border-0 shadow-sm rounded-4 bg-${item.color} text-white`}
                style={{
                  minHeight: "170px",
                  transition:
                    "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform =
                    "translateY(-6px)";
                  event.currentTarget.style.boxShadow =
                    "0 1rem 2rem rgba(0,0,0,0.18)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform =
                    "translateY(0)";
                  event.currentTarget.style.boxShadow = "";
                }}
              >
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <div className="fs-1 mb-3">
                    {item.icon}
                  </div>

                  <h4 className="fw-bold mb-2">
                    {item.name}
                  </h4>

                  <p className="mb-0 small opacity-75">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

