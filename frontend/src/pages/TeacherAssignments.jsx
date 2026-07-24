import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/assignments";

const initialForm = {
  subjectName: "",
  subjectCode: "",
  title: "",
  description: "",
  semester: "1",
  assignmentScope: "all-sections",
  section: "ALL",
  submissionDate: "",
  maximumMarks: "",
};

function TeacherAssignments() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [questions, setQuestions] = useState([""]);
  const [attachment, setAttachment] = useState(null);

  const [assignments, setAssignments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const teacher = useMemo(() => {
    try {
      const storedTeacher =
        localStorage.getItem("teacher") ||
        sessionStorage.getItem("teacher");

      return storedTeacher ? JSON.parse(storedTeacher) : null;
    } catch (error) {
      console.error("Unable to read teacher data:", error);
      return null;
    }
  }, []);

  const teacherToken = useMemo(() => {
    return (
      localStorage.getItem("teacherToken") ||
      sessionStorage.getItem("teacherToken")
    );
  }, []);

  const teacherId =
  teacher?.teacherId ||
  teacher?.employeeId ||
  teacher?._id ||
  "";

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchAssignments = useCallback(async () => {
    if (!teacherId) {
      setFetching(false);
      return;
    }

    try {
      setFetching(true);

      const response = await fetch(
        `${API_URL}/teacher/${encodeURIComponent(teacherId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch assignments."
        );
      }

      setAssignments(data.assignments || []);
    } catch (error) {
      console.error("Fetch assignments error:", error);
      showMessage(error.message, "danger");
    } finally {
      setFetching(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (!teacher || !teacherToken || !teacherId) {
      navigate("/teacher-login", {
        replace: true,
      });

      return;
    }

    fetchAssignments();
  }, [
    teacher,
    teacherToken,
    teacherId,
    navigate,
    fetchAssignments,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => {
      if (
        name === "assignmentScope" &&
        value === "all-sections"
      ) {
        return {
          ...previousData,
          assignmentScope: value,
          section: "ALL",
        };
      }

      return {
        ...previousData,
        [name]: value,
      };
    });
  };

  const handleQuestionChange = (index, value) => {
    setQuestions((previousQuestions) =>
      previousQuestions.map((question, questionIndex) =>
        questionIndex === index ? value : question
      )
    );
  };

  const addQuestionField = () => {
    setQuestions((previousQuestions) => [
      ...previousQuestions,
      "",
    ]);
  };

  const removeQuestionField = (index) => {
    if (questions.length === 1) {
      showMessage(
        "At least one question is required.",
        "warning"
      );

      return;
    }

    setQuestions((previousQuestions) =>
      previousQuestions.filter(
        (_, questionIndex) => questionIndex !== index
      )
    );
  };

  const resetForm = () => {
    setFormData(initialForm);
    setQuestions([""]);
    setAttachment(null);
    setEditingId(null);

    const fileInput = document.getElementById(
      "assignmentAttachment"
    );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    if (!formData.subjectName.trim()) {
      showMessage("Subject name is required.", "warning");
      return false;
    }

    if (!formData.subjectCode.trim()) {
      showMessage("Subject code is required.", "warning");
      return false;
    }

    if (!formData.title.trim()) {
      showMessage("Assignment title is required.", "warning");
      return false;
    }

    const validQuestions = questions.filter(
      (question) => question.trim() !== ""
    );

    if (validQuestions.length === 0) {
      showMessage(
        "Add at least one assignment question.",
        "warning"
      );

      return false;
    }

    if (!formData.submissionDate) {
      showMessage("Submission date is required.", "warning");
      return false;
    }

    if (
      formData.assignmentScope === "specific-section" &&
      !formData.section.trim()
    ) {
      showMessage("Section is required.", "warning");
      return false;
    }

    if (
      !formData.maximumMarks ||
      Number(formData.maximumMarks) < 1
    ) {
      showMessage(
        "Maximum marks must be greater than zero.",
        "warning"
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const validQuestions = questions
        .filter((question) => question.trim() !== "")
        .map((question) => ({
          questionText: question.trim(),
        }));

      const assignmentFormData = new FormData();

      assignmentFormData.append("teacherId", teacherId);
      assignmentFormData.append(
        "subjectName",
        formData.subjectName.trim()
      );
      assignmentFormData.append(
        "subjectCode",
        formData.subjectCode.trim()
      );
      assignmentFormData.append(
        "title",
        formData.title.trim()
      );
      assignmentFormData.append(
        "description",
        formData.description.trim()
      );
      assignmentFormData.append(
        "semester",
        formData.semester
      );
      assignmentFormData.append(
        "assignmentScope",
        formData.assignmentScope
      );
      assignmentFormData.append(
        "section",
        formData.assignmentScope === "all-sections"
          ? "ALL"
          : formData.section.trim()
      );
      assignmentFormData.append(
        "submissionDate",
        formData.submissionDate
      );
      assignmentFormData.append(
        "maximumMarks",
        formData.maximumMarks
      );
      assignmentFormData.append(
        "questions",
        JSON.stringify(validQuestions)
      );

      if (attachment) {
        assignmentFormData.append(
          "attachment",
          attachment
        );
      }

      const requestUrl = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const requestMethod = editingId ? "PUT" : "POST";

      const response = await fetch(requestUrl, {
        method: requestMethod,
        body: assignmentFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save assignment."
        );
      }

      showMessage(
        editingId
          ? "Assignment updated successfully."
          : "Assignment created successfully.",
        "success"
      );

      resetForm();
      await fetchAssignments();
    } catch (error) {
      console.error("Save assignment error:", error);
      showMessage(error.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment._id);

    setFormData({
      subjectName: assignment.subjectName || "",
      subjectCode: assignment.subjectCode || "",
      title: assignment.title || "",
      description: assignment.description || "",
      semester: String(assignment.semester || 1),
      assignmentScope:
        assignment.assignmentScope || "all-sections",
      section:
        assignment.assignmentScope === "all-sections"
          ? "ALL"
          : assignment.section || "",
      submissionDate: assignment.submissionDate
        ? new Date(assignment.submissionDate)
            .toISOString()
            .slice(0, 16)
        : "",
      maximumMarks: String(
        assignment.maximumMarks || ""
      ),
    });

    setQuestions(
      assignment.questions?.length
        ? assignment.questions.map(
            (question) => question.questionText
          )
        : [""]
    );

    setAttachment(null);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (assignmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/${assignmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacherId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete assignment."
        );
      }

      showMessage(
        data.message || "Assignment deleted successfully.",
        "success"
      );

      if (editingId === assignmentId) {
        resetForm();
      }

      await fetchAssignments();
    } catch (error) {
      console.error("Delete assignment error:", error);
      showMessage(error.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isExpired = (submissionDate) => {
    return new Date(submissionDate) < new Date();
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Teacher Assignments
          </h2>

          <p className="text-muted mb-0">
            Create and manage assignments for students.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() =>
            navigate("/teacher-dashboard")
          }
        >
          Back to Dashboard
        </button>
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
          />
        </div>
      )}

      <div className="card border-0 shadow-sm mb-5">
        <div className="card-header bg-primary text-white py-3">
          <h5 className="mb-0">
            {editingId
              ? "Edit Assignment"
              : "Create New Assignment"}
          </h5>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label
                  htmlFor="subjectName"
                  className="form-label"
                >
                  Subject Name
                </label>

                <input
                  id="subjectName"
                  type="text"
                  name="subjectName"
                  className="form-control"
                  value={formData.subjectName}
                  onChange={handleChange}
                  placeholder="Database Management System"
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="subjectCode"
                  className="form-label"
                >
                  Subject Code
                </label>

                <input
                  id="subjectCode"
                  type="text"
                  name="subjectCode"
                  className="form-control text-uppercase"
                  value={formData.subjectCode}
                  onChange={handleChange}
                  placeholder="21AI45"
                  required
                />
              </div>

              <div className="col-md-8">
                <label
                  htmlFor="title"
                  className="form-label"
                >
                  Assignment Title
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="DBMS Assignment 1"
                  required
                />
              </div>

              <div className="col-md-4">
                <label
                  htmlFor="maximumMarks"
                  className="form-label"
                >
                  Maximum Marks
                </label>

                <input
                  id="maximumMarks"
                  type="number"
                  name="maximumMarks"
                  className="form-control"
                  value={formData.maximumMarks}
                  onChange={handleChange}
                  min="1"
                  placeholder="20"
                  required
                />
              </div>

              <div className="col-12">
                <label
                  htmlFor="description"
                  className="form-label"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Answer all questions clearly."
                />
              </div>

              <div className="col-md-4">
                <label
                  htmlFor="semester"
                  className="form-label"
                >
                  Semester
                </label>

                <select
                  id="semester"
                  name="semester"
                  className="form-select"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(
                    (semester) => (
                      <option
                        key={semester}
                        value={semester}
                      >
                        Semester {semester}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="col-md-4">
                <label
                  htmlFor="assignmentScope"
                  className="form-label"
                >
                  Assignment Scope
                </label>

                <select
                  id="assignmentScope"
                  name="assignmentScope"
                  className="form-select"
                  value={formData.assignmentScope}
                  onChange={handleChange}
                >
                  <option value="all-sections">
                    All Sections
                  </option>

                  <option value="specific-section">
                    Specific Section
                  </option>
                </select>
              </div>

              <div className="col-md-4">
                <label
                  htmlFor="section"
                  className="form-label"
                >
                  Section
                </label>

                <select
                  id="section"
                  name="section"
                  className="form-select"
                  value={formData.section}
                  onChange={handleChange}
                  disabled={
                    formData.assignmentScope ===
                    "all-sections"
                  }
                  required={
                    formData.assignmentScope ===
                    "specific-section"
                  }
                >
                  {formData.assignmentScope ===
                    "all-sections" && (
                    <option value="ALL">
                      All Sections
                    </option>
                  )}

                  {formData.assignmentScope ===
                    "specific-section" && (
                    <>
                      <option value="">
                        Select section
                      </option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </>
                  )}
                </select>
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="submissionDate"
                  className="form-label"
                >
                  Submission Date and Time
                </label>

                <input
                  id="submissionDate"
                  type="datetime-local"
                  name="submissionDate"
                  className="form-control"
                  value={formData.submissionDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="assignmentAttachment"
                  className="form-label"
                >
                  Attachment
                </label>

                <input
                  id="assignmentAttachment"
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    setAttachment(
                      event.target.files?.[0] || null
                    )
                  }
                />

                <small className="text-muted">
                  PDF, Word or image. Maximum 10 MB.
                </small>
              </div>
            </div>

            <hr className="my-4" />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                Assignment Questions
              </h5>

              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={addQuestionField}
              >
                + Add Question
              </button>
            </div>

            {questions.map((question, index) => (
              <div
                className="row g-2 align-items-start mb-3"
                key={`question-${index}`}
              >
                <div className="col">
                  <label
                    htmlFor={`question-${index}`}
                    className="form-label"
                  >
                    Question {index + 1}
                  </label>

                  <textarea
                    id={`question-${index}`}
                    className="form-control"
                    rows="2"
                    value={question}
                    onChange={(event) =>
                      handleQuestionChange(
                        index,
                        event.target.value
                      )
                    }
                    placeholder={`Enter question ${
                      index + 1
                    }`}
                  />
                </div>

                <div className="col-auto mt-4 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() =>
                      removeQuestionField(index)
                    }
                    disabled={questions.length === 1}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update Assignment"
                    : "Create Assignment"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="fw-bold">Created Assignments</h3>
        <p className="text-muted">
          Total assignments: {assignments.length}
        </p>
      </div>

      {fetching ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="mt-3 text-muted">
            Loading assignments...
          </p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="alert alert-info">
          You have not created any assignments yet.
        </div>
      ) : (
        <div className="row g-4">
          {assignments.map((assignment) => (
            <div
              className="col-lg-6"
              key={assignment._id}
            >
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">
                        {assignment.title}
                      </h5>

                      <p className="text-primary mb-0">
                        {assignment.subjectName} (
                        {assignment.subjectCode})
                      </p>
                    </div>

                    <span
                      className={`badge ${
                        isExpired(
                          assignment.submissionDate
                        )
                          ? "bg-danger"
                          : "bg-success"
                      }`}
                    >
                      {isExpired(
                        assignment.submissionDate
                      )
                        ? "Closed"
                        : "Active"}
                    </span>
                  </div>

                  <p className="text-muted">
                    {assignment.description ||
                      "No description provided."}
                  </p>

                  <div className="row g-2 small mb-3">
                    <div className="col-6">
                      <strong>Semester:</strong>{" "}
                      {assignment.semester}
                    </div>

                    <div className="col-6">
                      <strong>Section:</strong>{" "}
                      {assignment.section}
                    </div>

                    <div className="col-12">
                      <strong>Deadline:</strong>{" "}
                      {formatDate(
                        assignment.submissionDate
                      )}
                    </div>

                    <div className="col-6">
                      <strong>Marks:</strong>{" "}
                      {assignment.maximumMarks}
                    </div>

                    <div className="col-6">
                      <strong>Questions:</strong>{" "}
                      {assignment.questions?.length || 0}
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Questions</strong>

                    <ol className="mt-2 mb-0">
                      {assignment.questions?.map(
                        (question) => (
                          <li
                            key={question._id}
                            className="mb-1"
                          >
                            {question.questionText}
                          </li>
                        )
                      )}
                    </ol>
                  </div>

                  {assignment.attachment && (
                    <a
                      href={`http://localhost:5000${assignment.attachment}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-info btn-sm mb-3"
                    >
                      View Attachment
                    </a>
                  )}

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        handleEdit(assignment)
                      }
                      disabled={loading}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(assignment._id)
                      }
                      disabled={loading}
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        navigate(
                          `/teacher-assignments/${assignment._id}/submissions`
                        )
                      }
                    >
                      View Submissions
                    </button>
                  </div>
                </div>

                <div className="card-footer bg-white text-muted small">
                  Created:{" "}
                  {formatDate(assignment.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherAssignments;