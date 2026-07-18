import { useEffect, useState } from "react";
import axios from "axios";

function Attendance() {
  const [summary, setSummary] = useState({
    totalClasses: 0,
    presentClasses: 0,
    absentClasses: 0,
    lateClasses: 0,
    percentage: 0,
  });

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          setMessage("Please log in to view attendance.");
          return;
        }

        const user = JSON.parse(storedUser);

        const studentId = user._id || user.id;

        if (!studentId) {
          setMessage("Student ID was not found. Please log in again.");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/attendance/student/${studentId}`
        );

        setSummary(response.data.summary);
        setHistory(response.data.history);
      } catch (error) {
        console.error(
          "Student attendance error:",
          error.response?.data || error
        );

        setMessage(
          error.response?.data?.message ||
            "Unable to load attendance."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          Loading attendance...
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold">My Attendance</h2>

        <p className="text-muted">
          View your attendance summary and class history.
        </p>
      </div>

      {message && (
        <div className="alert alert-warning">{message}</div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3>{summary.totalClasses}</h3>
              <p className="mb-0 text-muted">Total Classes</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3 className="text-success">
                {summary.presentClasses}
              </h3>
              <p className="mb-0 text-muted">Present</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3 className="text-danger">
                {summary.absentClasses}
              </h3>
              <p className="mb-0 text-muted">Absent</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3 className="text-warning">
                {summary.percentage}%
              </h3>
              <p className="mb-0 text-muted">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {Number(summary.percentage) < 75 &&
        summary.totalClasses > 0 && (
          <div className="alert alert-danger">
            Your attendance is below 75%.
          </div>
        )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Attendance History</h5>
        </div>

        <div className="card-body p-0">
          {history.length === 0 ? (
            <div className="p-4 text-center text-muted">
              No attendance has been recorded yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Subject Code</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((record, index) => (
                    <tr key={`${record.attendanceId}-${index}`}>
                      <td>{index + 1}</td>

                      <td>
                        {record.subject?.subjectName ||
                          "Subject"}
                      </td>

                      <td>
                        {record.subject?.subjectCode || "-"}
                      </td>

                      <td>
                        {new Date(
                          record.date
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            record.status === "Present"
                              ? "bg-success"
                              : record.status === "Absent"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {record.status}
                        </span>
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
  );
}

export default Attendance;