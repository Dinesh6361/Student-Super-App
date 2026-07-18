const API_URL = "http://localhost:5000/api/timetable";

export const addTimetableClass = async (timetableData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(timetableData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to add timetable class.");
  }

  return data;
};

export const getTimetable = async (semester, section, day = "") => {
  let url = `${API_URL}?semester=${semester}&section=${section}`;

  if (day) {
    url += `&day=${day}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch timetable.");
  }

  return data;
};

export const getStudentTimetable = async (semester, section) => {
  const response = await fetch(
    `${API_URL}/student?semester=${semester}&section=${section}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch student timetable.");
  }

  return data;
};

export const updateTimetableClass = async (id, timetableData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(timetableData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update timetable.");
  }

  return data;
};

export const deleteTimetableClass = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete timetable.");
  }

  return data;
};