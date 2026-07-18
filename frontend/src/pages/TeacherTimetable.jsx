import { useEffect, useState } from "react";
import {
  addTimetableClass,
  deleteTimetableClass,
  getTimetable,
  updateTimetableClass,
} from "../services/timetableService";

const initialForm = {
  semester: "1",
  section: "A",
  day: "Monday",
  subjectName: "",
  subjectCode: "",
  teacherName: "",
  startTime: "",
  endTime: "",
  room: "",
  classType: "Theory",
};

function TeacherTimetable() {
  const [formData, setFormData] = useState(initialForm);
  const [timetables, setTimetables] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const fetchTimetable = async () => {
    try {
      const data = await getTimetable(
        formData.semester,
        formData.section,
        formData.day
      );

      setTimetables(data.timetables || []);
    } catch (error) {
      setMessage(error.message);
      setMessageType("danger");
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [formData.semester, formData.section, formData.day]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData((previousData) => ({
      ...initialForm,
      semester: previousData.semester,
      section: previousData.section,
      day: previousData.day,
    }));

    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      if (editingId) {
        const data = await updateTimetableClass(editingId, formData);
        setMessage(data.message);
      } else {
        const data = await addTimetableClass(formData);
        setMessage(data.message);
      }

      setMessageType("success");
      resetForm();
      await fetchTimetable();
    } catch (error) {
      setMessage(error.message);
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
      subjectCode: timetable.subjectCode,
      teacherName: timetable.teacherName,
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
      "Are you sure you want to delete this timetable class?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await deleteTimetableClass(id);

      setMessage(data.message);
      setMessageType("success");

      await fetchTimetable();
    } catch (error) {
      setMessage(error.message);
      setMessageType("danger");
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="text-center mb-4">
          <span className="badge bg-primary-subtle text-primary px-3 py-2 mb-2">
            Teacher Panel
          </span>

          <h1 className="fw-bold">Timetable Management</h1>

          <p className="text-muted">
            Add, update and remove timetable classes.
          </p>
        </div>

        {message && (
          <div
            className={`alert alert-${messageType} alert-dismissible fade show`}
          >
            {message}

            <button
              type="button"
              className="btn-close"
              onClick={() => setMessage("")}
            />
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4 mb-5">
          <div className="card-header bg-primary text-white rounded-top-4 py-3">
            <h5 className="mb-0">
              {editingId ? "Update Timetable Class" : "Add Timetable Class"}
            </h5>
          </div>

          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Semester</label>

                  <select
                    className="form-select"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Section</label>

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

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Day</label>

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

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Subject Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleChange}
                    placeholder="Database Management System"
                    required
                  />
                </div>

                <div className="col-md-3">
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
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Class Type</label>

                  <select
                    className="form-select"
                    name="classType"
                    value={formData.classType}
                    onChange={handleChange}
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Teacher Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="teacherName"
                    value={formData.teacherName}
                    onChange={handleChange}
                    placeholder="Enter teacher name"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Room</label>

                  <input
                    type="text"
                    className="form-control"
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    placeholder="Room 302 or AIML Lab"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Start Time</label>

                  <input
                    type="time"
                    className="form-control"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">End Time</label>

                  <input
                    type="time"
                    className="form-control"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 d-flex flex-wrap gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingId
                      ? "Update Class"
                      : "Save Class"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
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

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-header bg-white border-0 p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h4 className="fw-bold mb-1">{formData.day} Timetable</h4>

                <p className="text-muted mb-0">
                  Semester {formData.semester} · Section {formData.section}
                </p>
              </div>

              <span className="badge bg-primary rounded-pill px-3 py-2">
                {timetables.length} Classes
              </span>
            </div>
          </div>

          <div className="card-body p-0">
            {timetables.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-5 mb-3">🕒</div>

                <h5>No timetable classes found</h5>

                <p className="text-muted">
                  Add the first class using the form above.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4">Time</th>
                      <th>Subject</th>
                      <th>Teacher</th>
                      <th>Room</th>
                      <th>Type</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {timetables.map((timetable) => (
                      <tr key={timetable._id}>
                        <td className="px-4 fw-semibold">
                          {timetable.startTime} - {timetable.endTime}
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {timetable.subjectName}
                          </div>

                          <small className="text-muted">
                            {timetable.subjectCode}
                          </small>
                        </td>

                        <td>{timetable.teacherName}</td>

                        <td>{timetable.room}</td>

                        <td>
                          <span
                            className={`badge ${
                              timetable.classType === "Lab"
                                ? "bg-success"
                                : timetable.classType === "Tutorial"
                                ? "bg-warning text-dark"
                                : "bg-primary"
                            }`}
                          >
                            {timetable.classType}
                          </span>
                        </td>

                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(timetable)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(timetable._id)}
                          >
                            Delete
                          </button>
                        </td>
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