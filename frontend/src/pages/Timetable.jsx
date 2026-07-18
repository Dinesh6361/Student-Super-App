import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStudentTimetable } from "../services/timetableService";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const timeSlots = [
  {
    startTime: "09:00",
    label: "9:00 – 10:00 AM",
  },
  {
    startTime: "10:00",
    label: "10:00 – 11:00 AM",
  },
  {
    startTime: "11:00",
    label: "11:00 – 11:15 AM",
  },
  {
    startTime: "11:15",
    label: "11:15 – 12:15 PM",
  },
  {
    startTime: "12:15",
    label: "12:15 – 1:15 PM",
  },
  {
    startTime: "13:15",
    label: "1:15 – 2:00 PM",
  },
  {
    startTime: "14:00",
    label: "2:00 – 3:00 PM",
  },
  {
    startTime: "15:00",
    label: "3:00 – 4:00 PM",
  },
];

const getStoredStudent = () => {
  try {
    const storedStudent =
      localStorage.getItem("student") ||
      localStorage.getItem("user") ||
      sessionStorage.getItem("student") ||
      sessionStorage.getItem("user");

    return storedStudent ? JSON.parse(storedStudent) : null;
  } catch (error) {
    console.error("Unable to read student:", error);
    return null;
  }
};

function Timetable() {
  const navigate = useNavigate();

  const student = useMemo(() => getStoredStudent(), []);

  const [semester, setSemester] = useState(
    String(student?.semester || 1)
  );

  const [section, setSection] = useState(
    student?.section || "A"
  );

  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchStudentTimetable = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getStudentTimetable(
        semester,
        section
      );

      setTimetables(data.timetables || []);
    } catch (error) {
      setTimetables([]);
      setMessage(
        error.message || "Unable to load timetable."
      );
    } finally {
      setLoading(false);
    }
  }, [semester, section]);

  useEffect(() => {
  const timer = setTimeout(() => {
    fetchStudentTimetable();
  }, 0);

  return () => clearTimeout(timer);
}, [fetchStudentTimetable]);

  const getClassForCell = (startTime, day) => {
    return timetables.find(
      (item) =>
        item.startTime === startTime &&
        item.day === day
    );
  };

  const getCellClassName = (item) => {
    if (!item) {
      return "";
    }

    const name = item.subjectName.toLowerCase();

    if (name.includes("break")) {
      return "bg-warning-subtle";
    }

    if (
      name.includes("lab") ||
      name.includes("project")
    ) {
      return "bg-success-subtle";
    }

    if (
      name.includes("sports") ||
      name.includes("library")
    ) {
      return "bg-info-subtle";
    }

    return "bg-primary-subtle";
  };

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container-fluid px-3 px-md-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <span className="badge bg-primary-subtle text-primary px-3 py-2 mb-2">
              Student Dashboard
            </span>

            <h1 className="fw-bold mb-1">
              Class Timetable
            </h1>

            <p className="text-muted mb-0">
              View your complete weekly class schedule.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Semester
                </label>

                <select
                  className="form-select"
                  value={semester}
                  onChange={(event) =>
                    setSemester(event.target.value)
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(
                    (item) => (
                      <option key={item} value={item}>
                        Semester {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Section
                </label>

                <select
                  className="form-select"
                  value={section}
                  onChange={(event) =>
                    setSection(event.target.value)
                  }
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div className="col-md-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={fetchStudentTimetable}
                >
                  Refresh Timetable
                </button>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="alert alert-danger">
            {message}
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-primary text-white p-4">
            <h3 className="fw-bold mb-1">
              Weekly Class Timetable
            </h3>

            <p className="mb-0 opacity-75">
              Semester {semester} · Section {section}
            </p>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />

                <p className="text-muted mt-3">
                  Loading timetable...
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle text-center mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th
                        className="py-3"
                        style={{ minWidth: "160px" }}
                      >
                        Time
                      </th>

                      {days.map((day) => (
                        <th
                          key={day}
                          className="py-3"
                          style={{ minWidth: "180px" }}
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {timeSlots.map((slot) => (
                      <tr key={slot.startTime}>
                        <th className="table-light text-nowrap">
                          {slot.label}
                        </th>

                        {days.map((day) => {
                          const timetable = getClassForCell(
                            slot.startTime,
                            day
                          );

                          return (
                            <td
                              key={`${slot.startTime}-${day}`}
                              className={`p-3 ${getCellClassName(
                                timetable
                              )}`}
                            >
                              {timetable ? (
                                <>
                                  <div className="fw-bold">
                                    {timetable.subjectName}
                                  </div>

                                  {!timetable.subjectName
                                    .toLowerCase()
                                    .includes("break") && (
                                    <>
                                      <small className="d-block text-muted mt-1">
                                        {timetable.teacherName}
                                      </small>

                                      <small className="d-block text-muted">
                                        {timetable.room}
                                      </small>
                                    </>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted">
                                  No class
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timetable;