import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TeacherAttendance() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("teacherToken") ||
    sessionStorage.getItem("teacherToken");

  const loggedInTeacher = useMemo(() => {
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

  const [formData, setFormData] = useState({
    subjectName: "",
    subjectCode: "",
    semester: "",
    section: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [subjectId, setSubjectId] = useState("");
  const [students, setStudents] = useState([]);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (!token || !loggedInTeacher) {
      navigate("/teacher-login", {
        replace: true,
      });
    }
  }, [token, loggedInTeacher, navigate]);

  const teacherId =
    loggedInTeacher?.teacherId ||
    loggedInTeacher?.id ||
    loggedInTeacher?._id ||
    "";

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Clear previous class data when class fields change
    if (
      name === "subjectName" ||
      name === "subjectCode" ||
      name === "semester" ||
      name === "section"
    ) {
      setSubjectId("");
      setStudents([]);
    }

    setMessage("");
    setMessageType("");
  };

  const validateClassDetails = () => {
    if (!teacherId) {
      setMessage(
        "Teacher login information is missing. Please logout and login again."
      );
      setMessageType("danger");
      return false;
    }

    if (!formData.subjectName.trim()) {
      setMessage("Please enter Subject Name.");
      setMessageType("danger");
      return false;
    }

    if (!formData.subjectCode.trim()) {
      setMessage("Please enter Subject Code.");
      setMessageType("danger");
      return false;
    }

    if (!formData.semester) {
      setMessage("Please select Semester.");
      setMessageType("danger");
      return false;
    }

    if (!formData.section) {
      setMessage("Please select Section.");
      setMessageType("danger");
      return false;
    }

    if (!formData.date) {
      setMessage("Please select Attendance Date.");
      setMessageType("danger");
      return false;
    }

    return true;
  };

  const fetchClassDetails = async () => {
    if (!validateClassDetails()) {
      return;
    }

    try {
      setLoadingStudents(true);
      setStudents([]);
      setSubjectId("");
      setMessage("");
      setMessageType("");

      const response = await axios.get(
        "http://localhost:5000/api/attendance/class-details",
        {
          params: {
            subjectName: formData.subjectName.trim(),
            subjectCode: formData.subjectCode.trim(),
            semester: Number(formData.semester),
            section: formData.section.trim().toUpperCase(),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedSubjectId =
        response.data.subjectId ||
        response.data.subject?.id ||
        response.data.subject?._id ||
        "";

      const studentList = response.data.students || [];

      if (!fetchedSubjectId) {
        setMessage(
          "Subject was found, but Subject ID was not returned by the backend."
        );
        setMessageType("danger");
        return;
      }

      const formattedStudents = Array.isArray(studentList)
        ? studentList.map((student) => ({
            ...student,
            status: "Present",
          }))
        : [];

      setSubjectId(fetchedSubjectId);
      setStudents(formattedStudents);

      if (formattedStudents.length === 0) {
        setMessage(
          `Subject found, but no students are registered for Semester ${formData.semester}, Section ${formData.section}.`
        );
        setMessageType("warning");
      } else {
        setMessage(
          `${formattedStudents.length} students loaded successfully.`
        );
        setMessageType("success");
      }
    } catch (error) {
      console.error("Fetch class details error:", error);
      console.error(
        "Backend response:",
        error.response?.data
      );

      setStudents([]);
      setSubjectId("");

      if (!error.response) {
        setMessage(
          "Cannot connect to the backend. Make sure the backend is running on port 5000."
        );
      } else {
        setMessage(
          error.response?.data?.message ||
            "Unable to load class details."
        );
      }

      setMessageType("danger");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (
    studentId,
    newStatus
  ) => {
    setStudents((previousStudents) =>
      previousStudents.map((student) =>
        (student._id || student.id) === studentId
          ? {
              ...student,
              status: newStatus,
            }
          : student
      )
    );
  };

  const markAllStudents = (status) => {
    setStudents((previousStudents) =>
      previousStudents.map((student) => ({
        ...student,
        status,
      }))
    );
  };

  const handleSaveAttendance = async () => {
    setMessage("");
    setMessageType("");

    if (!validateClassDetails()) {
      return;
    }

    if (!subjectId) {
      setMessage(
        "Subject ID is not loaded. Click Load Students first."
      );
      setMessageType("danger");
      return;
    }

    if (students.length === 0) {
      setMessage(
        "No students are loaded. Click Load Students first."
      );
      setMessageType("danger");
      return;
    }

    const invalidStudent = students.find(
      (student) => !(student._id || student.id)
    );

    if (invalidStudent) {
      setMessage(
        "One or more student IDs are missing. Reload the students."
      );
      setMessageType("danger");
      return;
    }

    try {
      setSaving(true);

      const attendanceData = {
        teacher: teacherId,
        subject: subjectId,
        semester: Number(formData.semester),
        section: formData.section.trim().toUpperCase(),
        date: formData.date,

        attendance: students.map((student) => ({
          student: student._id || student.id,
          status: student.status,
        })),
      };

      console.log(
        "Attendance payload:",
        attendanceData
      );

      const response = await axios.post(
        "http://localhost:5000/api/attendance",
        attendanceData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Attendance saved successfully."
      );

      setMessageType("success");
    } catch (error) {
      console.error("Save attendance error:", error);
      console.error(
        "Backend response:",
        error.response?.data
      );

      if (!error.response) {
        setMessage(
          "Cannot connect to the backend. Make sure the backend is running."
        );
      } else {
        setMessage(
          error.response?.data?.message ||
            "Unable to save attendance."
        );
      }

      setMessageType("danger");
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      subjectName: "",
      subjectCode: "",
      semester: "",
      section: "",
      date: new Date().toISOString().split("T")[0],
    });

    setSubjectId("");
    setStudents([]);
    setMessage("");
    setMessageType("");
  };

  if (!token || !loggedInTeacher) {
    return null;
  }

  const presentCount = students.filter(
    (student) => student.status === "Present"
  ).length;

  const absentCount = students.filter(
    (student) => student.status === "Absent"
  ).length;

  const lateCount = students.filter(
    (student) => student.status === "Late"
  ).length;

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-lg rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="bg-primary text-white p-4 p-md-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <p className="text-white-50 fw-semibold mb-1">
                  Teacher Attendance Portal
                </p>

                <h2 className="fw-bold mb-2">
                  Mark Student Attendance
                </h2>

                <p className="mb-0 text-white-50">
                  Enter subject and class details. Teacher ID,
                  Subject ID and student IDs are fetched
                  automatically.
                </p>
              </div>

              <div className="bg-white bg-opacity-10 rounded-4 p-3">
                <small className="d-block text-white-50">
                  Logged-in Teacher
                </small>

                <strong>
                  {loggedInTeacher.name || "Teacher"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`alert alert-${messageType} text-center shadow-sm`}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1">
                Attendance Details
              </h4>

              <p className="text-muted mb-0">
                Enter subject name, subject code, semester and
                section.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleResetForm}
              disabled={loadingStudents || saving}
            >
              Reset Form
            </button>
          </div>

          <div className="alert alert-light border mb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <small className="text-muted d-block">
                  Teacher Name
                </small>

                <strong>
                  {loggedInTeacher.name || "Not available"}
                </strong>
              </div>

              <div className="col-md-6">
                <small className="text-muted d-block">
                  Teacher ID — Automatic
                </small>

                <strong className="text-break">
                  {teacherId || "Not available"}
                </strong>
              </div>

              {subjectId && (
                <div className="col-12">
                  <small className="text-muted d-block">
                    Subject ID — Automatic
                  </small>

                  <strong className="text-break text-success">
                    {subjectId}
                  </strong>
                </div>
              )}
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <label
                htmlFor="subjectName"
                className="form-label fw-semibold"
              >
                Subject Name
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  📚
                </span>

                <input
                  id="subjectName"
                  type="text"
                  name="subjectName"
                  className="form-control"
                  placeholder="Example: Redux"
                  value={formData.subjectName}
                  onChange={handleInputChange}
                  disabled={loadingStudents || saving}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <label
                htmlFor="subjectCode"
                className="form-label fw-semibold"
              >
                Subject Code
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  🔖
                </span>

                <input
                  id="subjectCode"
                  type="text"
                  name="subjectCode"
                  className="form-control"
                  placeholder="Example: 21009"
                  value={formData.subjectCode}
                  onChange={handleInputChange}
                  disabled={loadingStudents || saving}
                  required
                />
              </div>
            </div>

            <div className="col-md-4">
              <label
                htmlFor="semester"
                className="form-label fw-semibold"
              >
                Semester
              </label>

              <select
                id="semester"
                name="semester"
                className="form-select"
                value={formData.semester}
                onChange={handleInputChange}
                disabled={loadingStudents || saving}
                required
              >
                <option value="">
                  Select Semester
                </option>

                {[1, 2, 3, 4, 5, 6, 7, 8].map(
                  (semesterNumber) => (
                    <option
                      key={semesterNumber}
                      value={semesterNumber}
                    >
                      Semester {semesterNumber}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="col-md-4">
              <label
                htmlFor="section"
                className="form-label fw-semibold"
              >
                Section
              </label>

              <select
                id="section"
                name="section"
                className="form-select"
                value={formData.section}
                onChange={handleInputChange}
                disabled={loadingStudents || saving}
                required
              >
                <option value="">
                  Select Section
                </option>

                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div className="col-md-4">
              <label
                htmlFor="attendanceDate"
                className="form-label fw-semibold"
              >
                Attendance Date
              </label>

              <input
                id="attendanceDate"
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleInputChange}
                max={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                disabled={loadingStudents || saving}
                required
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg w-100 mt-4"
            onClick={fetchClassDetails}
            disabled={loadingStudents || saving}
          >
            {loadingStudents ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Loading Class Details...
              </>
            ) : (
              "Load Students"
            )}
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 bg-success text-white rounded-4 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="fs-2 mb-2">✅</div>

                  <h2 className="fw-bold mb-1">
                    {presentCount}
                  </h2>

                  <p className="mb-0">Present</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 bg-danger text-white rounded-4 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="fs-2 mb-2">❌</div>

                  <h2 className="fw-bold mb-1">
                    {absentCount}
                  </h2>

                  <p className="mb-0">Absent</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 bg-warning text-dark rounded-4 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="fs-2 mb-2">⏰</div>

                  <h2 className="fw-bold mb-1">
                    {lateCount}
                  </h2>

                  <p className="mb-0">Late</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">
                    Student Attendance
                  </h4>

                  <p className="text-muted mb-0">
                    {formData.subjectName} ·{" "}
                    {formData.subjectCode} · Semester{" "}
                    {formData.semester} · Section{" "}
                    {formData.section}
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={() =>
                      markAllStudents("Present")
                    }
                    disabled={saving}
                  >
                    Mark All Present
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() =>
                      markAllStudents("Absent")
                    }
                    disabled={saving}
                  >
                    Mark All Absent
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm"
                    onClick={() =>
                      markAllStudents("Late")
                    }
                    disabled={saving}
                  >
                    Mark All Late
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Semester</th>
                      <th>Section</th>
                      <th className="text-center">
                        Attendance Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student, index) => {
                      const studentId =
                        student._id || student.id;

                      return (
                        <tr key={studentId}>
                          <td>{index + 1}</td>

                          <td className="fw-semibold">
                            {student.name || "Student"}
                          </td>

                          <td>{student.email || "-"}</td>

                          <td>{student.semester || "-"}</td>

                          <td>{student.section || "-"}</td>

                          <td>
                            <div className="d-flex flex-wrap justify-content-center gap-2">
                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  student.status ===
                                  "Present"
                                    ? "btn-success"
                                    : "btn-outline-success"
                                }`}
                                onClick={() =>
                                  handleStatusChange(
                                    studentId,
                                    "Present"
                                  )
                                }
                                disabled={saving}
                              >
                                Present
                              </button>

                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  student.status ===
                                  "Absent"
                                    ? "btn-danger"
                                    : "btn-outline-danger"
                                }`}
                                onClick={() =>
                                  handleStatusChange(
                                    studentId,
                                    "Absent"
                                  )
                                }
                                disabled={saving}
                              >
                                Absent
                              </button>

                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  student.status === "Late"
                                    ? "btn-warning"
                                    : "btn-outline-warning"
                                }`}
                                onClick={() =>
                                  handleStatusChange(
                                    studentId,
                                    "Late"
                                  )
                                }
                                disabled={saving}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className="btn btn-success btn-lg w-100 mt-3"
                onClick={handleSaveAttendance}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving Attendance...
                  </>
                ) : (
                  "Save Attendance"
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {!loadingStudents &&
        students.length === 0 && (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body text-center py-5">
              <div className="display-5 mb-3">
                👨‍🎓
              </div>

              <h5 className="fw-bold">
                No students loaded
              </h5>

              <p className="text-muted mb-0">
                Enter subject name, subject code, semester
                and section, then click Load Students.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}

export default TeacherAttendance;

