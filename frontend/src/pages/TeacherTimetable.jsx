import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  addTimetableClass,
  deleteTimetableClass,
  getTimetable,
  updateTimetableClass,
} from "../services/timetableService";

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
    endTime: "10:00",
    label: "9:00 – 10:00 AM",
  },
  {
    startTime: "10:00",
    endTime: "11:00",
    label: "10:00 – 11:00 AM",
  },
  {
    startTime: "11:00",
    endTime: "11:15",
    label: "11:00 – 11:15 AM",
  },
  {
    startTime: "11:15",
    endTime: "12:15",
    label: "11:15 – 12:15 PM",
  },
  {
    startTime: "12:15",
    endTime: "13:15",
    label: "12:15 – 1:15 PM",
  },
  {
    startTime: "13:15",
    endTime: "14:00",
    label: "1:15 – 2:00 PM",
  },
  {
    startTime: "14:00",
    endTime: "15:00",
    label: "2:00 – 3:00 PM",
  },
  {
    startTime: "15:00",
    endTime: "16:00",
    label: "3:00 – 4:00 PM",
  },
];

const sampleTimetable = {
  "09:00": {
    Monday: "Artificial Intelligence",
    Tuesday: "Data Structures",
    Wednesday: "Database Management System",
    Thursday: "Machine Learning",
    Friday: "Operating Systems",
    Saturday: "Aptitude",
  },

  "10:00": {
    Monday: "Database Management System",
    Tuesday: "Artificial Intelligence",
    Wednesday: "Computer Networks",
    Thursday: "Data Structures",
    Friday: "Machine Learning",
    Saturday: "Coding Practice",
  },

  "11:00": {
    Monday: "Short Break",
    Tuesday: "Short Break",
    Wednesday: "Short Break",
    Thursday: "Short Break",
    Friday: "Short Break",
    Saturday: "Short Break",
  },

  "11:15": {
    Monday: "Computer Networks",
    Tuesday: "Machine Learning",
    Wednesday: "Artificial Intelligence",
    Thursday: "Database Management System",
    Friday: "Data Structures",
    Saturday: "Mini Project",
  },

  "12:15": {
    Monday: "Operating Systems",
    Tuesday: "Computer Networks",
    Wednesday: "Operating Systems",
    Thursday: "Artificial Intelligence",
    Friday: "Database Management System",
    Saturday: "Seminar",
  },

  "13:15": {
    Monday: "Lunch Break",
    Tuesday: "Lunch Break",
    Wednesday: "Lunch Break",
    Thursday: "Lunch Break",
    Friday: "Lunch Break",
    Saturday: "Lunch Break",
  },

  "14:00": {
    Monday: "AI Lab",
    Tuesday: "DBMS Lab",
    Wednesday: "ML Lab",
    Thursday: "CN Lab",
    Friday: "Project Work",
    Saturday: "Sports",
  },

  "15:00": {
    Monday: "AI Lab",
    Tuesday: "DBMS Lab",
    Wednesday: "ML Lab",
    Thursday: "CN Lab",
    Friday: "Project Work",
    Saturday: "Library",
  },
};

const initialForm = {
  semester: "1",
  section: "A",
  day: "Monday",
  subjectName: "",
  subjectCode: "",
  teacherName: "",
  startTime: "09:00",
  endTime: "10:00",
  room: "",
  classType: "Theory",
};

