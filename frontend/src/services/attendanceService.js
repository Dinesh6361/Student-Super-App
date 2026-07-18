import axios from "axios";

const API_URL = "http://localhost:5000/api/attendance";

// Get students using semester and section
export const getStudents = async (semester, section) => {
  const response = await axios.get(`${API_URL}/students`, {
    params: {
      semester,
      section,
    },
  });

  return response.data;
};

// Save attendance
export const saveAttendance = async (attendanceData) => {
  const response = await axios.post(API_URL, attendanceData);

  return response.data;
};