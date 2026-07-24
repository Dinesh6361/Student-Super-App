import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function Assignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});

  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("studentToken") ||
    sessionStorage.getItem("studentToken");

  const student = useMemo(() => {
    const savedStudent =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      localStorage.getItem("student") ||
      sessionStorage.getItem("student");

    if (!savedStudent) {
      return null;
    }

    try {
      return JSON.parse(savedStudent);
    } catch (error) {
      console.error(
        "Unable to read student data:",
        error
      );

      return null;
    }
  }, []);

  const studentId =
    student?._id ||
    student?.id ||
    "";

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getStudentSubmissions =
    useCallback(async () => {
      if (!studentId) {
        return [];
      }

      try {
        const response = await fetch(
          `${API_URL}/api/submissions/student/${studentId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to fetch your submissions."
          );
        }

        const submissionList =
          data.submissions || [];

        setSubmissions(submissionList);

        return submissionList;
      } catch (error) {
        console.error(
          "Fetch submissions error:",
          error
        );

        showMessage(error.message, "danger");

        return [];
      }
    }, [studentId]);

  const getAvailableAssignments =
    useCallback(async () => {
      if (!student) {
        return;
      }

      try {
        setLoading(true);

        const semester =
          student.semester || 1;

        const section =
          student.section || "";

        const query = new URLSearchParams({
          semester: String(semester),
          section: String(section),
        });

        const response = await fetch(
          `${API_URL}/api/assignments/student?${query.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to fetch assignments."
          );
        }

        setAssignments(
          data.assignments || []
        );
      } catch (error) {
        console.error(
          "Fetch assignments error:",
          error
        );

        showMessage(error.message, "danger");
      } finally {
        setLoading(false);
      }
    }, [student]);

  useEffect(() => {
    if (!token || !student || !studentId) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    getAvailableAssignments();
    getStudentSubmissions();
  }, [
    token,
    student,
    studentId,
    navigate,
    getAvailableAssignments,
    getStudentSubmissions,
  ]);

  const getSubmissionForAssignment = (
    assignmentId
  ) => {
    return submissions.find((submission) => {
      const submissionAssignmentId =
        typeof submission.assignment === "object"
          ? submission.assignment?._id
          : submission.assignment;

      return (
        submissionAssignmentId === assignmentId
      );
    });
  };

  const handleFileChange = (
    assignmentId,
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      setSelectedFiles((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[assignmentId];

        return updated;
      });

      return;
    }

    const maximumSize =
      10 * 1024 * 1024;

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
      "jpg",
      "jpeg",
      "png",
    ];

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "";

    if (
      !allowedExtensions.includes(
        extension
      )
    ) {
      event.target.value = "";

      showMessage(
        "Only PDF, Word and image files are allowed.",
        "danger"
      );

      return;
    }

    if (file.size > maximumSize) {
      event.target.value = "";

      showMessage(
        "File size must be less than 10 MB.",
        "danger"
      );

      return;
    }

    setSelectedFiles((previous) => ({
      ...previous,
      [assignmentId]: file,
    }));

    setMessage("");
  };

  const handleSubmitAssignment = async (
    assignmentId
  ) => {
    const selectedFile =
      selectedFiles[assignmentId];

    if (!selectedFile) {
      showMessage(
        "Please choose an answer file.",
        "danger"
      );

      return;
    }

    const formData = new FormData();

    formData.append(
      "assignmentId",
      assignmentId
    );

    formData.append(
      "studentId",
      studentId
    );

    formData.append(
      "answerFile",
      selectedFile
    );

    try {
      setSubmittingId(assignmentId);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/submissions`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit assignment."
        );
      }

      showMessage(
        data.message ||
          "Assignment submitted successfully.",
        data.submission?.status === "late"
          ? "warning"
          : "success"
      );

      setSelectedFiles((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[assignmentId];

        return updated;
      });

      await getStudentSubmissions();
    } catch (error) {
      console.error(
        "Submit assignment error:",
        error
      );

      showMessage(error.message, "danger");
    } finally {
      setSubmittingId("");
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
      return "";
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

  if (!token || !student) {
    return null;
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid px-3 px-md-4">
          <Link
            to="/dashboard"
            className="navbar-brand fw-bold"
          >
            Student Super App
          </Link>

          <div className="d-flex align-items-center gap-2">
            <span className="text-white d-none d-md-inline">
              {student.name || "Student"}
            </span>

            <Link
              to="/dashboard"
              className="btn btn-light btn-sm"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              Assignments
            </h2>

            <p className="text-muted mb-0">
              View assignments and upload your
              answers before the submission date.
            </p>
          </div>

          <div className="bg-white rounded-3 shadow-sm px-3 py-2">
            <div className="small text-muted">
              Semester and Section
            </div>

            <div className="fw-bold">
              Semester {student.semester || "-"} ·
              Section {student.section || "-"}
            </div>
          </div>
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
              onClick={() => setMessage("")}
              aria-label="Close"
            ></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            ></div>

            <p className="text-muted mt-3 mb-0">
              Loading assignments...
            </p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div
                className="mb-3"
                style={{
                  fontSize: "3rem",
                }}
              >
                📝
              </div>

              <h4 className="fw-bold">
                No assignments available
              </h4>

              <p className="text-muted mb-0">
                Your teachers have not added any
                assignments for your semester yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {assignments.map((assignment) => {
              const submission =
                getSubmissionForAssignment(
                  assignment._id
                );

              const deadlinePassed =
                new Date() >
                new Date(
                  assignment.submissionDate
                );

              const isSubmitting =
                submittingId ===
                assignment._id;

              return (
                <div
                  className="col-12"
                  key={assignment._id}
                >
                  <div className="card border-0 shadow-sm overflow-hidden">
                    <div className="card-header bg-white border-0 p-4 pb-2">
                      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                        <div>
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
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

                            <span
                              className={`badge ${
                                assignment.isActive
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {assignment.isActive
                                ? "Active"
                                : "Inactive"}
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
                            Submission Deadline
                          </div>

                          <div
                            className={`fw-bold ${
                              deadlinePassed
                                ? "text-danger"
                                : "text-success"
                            }`}
                          >
                            {formatDate(
                              assignment.submissionDate
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-body p-4">
                      <div className="row g-3 mb-4">
                        <div className="col-sm-6 col-lg-3">
                          <div className="bg-light rounded-3 p-3 h-100">
                            <small className="text-muted d-block">
                              Semester
                            </small>

                            <strong>
                              Semester{" "}
                              {assignment.semester}
                            </strong>
                          </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                          <div className="bg-light rounded-3 p-3 h-100">
                            <small className="text-muted d-block">
                              Section
                            </small>

                            <strong>
                              {assignment.section ||
                                "ALL"}
                            </strong>
                          </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                          <div className="bg-light rounded-3 p-3 h-100">
                            <small className="text-muted d-block">
                              Maximum Marks
                            </small>

                            <strong>
                              {
                                assignment.maximumMarks
                              }
                            </strong>
                          </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                          <div className="bg-light rounded-3 p-3 h-100">
                            <small className="text-muted d-block">
                              Questions
                            </small>

                            <strong>
                              {assignment.questions
                                ?.length || 0}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="fw-bold mb-3">
                          Assignment Questions
                        </h5>

                        {assignment.questions?.length >
                        0 ? (
                          <ol className="list-group list-group-numbered">
                            {assignment.questions.map(
                              (
                                question,
                                questionIndex
                              ) => (
                                <li
                                  key={
                                    question._id ||
                                    questionIndex
                                  }
                                  className="list-group-item d-flex align-items-start"
                                >
                                  <div className="ms-2">
                                    {question.questionText ||
                                      question.question ||
                                      question.text ||
                                      "Question"}
                                  </div>
                                </li>
                              )
                            )}
                          </ol>
                        ) : (
                          <div className="alert alert-light border">
                            No questions were added.
                          </div>
                        )}
                      </div>

                      {assignment.attachment && (
                        <div className="mb-4">
                          <h5 className="fw-bold mb-2">
                            Teacher Attachment
                          </h5>

                          <a
                            href={`${API_URL}${assignment.attachment}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-primary"
                          >
                            📎 View Attachment
                          </a>
                        </div>
                      )}

                      <hr />

                      {submission ? (
                        <div className="rounded-3 border bg-light p-4">
                          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                            <div>
                              <h5 className="fw-bold mb-2">
                                Submission Status
                              </h5>

                              <span
                                className={`badge ${
                                  submission.status ===
                                  "evaluated"
                                    ? "bg-success"
                                    : submission.status ===
                                      "late"
                                    ? "bg-warning text-dark"
                                    : "bg-primary"
                                }`}
                              >
                                {submission.status ===
                                "evaluated"
                                  ? "Evaluated"
                                  : submission.status ===
                                    "late"
                                  ? "Submitted Late"
                                  : "Submitted"}
                              </span>

                              <p className="mb-1 mt-3">
                                <strong>
                                  Submitted:
                                </strong>{" "}
                                {formatDate(
                                  submission.submittedAt
                                )}
                              </p>

                              <p className="mb-1">
                                <strong>
                                  File:
                                </strong>{" "}
                                {
                                  submission.originalFileName
                                }
                              </p>

                              {submission.fileSize >
                                0 && (
                                <p className="mb-0 text-muted small">
                                  {formatFileSize(
                                    submission.fileSize
                                  )}
                                </p>
                              )}
                            </div>

                            <div className="d-flex flex-column align-items-lg-end gap-2">
                              <a
                                href={`${API_URL}${submission.answerFile}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline-primary"
                              >
                                View Submitted File
                              </a>

                              {submission.status ===
                                "evaluated" && (
                                <div className="text-lg-end">
                                  <div className="small text-muted">
                                    Marks Obtained
                                  </div>

                                  <h4 className="fw-bold text-success mb-0">
                                    {
                                      submission.marksObtained
                                    }
                                    /
                                    {
                                      assignment.maximumMarks
                                    }
                                  </h4>
                                </div>
                              )}
                            </div>
                          </div>

                          {submission.feedback && (
                            <div className="alert alert-info mt-3 mb-0">
                              <strong>
                                Teacher Feedback:
                              </strong>

                              <div className="mt-1">
                                {
                                  submission.feedback
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-3 border p-4">
                          <h5 className="fw-bold mb-2">
                            Upload Your Answer
                          </h5>

                          <p className="text-muted small">
                            Upload PDF, Word or image.
                            Maximum file size is 10 MB.
                          </p>

                          {deadlinePassed && (
                            <div className="alert alert-warning">
                              The deadline has passed.
                              Your submission may be
                              marked as late.
                            </div>
                          )}

                          <div className="row g-3 align-items-end">
                            <div className="col-md-8">
                              <label
                                htmlFor={`answer-${assignment._id}`}
                                className="form-label fw-semibold"
                              >
                                Choose Answer File
                              </label>

                              <input
                                id={`answer-${assignment._id}`}
                                type="file"
                                className="form-control"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(event) =>
                                  handleFileChange(
                                    assignment._id,
                                    event
                                  )
                                }
                              />

                              {selectedFiles[
                                assignment._id
                              ] && (
                                <div className="small text-success mt-2">
                                  Selected:{" "}
                                  {
                                    selectedFiles[
                                      assignment._id
                                    ].name
                                  }
                                </div>
                              )}
                            </div>

                            <div className="col-md-4">
                              <button
                                type="button"
                                className="btn btn-primary w-100"
                                disabled={
                                  isSubmitting ||
                                  !selectedFiles[
                                    assignment._id
                                  ]
                                }
                                onClick={() =>
                                  handleSubmitAssignment(
                                    assignment._id
                                  )
                                }
                              >
                                {isSubmitting ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Submitting...
                                  </>
                                ) : (
                                  "Submit Assignment"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Assignments;