function TeacherTimetable() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [timetables, setTimetables] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  const fetchTimetable = useCallback(async () => {
    try {
      setFetching(true);

      const data = await getTimetable(
        formData.semester,
        formData.section
      );

      setTimetables(data.timetables || []);
    } catch (error) {
      setMessage(error.message || "Unable to fetch timetable.");
      setMessageType("danger");
      setTimetables([]);
    } finally {
      setFetching(false);
    }
  }, [formData.semester, formData.section]);

 useEffect(() => {
  const timer = setTimeout(() => {
    fetchTimetable();
  }, 0);

  return () => clearTimeout(timer);
}, [fetchTimetable]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => {
      const updatedData = {
        ...previousData,
        [name]: value,
      };

      if (name === "startTime") {
        const selectedSlot = timeSlots.find(
          (slot) => slot.startTime === value
        );

        if (selectedSlot) {
          updatedData.endTime = selectedSlot.endTime;
        }
      }

      return updatedData;
    });

    setMessage("");
  };

  const resetForm = () => {
    setFormData((previousData) => ({
      ...initialForm,
      semester: previousData.semester,
      section: previousData.section,
    }));

    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.subjectName.trim()) {
      setMessage("Please enter subject or activity name.");
      setMessageType("danger");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const isBreak =
        formData.subjectName.toLowerCase().includes("break");

      const timetableData = {
        ...formData,
        semester: Number(formData.semester),
        section: formData.section.toUpperCase(),
        subjectName: formData.subjectName.trim(),

        subjectCode:
          formData.subjectCode.trim().toUpperCase() ||
          (isBreak ? "BREAK" : "GENERAL"),

        teacherName:
          formData.teacherName.trim() ||
          (isBreak ? "Not required" : "Faculty"),

        room:
          formData.room.trim() ||
          (isBreak ? "Not required" : "Not assigned"),
      };

      let data;

      if (editingId) {
        data = await updateTimetableClass(
          editingId,
          timetableData
        );
      } else {
        data = await addTimetableClass(timetableData);
      }

      setMessage(data.message);
      setMessageType("success");

      resetForm();
      await fetchTimetable();
    } catch (error) {
      setMessage(error.message || "Unable to save timetable.");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (timetable) => {
    setEditingId(timetable._id);

    setFormData({
      semester: String(timetable.semester),
      section: timetable.section,
      day: timetable.day,
      subjectName: timetable.subjectName,
      subjectCode: timetable.subjectCode || "",
      teacherName: timetable.teacherName || "",
      startTime: timetable.startTime,
      endTime: timetable.endTime,
      room: timetable.room || "",
      classType: timetable.classType || "Theory",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await deleteTimetableClass(id);

      setMessage(data.message);
      setMessageType("success");

      if (editingId === id) {
        resetForm();
      }

      await fetchTimetable();
    } catch (error) {
      setMessage(error.message || "Unable to delete timetable.");
      setMessageType("danger");
    }
  };

  const getClassForCell = (startTime, day) => {
    return timetables.find(
      (item) =>
        item.startTime === startTime &&
        item.day === day
    );
  };

  const handleAddInCell = (day, timeSlot) => {
    setEditingId(null);

    setFormData((previousData) => ({
      ...initialForm,
      semester: previousData.semester,
      section: previousData.section,
      day,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    }));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const loadSampleTimetable = async () => {
    const confirmed = window.confirm(
      "This will add the complete sample timetable. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingSample(true);
      setMessage("");

      for (const timeSlot of timeSlots) {
        for (const day of days) {
          const subjectName =
            sampleTimetable[timeSlot.startTime]?.[day];

          if (!subjectName) {
            continue;
          }

          const alreadyExists = timetables.some(
            (item) =>
              item.day === day &&
              item.startTime === timeSlot.startTime
          );

          if (alreadyExists) {
            continue;
          }

          const isBreak =
            subjectName === "Short Break" ||
            subjectName === "Lunch Break";

          const isLab =
            subjectName.includes("Lab") ||
            subjectName === "Project Work";

          await addTimetableClass({
            semester: Number(formData.semester),
            section: formData.section,
            day,
            subjectName,

            subjectCode: isBreak
              ? "BREAK"
              : subjectName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase(),

            teacherName: isBreak
              ? "Not required"
              : "Faculty",

            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,

            room: isBreak
              ? "Not required"
              : isLab
              ? "Lab"
              : "Classroom",

            classType: isLab ? "Lab" : "Theory",
          });
        }
      }

      setMessage("Sample timetable added successfully.");
      setMessageType("success");

      await fetchTimetable();
    } catch (error) {
      setMessage(
        error.message ||
          "Some timetable records could not be added."
      );
      setMessageType("danger");

      await fetchTimetable();
    } finally {
      setLoadingSample(false);
    }
  };

  const getCellClassName = (item) => {
    if (!item) {
      return "bg-light";
    }

    const subjectName = item.subjectName.toLowerCase();

    if (subjectName.includes("break")) {
      return "bg-warning-subtle";
    }

    if (
      subjectName.includes("lab") ||
      subjectName.includes("project")
    ) {
      return "bg-success-subtle";
    }

    if (
      subjectName.includes("sports") ||
      subjectName.includes("library")
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
              Teacher Dashboard
            </span>

            <h1 className="fw-bold mb-1">
              Class Timetable Management
            </h1>

            <p className="text-muted mb-0">
              Add, edit and delete the weekly class timetable.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-success"
              onClick={loadSampleTimetable}
              disabled={loadingSample}
            >
              {loadingSample
                ? "Adding Timetable..."
                : "Add Sample Timetable"}
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => navigate("/teacher-dashboard")}
            >
              ← Teacher Dashboard
            </button>
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
            />
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div className="card-header bg-primary text-white p-3">
            <h5 className="mb-0">
              {editingId
                ? "Edit Timetable Class"
                : "Add Timetable Class"}
            </h5>
          </div>

          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label fw-semibold">
                    Semester
                  </label>

                  <select
                    className="form-select"
                    name="semester"
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

                <div className="col-md-2">
                  <label className="form-label fw-semibold">
                    Section
                  </label>

                  <select
                    className="form-select"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold">
                    Day
                  </label>

                  <select
                    className="form-select"
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    required
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Start Time
                  </label>

                  <select
                    className="form-select"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  >
                    {timeSlots.map((slot) => (
                      <option
                        key={slot.startTime}
                        value={slot.startTime}
                      >
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    End Time
                  </label>

                  <input
                    type="time"
                    className="form-control"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-5">
                  <label className="form-label fw-semibold">
                    Subject / Activity
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleChange}
                    placeholder="Artificial Intelligence"
                    required
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold">
                    Subject Code
                  </label>

                  <input
                    type="text"
                    className="form-control text-uppercase"
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleChange}
                    placeholder="21AI45"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Teacher Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="teacherName"
                    value={formData.teacherName}
                    onChange={handleChange}
                    placeholder="Faculty name"
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold">
                    Room
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    placeholder="Room 101"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Class Type
                  </label>

                  <select
                    className="form-select"
                    name="classType"
                    value={formData.classType}
                    onChange={handleChange}
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">
                      Tutorial
                    </option>
                  </select>
                </div>

                <div className="col-md-9 d-flex align-items-end gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingId
                      ? "Update Class"
                      : "Add Class"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white border-0 p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h3 className="fw-bold mb-1">
                  Weekly Class Timetable
                </h3>

                <p className="text-muted mb-0">
                  Semester {formData.semester} · Section{" "}
                  {formData.section}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={fetchTimetable}
                disabled={fetching}
              >
                {fetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            {fetching ? (
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
                          style={{ minWidth: "190px" }}
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
                              className={`p-2 ${getCellClassName(
                                timetable
                              )}`}
                            >
                              {timetable ? (
                                <div>
                                  <div className="fw-bold mb-1">
                                    {timetable.subjectName}
                                  </div>

                                  {!timetable.subjectName
                                    .toLowerCase()
                                    .includes("break") && (
                                    <>
                                      <small className="d-block text-muted">
                                        {timetable.teacherName}
                                      </small>

                                      <small className="d-block text-muted mb-2">
                                        {timetable.room}
                                      </small>
                                    </>
                                  )}

                                  <div className="d-flex justify-content-center gap-1">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      onClick={() =>
                                        handleEdit(timetable)
                                      }
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={() =>
                                        handleDelete(
                                          timetable._id
                                        )
                                      }
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() =>
                                    handleAddInCell(day, slot)
                                  }
                                >
                                  + Add
                                </button>
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

export default TeacherTimetable;