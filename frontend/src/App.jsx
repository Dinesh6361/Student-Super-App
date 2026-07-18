import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import TeacherForgotPassword from "./pages/TeacherForgotPassword";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Timetable from "./pages/Timetable";
import Assignments from "./pages/Assignments";
import Notes from "./pages/Notes";
import AITutor from "./pages/AITutor";
import CodingPractice from "./pages/CodingPractice";
import PlacementPreparation from "./pages/PlacementPreparation";
import ResumeBuilder from "./pages/ResumeBuilder";
import MockInterview from "./pages/MockInterview";
import JobNotifications from "./pages/JobNotifications";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TeacherAttendance from "./pages/TeacherAttendance";
import Attendance from "./pages/Attendance";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherRegister from "./pages/TeacherRegister";
import TeacherDashboard from "./pages/TeacherDashboard";
function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />}/>
       
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/ai-tutor" element={<AITutor />} />
        <Route path="/coding-practice" element={<CodingPractice />} />
        <Route path="/placement" element={<PlacementPreparation />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/jobs" element={<JobNotifications />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />}/>
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-register" element={<TeacherRegister />} />
        <Route path="/teacher-forgot-password" element={<TeacherForgotPassword />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;