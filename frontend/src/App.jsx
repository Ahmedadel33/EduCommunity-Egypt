import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import TeacherRating from "./pages/TeacherRating";
import Profile from "./pages/Profile";
import MaterialsPage from "./features/materials/MaterialsPage";
import ChatPage from "./features/chat/ChatPage";
import LessonsPage from "./features/lessons/LessonsPage";
import SoftSkillsPage from "./features/softskills/SoftSkillsPage";
import RewardsPage from "./features/rewards/RewardsPage";
import StudentDashboard from "./features/dashboard/StudentDashboard";
import TeacherDashboard from "./features/dashboard/TeacherDashboard";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import RoleHome from "./components/RoleHome";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}><TooltipProvider><AuthProvider><SocketProvider><Toaster /><Sonner /><BrowserRouter><Routes><Route path="/" element={<Landing />} /><Route path="/auth" element={<Auth />} />{
  /* أقسام عامة (تصفّح بدون تسجيل) */
}<Route path="/feed" element={<AppLayout><Feed /></AppLayout>} /><Route path="/challenges" element={<AppLayout><Challenges /></AppLayout>} /><Route path="/leaderboard" element={<AppLayout><Leaderboard /></AppLayout>} /><Route path="/teachers" element={<AppLayout><TeacherRating /></AppLayout>} />{
  /* أقسام تتطلب تسجيل دخول */
}<Route
  path="/materials"
  element={<ProtectedRoute><AppLayout><MaterialsPage /></AppLayout></ProtectedRoute>}
/><Route
  path="/profile"
  element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>}
/><Route
  path="/chat"
  element={<ProtectedRoute><AppLayout><ChatPage /></AppLayout></ProtectedRoute>}
/><Route
  path="/lessons"
  element={<ProtectedRoute><AppLayout><LessonsPage /></AppLayout></ProtectedRoute>}
/><Route
  path="/soft-skills"
  element={<ProtectedRoute><AppLayout><SoftSkillsPage /></AppLayout></ProtectedRoute>}
/><Route
  path="/rewards"
  element={<ProtectedRoute><AppLayout><RewardsPage /></AppLayout></ProtectedRoute>}
/><Route path="/dashboard" element={<RoleHome />} /><Route
  path="/student"
  element={<ProtectedRoute roles={["student"]}><AppLayout><StudentDashboard /></AppLayout></ProtectedRoute>}
/><Route
  path="/teacher"
  element={<ProtectedRoute roles={["teacher"]}><AppLayout><TeacherDashboard /></AppLayout></ProtectedRoute>}
/><Route
  path="/settings"
  element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>}
/><Route
  path="/help"
  element={<ProtectedRoute><AppLayout><Help /></AppLayout></ProtectedRoute>}
/><Route path="*" element={<NotFound />} /></Routes></BrowserRouter></SocketProvider></AuthProvider></TooltipProvider></QueryClientProvider>;
var App_default = App;
export {
  App_default as default
};
