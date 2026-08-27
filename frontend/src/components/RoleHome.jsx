import { Navigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// بيوجّه كل مستخدم لداشبورده حسب دوره بعد تسجيل الدخول
function RoleHome() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جارٍ التحميل...</div>;
  }
  if (!user) return <Navigate to="/" replace />;

  // الأدمن ليه تطبيق منفصل — التطبيق ده للطلاب والمدرسين بس
  if (user.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F7FF]">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-extrabold text-slate-800">لوحة الأدمن في تطبيق منفصل</h1>
          <p className="text-sm text-slate-400 mt-2">
            هذا التطبيق مخصّص للطلاب والمدرسين. من فضلك ادخل من بوابة الإدارة.
          </p>
          <a href="http://localhost:5200" target="_blank" rel="noreferrer">
            <button className="w-full mt-4 bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm">
              فتح بوابة الإدارة
            </button>
          </a>
        </div>
      </div>
    );
  }

  if (user.role === "teacher") return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />; // الطالب (والافتراضي)
}

export default RoleHome;
