import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Materials from "./pages/Materials.jsx";
import Attendance from "./pages/Attendance.jsx";
import Shifts from "./pages/Shifts.jsx";
import Users from "./pages/Users.jsx";
import Rewards from "./pages/Rewards.jsx";
import Lessons from "./pages/Lessons.jsx";
import Challenges from "./pages/Challenges.jsx";
import SoftSkills from "./pages/SoftSkills.jsx";

// حارس بسيط: لو مفيش توكن أدمن يرجّع لصفحة الدخول
function Guard({ children }) {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Guard><Dashboard /></Guard>} />
      <Route path="/materials" element={<Guard><Materials /></Guard>} />
      <Route path="/attendance" element={<Guard><Attendance /></Guard>} />
      <Route path="/shifts" element={<Guard><Shifts /></Guard>} />
      <Route path="/users" element={<Guard><Users /></Guard>} />
      <Route path="/rewards" element={<Guard><Rewards /></Guard>} />
      <Route path="/lessons" element={<Guard><Lessons /></Guard>} />
      <Route path="/challenges" element={<Guard><Challenges /></Guard>} />
      <Route path="/soft-skills" element={<Guard><SoftSkills /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
