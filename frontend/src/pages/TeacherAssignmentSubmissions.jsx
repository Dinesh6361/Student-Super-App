import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = "http://localhost:5000";

function TeacherAssignmentSubmissions() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] =
    useState(null);

  const [submissions, setSubmissions] =
    useState([]);

  const [summary, setSummary] = useState({
    totalStudents: 0,
    submittedCount: 0,
    pendingCount: 0,
    evaluatedCount: 0,
    lateCount: 0,
  });

  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [evaluatingId, setEvaluatingId] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("success");

  const teacherToken =
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
      console.error(
        "Unable to read teacher data:",
        error
      );

      return null;
    }
  }, []);

  const teacherId =
    teacher?._id ||
    teacher?.teacherId ||
    teacher?.employeeId ||
    "";

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage(text);
    setMessageType(type);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getAssignmentSubmissions =
    useCallback(async () => {
      if (!assignmentId) {
        return;
      }

      try {
        setLoading(true);
        setMessage("");

        const response = await fetch(
          `${API_URL}/api/submissions/assignment/${assignmentId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to fetch assignment submissions."
          );
        }

        setAssignment(data.assignment || null);

        setSubmissions(
          data.submissions || []
        );

        setSummary(
          data.summary || {
            totalStudents: 0,
            submittedCount: 0,
            pendingCount: 0,
            evaluatedCount: 0,
            lateCount: 0,
          }
        );

        const marksData = {};
        const feedbackData = {};

        (data.submissions || []).forEach(
          (submission) => {
            marksData[submission._id] =
              submission.marksObtained ?? "";

            feedbackData[submission._id] =
              submission.feedback || "";
          }
        );

        setMarks(marksData);
        setFeedback(feedbackData);
      } catch (error) {
        console.error(
          "Fetch submissions error:",
          error
        );

        showMessage(
          error.message,
          "danger"
        );
      } finally {
        setLoading(false);
      }
    }, [assignmentId]);

  useEffect(() => {
    if (
      !teacherToken ||
      !teacher ||
      !teacherId
    ) {
      navigate("/teacher-login", {
        replace: true,
      });

      return;
    }

    getAssignmentSubmissions();
  }, [
    teacherToken,
    teacher,
    teacherId,
    navigate,
    getAssignmentSubmissions,
  ]);

  const handleMarksChange = (
    submissionId,
    value
  ) => {
    setMarks((previous) => ({
      ...previous,
      [submissionId]: value,
    }));
  };

  const handleFeedbackChange = (
    submissionId,
    value
  ) => {
    setFeedback((previous) => ({
      ...previous,
      [submissionId]: value,
    }));
  };

  const handleEvaluate = async (
    submission
  ) => {
    const marksValue =
      marks[submission._id];

    if (
      marksValue === "" ||
      marksValue === undefined ||
      marksValue === null
    ) {
      showMessage(
        "Please enter marks.",
        "danger"
      );

      return;
    }

    const numericMarks =
      Number(marksValue);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0
    ) {
      showMessage(
        "Marks must be zero or greater.",
        "danger"
      );

      return;
    }

    if (
      numericMarks >
      Number(
        assignment?.maximumMarks || 0
      )
    ) {
      showMessage(
        `Marks cannot exceed ${
          assignment?.maximumMarks || 0
        }.`,
        "danger"
      );

      return;
    }

    try {
      setEvaluatingId(submission._id);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/submissions/${submission._id}/evaluate`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            teacherId,
            marksObtained: numericMarks,
            feedback:
              feedback[submission._id] ||
              "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to evaluate submission."
        );
      }

      showMessage(
        data.message ||
          "Submission evaluated successfully.",
        "success"
      );

      await getAssignmentSubmissions();
    } catch (error) {
      console.error(
        "Evaluate submission error:",
        error
      );

      showMessage(
        error.message,
        "danger"
      );
    } finally {
      setEvaluatingId("");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(
      dateValue
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "Not available";
    }

    if (bytes < 1024) {
      return `${bytes} bytes`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const getStatusBadge = (status) => {
    if (status === "evaluated") {
      return (
        <span className="badge bg-success">
          Evaluated
        </span>
      );
    }

    if (status === "late") {
      return (
        <span className="badge bg-warning text-dark">
          Submitted Late
        </span>
      );
    }

    return (
      <span className="badge bg-primary">
        Submitted
      </span>
    );
  };

  if (!teacherToken || !teacher) {
    return null;
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container-fluid px-3 px-md-4">
          <Link
            to="/teacher-dashboard"
            className="navbar-brand fw-bold"
          >
            Student Super App
          </Link>

          <div className="d-flex align-items-center gap-2">
            <span className="text-white d-none d-md-inline">
              {teacher.name || "Teacher"}
            </span>

            <Link
              to="/teacher-assignments"
              className="btn btn-outline-light btn-sm"
            >
              Assignments
            </Link>

            <Link
              to="/teacher-dashboard"
              className="btn btn-light btn-sm"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              Assignment Submissions
            </h2>

            <p className="text-muted mb-0">
              View student answers, give marks
              and add feedback.
            </p>
          </div>

          <Link
            to="/teacher-assignments"
            className="btn btn-outline-primary"
          >
            ← Back to Assignments
          </Link>
        </div>

        {message && (
          <div
            className={`alert alert-${messageType} alert-dismissible fade show`}
            role="alert"
          >
            {message}

            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() =>
                setMessage("")
              }
            ></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            ></div>

            <p className="text-muted mt-3">
              Loading submissions...
            </p>
          </div>
        ) : !assignment ? (
          <div className="alert alert-danger">
            Assignment was not found.
          </div>
        ) : (
          <>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                  <div>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <span className="badge bg-primary">
                        {
                          assignment.subjectName
                        }
                      </span>

                      <span className="badge bg-secondary">
                        {
                          assignment.subjectCode
                        }
                      </span>

                      <span className="badge bg-success">
                        Semester{" "}
                        {assignment.semester}
                      </span>

                      <span className="badge bg-info text-dark">
                        Section{" "}
                        {assignment.section ||
                          "ALL"}
                      </span>
                    </div>

                    <h3 className="fw-bold mb-2">
                      {assignment.title}
                    </h3>

                    <p className="text-muted mb-0">
                      {assignment.description ||
                        "No description provided."}
                    </p>
                  </div>

                  <div className="text-lg-end">
                    <div className="small text-muted">
                      Maximum Marks
                    </div>

                    <h3 className="fw-bold text-primary">
                      {
                        assignment.maximumMarks
                      }
                    </h3>

                    <div className="small text-muted">
                      Deadline
                    </div>

                    <div className="fw-semibold">
                      {formatDate(
                        assignment.submissionDate
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-6 col-lg">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3 className="fw-bold text-primary">
                      {
                        summary.totalStudents
                      }
                    </h3>

                    <p className="text-muted mb-0">
                      Total Students
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3 className="fw-bold text-success">
                      {
                        summary.submittedCount
                      }
                    </h3>

                    <p className="text-muted mb-0">
                      Submitted
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3 className="fw-bold text-danger">
                      {
                        summary.pendingCount
                      }
                    </h3>

                    <p className="text-muted mb-0">
                      Pending
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3 className="fw-bold text-warning">
                      {summary.lateCount}
                    </h3>

                    <p className="text-muted mb-0">
                      Late
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-6 col-lg">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h3 className="fw-bold text-info">
                      {
                        summary.evaluatedCount
                      }
                    </h3>

                    <p className="text-muted mb-0">
                      Evaluated
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <div
                    className="mb-3"
                    style={{
                      fontSize: "3rem",
                    }}
                  >
                    📭
                  </div>

                  <h4 className="fw-bold">
                    No submissions yet
                  </h4>

                  <p className="text-muted mb-0">
                    Students have not submitted
                    answers for this assignment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {submissions.map(
                  (submission, index) => {
                    const student =
                      submission.student ||
                      {};

                    const isEvaluating =
                      evaluatingId ===
                      submission._id;

                    return (
                      <div
                        className="col-12"
                        key={submission._id}
                      >
                        <div className="card border-0 shadow-sm">
                          <div className="card-header bg-white p-4">
                            <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                              <div className="d-flex align-items-start gap-3">
                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    minWidth: "48px",
                                  }}
                                >
                                  {index + 1}
                                </div>

                                <div>
                                  <h5 className="fw-bold mb-1">
                                    {student.name ||
                                      submission.studentName ||
                                      "Student"}
                                  </h5>

                                  <p className="text-muted mb-1">
                                    {student.email ||
                                      submission.studentEmail}
                                  </p>

                                  <div className="d-flex flex-wrap gap-2">
                                    <span className="badge bg-secondary">
                                      Semester{" "}
                                      {student.semester ||
                                        submission.studentSemester}
                                    </span>

                                    <span className="badge bg-info text-dark">
                                      Section{" "}
                                      {student.section ||
                                        submission.studentSection ||
                                        "-"}
                                    </span>

                                    {getStatusBadge(
                                      submission.status
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-md-end">
                                <div className="small text-muted">
                                  Submitted At
                                </div>

                                <div className="fw-semibold">
                                  {formatDate(
                                    submission.submittedAt
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="card-body p-4">
                            <div className="row g-4">
                              <div className="col-lg-5">
                                <h6 className="fw-bold">
                                  Submitted File
                                </h6>

                                <div className="bg-light border rounded-3 p-3">
                                  <p className="mb-1">
                                    <strong>
                                      File name:
                                    </strong>
                                  </p>

                                  <p className="text-break">
                                    {
                                      submission.originalFileName
                                    }
                                  </p>

                                  <p className="mb-1">
                                    <strong>
                                      File size:
                                    </strong>{" "}
                                    {formatFileSize(
                                      submission.fileSize
                                    )}
                                  </p>

                                  <p className="mb-3">
                                    <strong>
                                      File type:
                                    </strong>{" "}
                                    {submission.fileType ||
                                      "Not available"}
                                  </p>

                                  <a
                                    href={`${API_URL}${submission.answerFile}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline-primary w-100"
                                  >
                                    📄 View Student Answer
                                  </a>
                                </div>
                              </div>

                              <div className="col-lg-7">
                                <h6 className="fw-bold">
                                  Evaluation
                                </h6>

                                <div className="row g-3">
                                  <div className="col-md-4">
                                    <label
                                      htmlFor={`marks-${submission._id}`}
                                      className="form-label fw-semibold"
                                    >
                                      Marks
                                    </label>

                                    <input
                                      id={`marks-${submission._id}`}
                                      type="number"
                                      className="form-control"
                                      min="0"
                                      max={
                                        assignment.maximumMarks
                                      }
                                      value={
                                        marks[
                                          submission
                                            ._id
                                        ] ?? ""
                                      }
                                      placeholder={`Out of ${assignment.maximumMarks}`}
                                      onChange={(
                                        event
                                      ) =>
                                        handleMarksChange(
                                          submission._id,
                                          event.target
                                            .value
                                        )
                                      }
                                    />

                                    <div className="form-text">
                                      Maximum:{" "}
                                      {
                                        assignment.maximumMarks
                                      }
                                    </div>
                                  </div>

                                  <div className="col-md-8">
                                    <label
                                      htmlFor={`feedback-${submission._id}`}
                                      className="form-label fw-semibold"
                                    >
                                      Feedback
                                    </label>

                                    <textarea
                                      id={`feedback-${submission._id}`}
                                      className="form-control"
                                      rows="3"
                                      value={
                                        feedback[
                                          submission
                                            ._id
                                        ] || ""
                                      }
                                      placeholder="Write feedback for the student"
                                      onChange={(
                                        event
                                      ) =>
                                        handleFeedbackChange(
                                          submission._id,
                                          event.target
                                            .value
                                        )
                                      }
                                    ></textarea>
                                  </div>

                                  <div className="col-12">
                                    <button
                                      type="button"
                                      className={`btn ${
                                        submission.status ===
                                        "evaluated"
                                          ? "btn-warning"
                                          : "btn-success"
                                      }`}
                                      disabled={
                                        isEvaluating
                                      }
                                      onClick={() =>
                                        handleEvaluate(
                                          submission
                                        )
                                      }
                                    >
                                      {isEvaluating ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2"></span>
                                          Saving...
                                        </>
                                      ) : submission.status ===
                                        "evaluated" ? (
                                        "Update Evaluation"
                                      ) : (
                                        "Save Marks and Feedback"
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {submission.status ===
                                  "evaluated" && (
                                  <div className="alert alert-success mt-3 mb-0">
                                    <strong>
                                      Current Result:
                                    </strong>{" "}
                                    {
                                      submission.marksObtained
                                    }
                                    /
                                    {
                                      assignment.maximumMarks
                                    }

                                    {submission.feedback && (
                                      <div className="mt-2">
                                        <strong>
                                          Feedback:
                                        </strong>{" "}
                                        {
                                          submission.feedback
                                        }
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default TeacherAssignmentSubmissions;